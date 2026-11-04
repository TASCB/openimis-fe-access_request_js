import React, { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, MenuItem, Switch, TextField,
} from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import { suggestedRoleIds } from '../utils/profiles';
import RolePicker from './RolePicker';

const EMPTY = {
  uuid: null, code: '', name: '', description: '', sectionGroupId: '', roleIds: [], isActive: true,
};

const toForm = (p) => (p ? {
  uuid: p.uuid,
  code: p.code || '',
  name: p.name || '',
  description: p.description || '',
  sectionGroupId: p.sectionGroupId || '',
  roleIds: suggestedRoleIds(p),
  isActive: !!p.isActive,
} : EMPTY);

export default function AccessProfileDialog({
  open, profile, sections, onClose, onSave, submitting,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { if (open) setForm(toForm(profile)); }, [open, profile]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const isNew = !form.uuid;
  const valid = !!form.code.trim() && !!form.name.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formatMessage(isNew ? 'profiles.dialog.add' : 'profiles.dialog.edit')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth required disabled={!isNew}
              label={formatMessage('profiles.code')}
              value={form.code}
              onChange={(e) => set('code')(e.target.value)}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth required
              label={formatMessage('profiles.name')}
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth multiline
              label={formatMessage('profiles.description')}
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label={formatMessage('profiles.section')}
              helperText={formatMessage('profiles.section.help')}
              value={form.sectionGroupId}
              onChange={(e) => set('sectionGroupId')(e.target.value)}
            >
              <MenuItem value="">{formatMessage('profiles.section.any')}</MenuItem>
              {(sections || []).map((s) => (
                <MenuItem key={s.sectionId} value={s.sectionId}>{s.sectionName}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <RolePicker
              label={formatMessage('profiles.roles')}
              helperText={formatMessage('profiles.roles.help')}
              value={form.roleIds}
              onChange={set('roleIds')}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={(
                <Switch
                  color="primary"
                  checked={form.isActive}
                  onChange={(e) => set('isActive')(e.target.checked)}
                />
              )}
              label={formatMessage('profiles.isActive.help')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{formatMessage('profiles.cancel')}</Button>
        <Button
          color="primary" variant="contained" disableElevation
          disabled={!valid || submitting}
          onClick={() => onSave({ ...form, code: form.code.trim(), name: form.name.trim() })}
        >
          {formatMessage('profiles.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
