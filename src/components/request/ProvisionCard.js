import React from 'react';
import { Grid, TextField } from '@material-ui/core';
import RolePicker from '../RolePicker';
import { RequestCard, useAR } from './common';

// Username + roles for the new account; the header's provision button submits them.
export default function ProvisionCard({
  username, onUsername, roleIds, onRoleIds,
}) {
  const { formatMessage } = useAR();
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
      </Grid>
    </RequestCard>
  );
}
