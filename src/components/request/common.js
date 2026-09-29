import React from 'react';
import {
  Divider, Grid, Paper, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, REQUEST_STATUS } from '../../constants';

export const RIGHT_APPROVAL_OVERRIDE = '240303';

export function useAR() {
  const modulesManager = useModulesManager();
  return { modulesManager, ...useTranslations(MODULE_NAME, modulesManager) };
}

export const personName = (user) => {
  if (!user) return '';
  const full = [user.otherNames, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.username || '';
};

export const initials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2)
  .map((w) => w[0].toUpperCase())
  .join('');

// The pending step the approval is waiting on, or null once the engine is done with it.
export function currentStep(approval) {
  if (!approval || approval.status !== 'PENDING') return null;
  return (approval.steps || []).find((s) => s.order === approval.currentStepOrder && s.status === 'PENDING') || null;
}

export function canDecide(step, rights) {
  if (!step) return false;
  const held = rights.map(String);
  return held.includes(RIGHT_APPROVAL_OVERRIDE) || !step.requiredRight || held.includes(String(step.requiredRight));
}

export const isClosed = (status) => [REQUEST_STATUS.PROVISIONED, REQUEST_STATUS.REJECTED].includes(status);

const useCardStyles = makeStyles((theme) => ({
  paper: { ...theme.paper.paper, margin: 0, marginBottom: theme.spacing(2) },
  title: {
    ...theme.paper.title,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(1.25, 2),
  },
  body: { padding: theme.spacing(2) },
}));

export function RequestCard({
  title, action = null, children, bodyClassName,
}) {
  const classes = useCardStyles();
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{title}</Typography>
        {action}
      </div>
      <Divider />
      <div className={bodyClassName || classes.body}>{children}</div>
    </Paper>
  );
}

const useFieldStyles = makeStyles((theme) => ({
  label: { fontSize: 12, opacity: 0.75, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: 500, wordBreak: 'break-word' },
  missing: {
    fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8,
  },
  mono: { fontFamily: theme.typography.fontFamilyMono || 'monospace', fontSize: 13 },
}));

export function InfoField({
  label, value, missing, mono = false, xs = 12, sm = 4,
}) {
  const classes = useFieldStyles();
  return (
    <Grid item xs={xs} sm={sm}>
      <div className={classes.label}>{label}</div>
      {value
        ? <div className={`${classes.value} ${mono ? classes.mono : ''}`}>{value}</div>
        : <div className={classes.missing}>{missing || '—'}</div>}
    </Grid>
  );
}
