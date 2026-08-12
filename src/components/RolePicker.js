import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chip, FormControl, InputLabel, MenuItem, Select, Checkbox, ListItemText, FormHelperText,
} from '@material-ui/core';
import { decodeId } from '@openimis/fe-core';

import { fetchAssignableRoles } from '../actions';

// node.id is a relay global id; the provision mutation takes the integer Role id.
export const roleIdOf = (role) => parseInt(decodeId(role.id), 10);

const RolePicker = ({
  value = [], onChange, label, helperText, required,
}) => {
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.access_request?.roles ?? []);
  const fetching = useSelector((state) => state.access_request?.fetchingRoles ?? false);

  useEffect(() => {
    if (!roles.length && !fetching) dispatch(fetchAssignableRoles());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectable = roles.filter((r) => !r.isBlocked);
  const nameOf = (id) => selectable.find((r) => roleIdOf(r) === id)?.name ?? id;

  return (
    <FormControl fullWidth required={required}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        multiple
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) => (selected.length
          ? selected.map((id) => <Chip key={id} size="small" label={nameOf(id)} style={{ marginRight: 4 }} />)
          : '')}
      >
        {selectable.map((r) => {
          const id = roleIdOf(r);
          return (
            <MenuItem key={id} value={id}>
              <Checkbox checked={value.includes(id)} color="primary" />
              <ListItemText primary={r.name} secondary={r.isSystem ? 'system role' : null} />
            </MenuItem>
          );
        })}
      </Select>
      {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RolePicker;
