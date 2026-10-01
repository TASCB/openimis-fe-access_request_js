import React from 'react';
import {
  Chip, Divider, Grid, IconButton, Paper, Tab, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AccessRequestStatusChip from '../AccessRequestStatusChip';
import { useAR } from './common';

const useStyles = makeStyles((theme) => ({
  paper: { ...theme.paper.paper, margin: 0, marginBottom: theme.spacing(2) },
  paperHeader: theme.paper.header,
  titleRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1) },
  typeChip: { fontWeight: 600, letterSpacing: 0.5 },
  tableTitle: theme.table.title,
  tabs: { display: 'flex', alignItems: 'center' },
  selectedTab: { borderBottom: '4px solid white' },
  unselectedTab: { borderBottom: '4px solid transparent' },
  stepText: { fontSize: 12, marginLeft: 'auto', padding: theme.spacing(0, 2) },
}));

export const TABS = ['overview', 'history'];

export default function RequestHeader({
  request, step, stepTotal, tab, onTab, onBack, canProvision,
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

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
        <Grid item xs={12}>
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
      </Grid>
      <Divider />
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        {TABS.map((t) => (
          <Tab
            key={t}
            value={t}
            selected={tab === t}
            onChange={(_, v) => onTab(v)}
            className={tab === t ? classes.selectedTab : classes.unselectedTab}
            label={formatMessage(`request.tab.${t}`)}
          />
        ))}
        {!!stepText && <span className={classes.stepText}>{stepText}</span>}
      </Grid>
    </Paper>
  );
}
