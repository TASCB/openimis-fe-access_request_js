import React from 'react';
import { useSelector } from 'react-redux';
import { Chip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import PersonAddOutlined from '@material-ui/icons/PersonAddOutlined';
import { roleIdOf } from '../RolePicker';
import { REQUEST_STATUS } from '../../constants';
import { RequestCard, personName, useAR } from './common';

const useStyles = makeStyles((theme) => ({
  step: { display: 'flex', gap: theme.spacing(1.5), position: 'relative', paddingBottom: theme.spacing(2.5) },
  rail: {
    position: 'absolute', left: 15, top: 34, bottom: 2, width: 2, background: theme.palette.divider,
  },
  dot: {
    width: 32,
    height: 32,
    flex: '0 0 32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    border: `2px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  dotActive: { background: theme.palette.primary.main, borderColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
  dotDone: { background: theme.palette.success.main, borderColor: theme.palette.success.main, color: '#fff' },
  dotFailed: { background: theme.palette.error.main, borderColor: theme.palette.error.main, color: '#fff' },
  dotFinal: { borderStyle: 'dashed' },
  head: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap', minHeight: 32,
  },
  label: { fontWeight: 600 },
  muted: { fontSize: 13, opacity: 0.8 },
  chip: { height: 22, fontSize: 12 },
  chipActive: { borderColor: theme.palette.warning.main, color: theme.palette.warning.main },
  decision: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    borderLeft: `3px solid ${theme.palette.divider}`,
    fontSize: 13,
  },
  comment: { whiteSpace: 'pre-wrap', marginTop: 2 },
  hint: { fontSize: 12, opacity: 0.8 },
}));

const STEP_CHIP = {
  PENDING: 'request.chain.awaiting', APPROVED: 'request.chain.approved', REJECTED: 'request.chain.rejected', RETURNED: 'request.chain.returned',
};

export default function ApprovalChainCard({ request, detailed = false }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues, formatDateTimeFromISO } = useAR();
  const roles = useSelector((s) => s.access_request?.roles ?? []);
  const { approval } = request;
  const steps = approval?.steps || [];

  const roleName = (id) => (id ? roles.find((r) => roleIdOf(r) === id)?.name : null);

  const stepState = (s) => {
    if (s.status === 'APPROVED') return 'done';
    if (s.status === 'REJECTED' || s.status === 'RETURNED') return 'failed';
    if (approval.status === 'PENDING' && s.order === approval.currentStepOrder) return 'active';
    return 'waiting';
  };

  const renderDecision = (d) => (
    <div key={d.uuid} className={classes.decision}>
      <b>{formatMessage(`request.decision.${d.decision}`)}</b>
      {' · '}
      {personName(d.approver)}
      {d.decidedAt ? ` · ${formatDateTimeFromISO(d.decidedAt)}` : ''}
      {!!d.comment && <div className={classes.comment}>{d.comment}</div>}
    </div>
  );

  const provisioned = request.status === REQUEST_STATUS.PROVISIONED;
  const rejected = request.status === REQUEST_STATUS.REJECTED;

  return (
    <RequestCard
      title={formatMessage('request.chain.title')}
      action={<span className={classes.hint}>{formatMessage('request.chain.sequential')}</span>}
    >
      {!approval && <Typography className={classes.muted}>{formatMessage('request.chain.none')}</Typography>}
      {steps.map((s) => {
        const state = stepState(s);
        const decisions = s.decisions || [];
        const last = decisions[decisions.length - 1];
        const role = roleName(s.assignedRoleId);
        let dotClass = '';
        if (state === 'active') dotClass = classes.dotActive;
        else if (state === 'done') dotClass = classes.dotDone;
        else if (state === 'failed') dotClass = classes.dotFailed;
        let line;
        if (state === 'active') {
          line = formatMessageWithValues('request.chain.openedAwaiting', {
            opened: s.dateCreated ? formatDateTimeFromISO(s.dateCreated) : '—',
          });
        } else if (state === 'waiting') {
          line = formatMessage(s.order === 1 ? 'request.chain.notStarted' : 'request.chain.unlocksAfter');
        } else if (last) {
          line = `${personName(last.approver)} · ${last.decidedAt ? formatDateTimeFromISO(last.decidedAt) : ''}`;
        }
        return (
          <div key={s.uuid} className={classes.step}>
            <span className={classes.rail} />
            <span className={`${classes.dot} ${dotClass}`}>
              {state === 'done' && <Check fontSize="small" />}
              {state === 'failed' && <Close fontSize="small" />}
              {(state === 'active' || state === 'waiting') && s.order}
            </span>
            <div>
              <div className={classes.head}>
                <span className={classes.label}>{s.label || s.code}</span>
                <Chip
                  size="small"
                  variant="outlined"
                  className={`${classes.chip} ${state === 'active' ? classes.chipActive : ''}`}
                  label={formatMessage(state === 'waiting' ? 'request.chain.notStartedChip' : STEP_CHIP[s.status])}
                />
              </div>
              <div className={classes.muted}>
                {role ? `${formatMessageWithValues('request.chain.assignedTo', { role })} · ` : ''}
                {line}
              </div>
              {!detailed && !!last?.comment && <div className={classes.decision}><div className={classes.comment}>{last.comment}</div></div>}
              {detailed && decisions.map(renderDecision)}
            </div>
          </div>
        );
      })}
      {!!approval && (
        <div className={classes.step} style={{ paddingBottom: 0 }}>
          <span className={`${classes.dot} ${classes.dotFinal} ${provisioned ? classes.dotDone : ''}`}>
            {provisioned ? <Check fontSize="small" /> : <PersonAddOutlined fontSize="small" />}
          </span>
          <div>
            <div className={classes.head}>
              <span className={classes.label}>{formatMessage('request.chain.provisioned')}</span>
            </div>
            <div className={classes.muted}>
              {provisioned
                ? formatMessageWithValues('request.chain.provisionedDone', { username: request.assignedUsername || '' })
                : formatMessage(rejected ? 'request.chain.provisionedNever' : 'request.chain.provisionedHint')}
            </div>
          </div>
        </div>
      )}
    </RequestCard>
  );
}
