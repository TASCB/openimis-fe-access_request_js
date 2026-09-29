import React from 'react';
import { TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { RequestCard, useAR } from './common';

const useStyles = makeStyles((theme) => ({
  hint: { fontSize: 13, opacity: 0.8, marginBottom: theme.spacing(1.5) },
  foot: { fontSize: 12, opacity: 0.7, textAlign: 'right', marginTop: theme.spacing(1) },
}));

export default function DecisionNoteCard({ value, onChange, error }) {
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
      <Typography className={classes.foot}>{formatMessage('request.note.draft')}</Typography>
    </RequestCard>
  );
}
