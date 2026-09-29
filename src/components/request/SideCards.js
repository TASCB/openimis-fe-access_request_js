import React from 'react';
import {
  Avatar, Chip, LinearProgress, Paper, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HourglassEmpty from '@material-ui/icons/HourglassEmpty';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import HighlightOff from '@material-ui/icons/HighlightOff';
import PersonAddOutlined from '@material-ui/icons/PersonAddOutlined';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import {
  REQUEST_STATUS, REQUEST_TYPE, USER_CATEGORY,
} from '../../constants';
import {
  RequestCard, initials, isClosed, useAR,
} from './common';

const useStyles = makeStyles((theme) => ({
  statusPaper: {
    ...theme.paper.paper,
    margin: 0,
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderTop: `3px solid ${theme.palette.primary.main}`,
  },
  statusRow: { display: 'flex', gap: theme.spacing(1.5), alignItems: 'flex-start' },
  statusIcon: {
    width: 40,
    height: 40,
    flex: '0 0 40px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.primary.main,
    background: theme.palette.background.paper,
  },
  statusTitle: { fontWeight: 700 },
  muted: { fontSize: 13, opacity: 0.8 },
  progress: { marginTop: theme.spacing(2), height: 6, borderRadius: 3 },
  progressLabels: {
    display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8, marginTop: theme.spacing(0.75),
  },
  check: { display: 'flex', gap: theme.spacing(1.25), padding: theme.spacing(1, 0) },
  checkTitle: { fontWeight: 600, fontSize: 14 },
  ok: { color: theme.palette.success.main },
  warn: { color: theme.palette.warning.main },
  info: { color: theme.palette.primary.main },
  countChip: { height: 22, fontSize: 12, borderColor: theme.palette.warning.main, color: theme.palette.warning.main },
  person: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5) },
  avatar: { background: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontSize: 14 },
  tech: {
    display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: theme.spacing(2), rowGap: theme.spacing(1), fontSize: 12,
  },
  techLabel: { opacity: 0.75 },
  mono: { fontFamily: 'monospace', wordBreak: 'break-all' },
}));

export function StatusCard({ request, step, stepTotal }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useAR();
  const steps = request.approval?.steps || [];
  const approved = steps.filter((s) => s.status === 'APPROVED').length;

  let key = 'pending';
  let Icon = HourglassEmpty;
  if (request.status === REQUEST_STATUS.ICT_APPROVED) { key = 'ready'; Icon = PersonAddOutlined; }
  if (request.status === REQUEST_STATUS.PROVISIONED) { key = 'provisioned'; Icon = CheckCircleOutline; }
  if (request.status === REQUEST_STATUS.REJECTED) { key = 'rejected'; Icon = HighlightOff; }
  if (request.status === REQUEST_STATUS.FAILED) { key = 'failed'; Icon = ErrorOutline; }

  const total = stepTotal || steps.length || 1;
  const value = request.status === REQUEST_STATUS.PROVISIONED ? 100 : Math.round((approved / total) * 100);

  return (
    <Paper className={classes.statusPaper}>
      <div className={classes.statusRow}>
        <span className={classes.statusIcon}><Icon /></span>
        <div>
          <div className={classes.statusTitle}>{formatMessage(`request.statusCard.${key}.title`)}</div>
          <div className={classes.muted}>
            {step
              ? formatMessageWithValues('request.statusCard.pending.body', { label: step.label })
              : formatMessage(`request.statusCard.${key}.body`)}
          </div>
        </div>
      </div>
      {steps.length > 0 && (
        <>
          <LinearProgress variant="determinate" value={value} className={classes.progress} />
          <div className={classes.progressLabels}>
            {steps.map((s) => <span key={s.uuid}>{`${formatMessageWithValues('request.statusCard.step', { n: s.order })} · ${s.label}`}</span>)}
          </div>
        </>
      )}
    </Paper>
  );
}

// Advisory checks for the reviewer. None of them block a decision: the engine and the
// provisioning service enforce the real rules; these only flag what deserves a second look.
function checksFor(request, f, fv) {
  const checks = [];
  const logins = request.existingUserLogins || [];
  const isActivate = request.requestType === REQUEST_TYPE.ACTIVATE;
  if (!isActivate && logins.length) {
    checks.push({ level: 'warn', title: f('request.check.emailInUse.title'), body: fv('request.check.emailInUse.body', { logins: logins.join(', ') }) });
  } else if (isActivate && !logins.length) {
    checks.push({ level: 'warn', title: f('request.check.noAccount.title'), body: fv('request.check.noAccount.body', { email: request.email }) });
  } else if (isActivate) {
    checks.push({ level: 'ok', title: f('request.check.accountFound.title'), body: fv('request.check.accountFound.body', { logins: logins.join(', ') }) });
  } else {
    checks.push({ level: 'ok', title: f('request.check.emailUnique.title'), body: fv('request.check.emailUnique.body', { email: request.email }) });
  }

  const missing = [];
  if (!request.section) missing.push(f('field.section'));
  if (request.userCategory === USER_CATEGORY.OTHER) {
    if (!request.organizationPaa) missing.push(f('field.organizationPaa'));
    if (!request.designation) missing.push(f('field.designation'));
  }
  if (request.userCategory === USER_CATEGORY.PAA_STAFF && !request.requestedLocation) missing.push(f('field.requestedLocation'));
  if (missing.length) {
    checks.push({ level: 'warn', title: fv('request.check.missing.title', { fields: missing.join(', ') }), body: f('request.check.missing.body') });
  } else {
    checks.push({ level: 'ok', title: f('request.check.complete.title'), body: f('request.check.complete.body') });
  }

  if (!request.phone) {
    checks.push({ level: 'info', title: f('request.check.noPhone.title'), body: f('request.check.noPhone.body') });
  }
  if (!request.profile) {
    checks.push({ level: 'info', title: f('request.check.noProfile.title'), body: f('request.check.noProfile.body') });
  }
  return checks;
}

export function ChecklistCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useAR();
  if (isClosed(request.status)) return null;
  const checks = checksFor(request, formatMessage, formatMessageWithValues);
  const toReview = checks.filter((c) => c.level === 'warn').length;
  const icon = {
    ok: <CheckCircleOutline className={classes.ok} fontSize="small" />,
    warn: <ErrorOutline className={classes.warn} fontSize="small" />,
    info: <InfoOutlined className={classes.info} fontSize="small" />,
  };
  return (
    <RequestCard
      title={formatMessage(request.status === REQUEST_STATUS.ICT_APPROVED ? 'request.check.titleProvision' : 'request.check.title')}
      action={toReview > 0 && (
        <Chip size="small" variant="outlined" className={classes.countChip} label={formatMessageWithValues('request.check.toReview', { n: toReview })} />
      )}
    >
      {checks.map((c) => (
        <div key={c.title} className={classes.check}>
          {icon[c.level]}
          <div>
            <div className={classes.checkTitle}>{c.title}</div>
            <div className={classes.muted}>{c.body}</div>
          </div>
        </div>
      ))}
    </RequestCard>
  );
}

export function ApplicantCard({ request }) {
  const classes = useStyles();
  const { formatMessage } = useAR();
  const detail = [
    request.designation,
    request.userCategory && formatMessage(`userCategory.${request.userCategory}`),
    request.section,
  ].filter(Boolean).join(' · ');
  return (
    <RequestCard title={formatMessage('request.applicant.title')}>
      <div className={classes.person}>
        <Avatar className={classes.avatar}>{initials(request.fullName)}</Avatar>
        <div>
          <div className={classes.checkTitle}>{request.fullName}</div>
          <div className={classes.muted}>{detail}</div>
          <div className={classes.muted}>{request.email}</div>
        </div>
      </div>
    </RequestCard>
  );
}

export function TechnicalCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatDateTimeFromISO } = useAR();
  const a = request.approval;
  if (!a) return null;
  const rows = [
    ['request.tech.flow', a.flow?.code],
    ['request.tech.model', a.entityModel],
    ['request.tech.entityId', a.objectId],
    ['request.tech.approvalId', a.uuid],
    ['request.tech.created', a.requestedAt && formatDateTimeFromISO(a.requestedAt)],
    ['request.tech.completed', a.completedAt && formatDateTimeFromISO(a.completedAt)],
  ].filter(([, v]) => !!v);
  return (
    <RequestCard title={formatMessage('request.tech.title')}>
      <div className={classes.tech}>
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <Typography component="span" className={`${classes.techLabel}`} style={{ fontSize: 12 }}>{formatMessage(k)}</Typography>
            <span className={classes.mono}>{v}</span>
          </React.Fragment>
        ))}
      </div>
    </RequestCard>
  );
}
