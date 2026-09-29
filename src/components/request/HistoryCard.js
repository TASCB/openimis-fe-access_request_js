import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { REQUEST_STATUS } from '../../constants';
import { RequestCard, personName, useAR } from './common';

const useStyles = makeStyles((theme) => ({
  row: {
    display: 'grid',
    gridTemplateColumns: '170px 1fr',
    gap: theme.spacing(2),
    padding: theme.spacing(1.25, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': { borderBottom: 0 },
  },
  when: { fontSize: 13, opacity: 0.8 },
  what: { fontWeight: 600, fontSize: 14 },
  comment: { fontSize: 13, whiteSpace: 'pre-wrap', marginTop: 2 },
}));

// Only what is actually recorded: the submission and every engine decision, oldest first.
export default function HistoryCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues, formatDateTimeFromISO } = useAR();

  const events = [{
    at: request.dateCreated,
    what: formatMessage('request.history.submitted'),
    who: request.fullName,
  }];
  (request.approval?.steps || []).forEach((s) => (s.decisions || []).forEach((d) => events.push({
    at: d.decidedAt,
    what: formatMessageWithValues('request.history.decision', {
      decision: formatMessage(`request.decision.${d.decision}`), step: s.label || s.code,
    }),
    who: personName(d.approver),
    comment: d.comment,
  })));
  events.sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));

  return (
    <RequestCard title={formatMessage('request.tab.history')}>
      {events.map((e) => (
        <div key={`${e.at}-${e.what}`} className={classes.row}>
          <span className={classes.when}>{e.at ? formatDateTimeFromISO(e.at) : '—'}</span>
          <div>
            <div className={classes.what}>{e.what}</div>
            {!!e.who && <Typography variant="body2">{e.who}</Typography>}
            {!!e.comment && <div className={classes.comment}>{e.comment}</div>}
          </div>
        </div>
      ))}
      {request.status === REQUEST_STATUS.PROVISIONED && (
        <div className={classes.row}>
          <span className={classes.when}>—</span>
          <div className={classes.what}>
            {formatMessageWithValues('request.chain.provisionedDone', { username: request.assignedUsername || '' })}
          </div>
        </div>
      )}
    </RequestCard>
  );
}
