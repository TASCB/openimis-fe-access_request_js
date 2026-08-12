import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Paper, Grid, Typography, Button, TextField, Chip,
} from '@material-ui/core';
import {
  useModulesManager, useTranslations, journalize,
} from '@openimis/fe-core';
import RolePicker from '../components/RolePicker';
import {
  fetchAccessRequest, provisionAccessRequest,
} from '../actions';
import {
  MODULE_NAME, RIGHT_ICT_APPROVE,
  REQUEST_STATUS, STATUS_COLOR,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  page: { padding: theme.spacing(3) },
  paper: { padding: theme.spacing(3), marginBottom: theme.spacing(2) },
  label: { color: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 },
  value: { fontSize: 15, marginBottom: theme.spacing(1) },
  actions: { display: 'flex', gap: 12, marginTop: theme.spacing(2), flexWrap: 'wrap' },
}));

function Field({ label, value }) {
  const classes = useStyles();
  return (
    <Grid item xs={12} sm={6} md={4}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>{value || '—'}</div>
    </Grid>
  );
}

export default function AccessRequestPage({ match }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const id = match?.params?.access_request_id;

  // fe-core does not pass `rights` to route components — read it from redux.
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const request = useSelector((s) => s.access_request?.request);
  const mutation = useSelector((s) => s.access_request?.mutation);
  const submitting = useSelector((s) => s.access_request?.submittingMutation);

  const [username, setUsername] = useState('');
  const [roleIds, setRoleIds] = useState([]);
  const [prevSubmitting, setPrevSubmitting] = useState(false);

  useEffect(() => { if (id) dispatch(fetchAccessRequest(id)); }, [id, dispatch]);

  // refresh after a mutation resolves
  useEffect(() => {
    if (prevSubmitting && !submitting) {
      dispatch(journalize(mutation));
      if (id) dispatch(fetchAccessRequest(id));
    }
    setPrevSubmitting(submitting);
  }, [submitting]);

  if (!request) return <div className={classes.page}><Typography>{formatMessage('loading')}</Typography></div>;

  const label = (action) => formatMessage(`mutation.${action}`);
  const canIct = rights.includes(RIGHT_ICT_APPROVE);

  const doProvision = () => dispatch(provisionAccessRequest(
    id, username, roleIds, null, label('provision'),
  ));

  const s = request.status;

  return (
    <div className={classes.page}>
      <Typography variant="h5" gutterBottom>
        {formatMessage('request.title')} — {request.referenceCode}
        {'  '}
        <Chip
          size="small"
          label={formatMessage(`status.${s}`)}
          style={{ background: STATUS_COLOR[s] || '#607d8b', color: '#fff', marginLeft: 8 }}
        />
      </Typography>

      <Paper className={classes.paper}>
        <Typography variant="subtitle1" gutterBottom>{formatMessage('request.requester')}</Typography>
        <Grid container spacing={2}>
          <Field label={formatMessage('field.requestType')} value={formatMessage(`requestType.${request.requestType}`)} />
          <Field label={formatMessage('field.fullName')} value={request.fullName} />
          <Field
            label={formatMessage('field.userCategory')}
            value={request.userCategory ? formatMessage(`userCategory.${request.userCategory}`) : null}
          />
          <Field
            label={formatMessage('field.administrativeLevel')}
            value={request.administrativeLevel ? formatMessage(`adminLevel.${request.administrativeLevel}`) : null}
          />
          <Field label={formatMessage('field.section')} value={request.section} />
          <Field label={formatMessage('field.organizationPaa')} value={request.organizationPaa} />
          <Field label={formatMessage('field.designation')} value={request.designation} />
          <Field label={formatMessage('field.email')} value={request.email} />
          <Field label={formatMessage('field.phone')} value={request.phone} />
          <Field label={formatMessage('field.profile')} value={request.profile?.name} />
          <Field label={formatMessage('field.requestedLocation')} value={request.requestedLocation?.name} />
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <Typography variant="subtitle1" gutterBottom>{formatMessage('request.approvals')}</Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('request.approvals.engineNote')}
        </Typography>
      </Paper>

      {canIct && s === REQUEST_STATUS.ICT_APPROVED && (
        <Paper className={classes.paper}>
          <Typography variant="subtitle1" gutterBottom>{formatMessage('request.provision')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={formatMessage('field.username')}
                helperText={formatMessage('field.username.help')}
                inputProps={{ maxLength: 8 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <RolePicker
                required
                label={formatMessage('field.roles')}
                helperText={formatMessage('field.roles.help')}
                value={roleIds}
                onChange={setRoleIds}
              />
            </Grid>
          </Grid>
          <div className={classes.actions}>
            <Button
              variant="contained"
              color="primary"
              disabled={submitting || !username || !roleIds.length}
              onClick={doProvision}
            >
              {formatMessage('action.provision')}
            </Button>
          </div>
        </Paper>
      )}

      {s === REQUEST_STATUS.PROVISIONED && (
        <Paper className={classes.paper}>
          <Typography>
            {formatMessage('request.provisioned')}
            {': '}
            <b>{request.assignedUsername}</b>
          </Typography>
        </Paper>
      )}
    </div>
  );
}
