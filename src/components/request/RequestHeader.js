import React from 'react';
import {
  Button, Chip, Divider, Grid, IconButton, Paper, Tab, Tabs, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Check from '@material-ui/icons/Check';
import PersonAdd from '@material-ui/icons/PersonAdd';
import AccessRequestStatusChip from '../AccessRequestStatusChip';
import { useAR } from './common';

// Same building blocks as fe-core's <Form> header (paper / paper.header / paper.action),
// plus the request's chips, decision actions and the tab row.
const useStyles = makeStyles((theme) => ({
  paper: { ...theme.paper.paper, margin: 0, marginBottom: theme.spacing(2) },
  paperHeader: theme.paper.header,
  paperHeaderAction: theme.paper.action,
  titleRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1) },
  typeChip: { fontWeight: 600, letterSpacing: 0.5 },
  tabRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: theme.spacing(0, 2),
  },
  tabs: { minHeight: 40 },
  tab: { minHeight: 40, minWidth: 0, padding: theme.spacing(0, 1.5), textTransform: 'none', fontWeight: 600 },
  stepText: { fontSize: 12, padding: theme.spacing(1, 0) },
}));

export const TABS = ['overview', 'approvals', 'history'];

export default function RequestHeader({
  request, step, stepTotal, tab, onTab, onBack,
  canDecide, onApprove, onReject, canProvision, provisionReady, onProvision, submitting,
}) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useAR();

  let stepText = null;
  if (step) {
    stepText = formatMessageWithValues('request.header.step', {
      n: step.order, total: stepTotal, label: step.label,
    });
  } else if (canProvision) {
    stepText = formatMessage('request.header.readyToProvision');
  }

  const actions = [];
  if (canDecide) {
    actions.push(
      <Button color="primary" disabled={submitting} onClick={onReject}>
        {formatMessage('request.action.reject')}
      </Button>,
      <Button variant="contained" color="primary" startIcon={<Check />} disabled={submitting} onClick={onApprove}>
        {formatMessage('request.action.approve')}
      </Button>,
    );
  }
  if (canProvision) {
    actions.push(
      <Button variant="contained" color="primary" startIcon={<PersonAdd />} disabled={submitting || !provisionReady} onClick={onProvision}>
        {formatMessage('action.provision')}
      </Button>,
    );
  }

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
        <Grid item xs={12} md={7}>
          <div className={classes.titleRow}>
            <Tooltip title={formatMessage('request.header.back')}>
              <IconButton onClick={onBack}><ChevronLeftIcon /></IconButton>
            </Tooltip>
            <Typography variant="h6">
              {formatMessageWithValues('request.pageTitle', { code: request.referenceCode })}
            </Typography>
            <AccessRequestStatusChip status={request.status} />
            {!!request.requestType && (
              <Chip size="small" variant="outlined" color="primary" className={classes.typeChip} label={request.requestType} />
            )}
          </div>
        </Grid>
        <Grid item xs={12} md={5}>
          <Grid container justifyContent="flex-end">
            {actions.map((a, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid item key={`request-action-${idx}`} className={classes.paperHeaderAction}>{a}</Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      <div className={classes.tabRow}>
        <Tabs value={tab} onChange={(e, v) => onTab(v)} indicatorColor="primary" textColor="primary" className={classes.tabs}>
          {TABS.map((t) => (
            <Tab key={t} value={t} className={classes.tab} label={formatMessage(`request.tab.${t}`)} />
          ))}
        </Tabs>
        {!!stepText && <span className={classes.stepText}>{stepText}</span>}
      </div>
    </Paper>
  );
}
