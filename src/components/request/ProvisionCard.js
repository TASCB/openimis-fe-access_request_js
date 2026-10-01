import React from 'react';
import { Button, Grid, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PersonAdd from '@material-ui/icons/PersonAdd';
import { PublishedComponent } from '@openimis/fe-core';
import RolePicker from '../RolePicker';
import { REQUEST_TYPE } from '../../constants';
import { RequestCard, useAR } from './common';

const useStyles = makeStyles((theme) => ({
  foot: { display: 'flex', justifyContent: 'flex-end', marginTop: theme.spacing(2) },
  help: { fontSize: 12, opacity: 0.7, marginTop: theme.spacing(0.5) },
}));

// Username + roles for the new account; the header's provision button submits them.
export default function ProvisionCard({
  username, onUsername, roleIds, onRoleIds, districts, onDistricts, requestType, onProvision, submitting,
}) {
  const classes = useStyles();
  const { formatMessage } = useAR();
  const ready = !!username.trim() && roleIds.length > 0;
  const actionKey = requestType === REQUEST_TYPE.ACTIVATE ? 'action.activateAccount' : 'action.createAccount';
  return (
    <RequestCard title={formatMessage('request.provision')}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label={formatMessage('field.username')}
            helperText={formatMessage('field.username.help')}
            inputProps={{ maxLength: 8 }}
            value={username}
            onChange={(e) => onUsername(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <RolePicker
            required
            label={formatMessage('field.roles')}
            helperText={formatMessage('field.roles.help')}
            value={roleIds}
            onChange={onRoleIds}
          />
        </Grid>
        <Grid item xs={12}>
          <PublishedComponent
            pubRef="location.LocationPicker"
            locationLevel={1}
            multiple
            withLabel
            label={formatMessage('field.districts')}
            value={districts}
            onChange={(v) => onDistricts(v || [])}
          />
          <div className={classes.help}>{formatMessage('field.districts.help')}</div>
        </Grid>
      </Grid>
      <div className={classes.foot}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          disabled={submitting || !ready}
          onClick={onProvision}
        >
          {formatMessage(actionKey)}
        </Button>
      </div>
    </RequestCard>
  );
}
