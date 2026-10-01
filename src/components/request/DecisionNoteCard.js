import React from 'react';
import { Button, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import { RequestCard, useAR } from './common';

const useStyles = makeStyles((theme) => ({
  hint: { fontSize: 13, opacity: 0.8, marginBottom: theme.spacing(1.5) },
  foot: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginTop: theme.spacing(1),
  },
  draft: { fontSize: 12, opacity: 0.7, marginRight: 'auto' },
}));

export default function DecisionNoteCard({
  value, onChange, error, onApprove, onReject, submitting,
}) {
  const classes = useStyles();
  const { formatMessage } = useAR();
  return (
    <RequestCard title={formatMessage('request.note.title')}>
      <Typography className={classes.hint}>{formatMessage('request.note.hint')}</Typography>
      <TextField
        multiline
        rows={3}
        fullWidth
        variant="outlined"
        placeholder={formatMessage('request.note.placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error || ' '}
        inputProps={{ maxLength: 2000 }}
      />
      <div className={classes.foot}>
        <Typography className={classes.draft}>{formatMessage('request.note.draft')}</Typography>
        <Button color="primary" disabled={submitting} onClick={onReject}>
          {formatMessage('request.action.reject')}
        </Button>
        <Button variant="contained" color="primary" startIcon={<Check />} disabled={submitting} onClick={onApprove}>
          {formatMessage('request.action.approve')}
        </Button>
      </div>
    </RequestCard>
  );
}
