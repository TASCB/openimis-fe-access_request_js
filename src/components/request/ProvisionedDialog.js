import React, { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { historyPush, useHistory } from '@openimis/fe-core';
import { useAR } from './common';

const useStyles = makeStyles((theme) => ({
  label: { fontSize: 12, opacity: 0.7, marginTop: theme.spacing(1) },
  value: { fontFamily: 'monospace', fontSize: 18, fontWeight: 600 },
  passwordRow: { display: 'flex', alignItems: 'center', gap: theme.spacing(1) },
  note: { fontSize: 13, marginTop: theme.spacing(2) },
}));

export default function ProvisionedDialog({
  open, username, password, userId, onClose,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { modulesManager, formatMessage } = useAR();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(password).then(() => setCopied(true)).catch(() => {});
  };
  const openUser = () => {
    onClose();
    historyPush(modulesManager, history, 'admin.userOverview', [userId]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{formatMessage('provisioned.title')}</DialogTitle>
      <DialogContent>
        <Typography className={classes.label}>{formatMessage('provisioned.username')}</Typography>
        <Typography className={classes.value}>{username}</Typography>
        {password ? (
          <>
            <Typography className={classes.label}>{formatMessage('provisioned.password')}</Typography>
            <div className={classes.passwordRow}>
              <Typography className={classes.value}>{password}</Typography>
              <Button size="small" color="primary" onClick={copy}>
                {formatMessage(copied ? 'provisioned.copied' : 'provisioned.copy')}
              </Button>
            </div>
            <Typography className={classes.note}>{formatMessage('provisioned.passwordNote')}</Typography>
          </>
        ) : (
          <Typography className={classes.note}>{formatMessage('provisioned.noPassword')}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {!!userId && <Button color="primary" onClick={openUser}>{formatMessage('provisioned.openUser')}</Button>}
        <Button variant="contained" color="primary" onClick={onClose}>{formatMessage('provisioned.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
