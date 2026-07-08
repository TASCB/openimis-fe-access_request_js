// Authenticated staff page — list & filter access requests, open one to review.
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Chip,
} from '@material-ui/core';
import {
  useModulesManager, useTranslations, useHistory, historyPush,
} from '@openimis/fe-core';
import { fetchAccessRequests } from '../actions';
import {
  MODULE_NAME, RIGHT_REQUEST_SEARCH, AR_ROUTE_REQUEST, STATUS_COLOR,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  page: { padding: theme.spacing(3) },
  paper: { marginTop: theme.spacing(2) },
  row: { cursor: 'pointer' },
}));

export default function AccessRequestsPage({ rights = [] }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const requests = useSelector((s) => s.access_request?.requests ?? []);
  const fetching = useSelector((s) => s.access_request?.fetchingRequests);

  useEffect(() => {
    if (rights.includes(RIGHT_REQUEST_SEARCH)) {
      dispatch(fetchAccessRequests(['first: 50', 'orderBy: "-dateCreated"']));
    }
  }, [dispatch, rights]);

  if (!rights.includes(RIGHT_REQUEST_SEARCH)) return null;

  const open = (r) => historyPush(modulesManager, history, AR_ROUTE_REQUEST, [r.id]);

  return (
    <div className={classes.page}>
      <Typography variant="h5">{formatMessage('requests.title')}</Typography>
      <Paper className={classes.paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage('field.referenceCode')}</TableCell>
              <TableCell>{formatMessage('field.fullName')}</TableCell>
              <TableCell>{formatMessage('field.organizationPaa')}</TableCell>
              <TableCell>{formatMessage('field.requestType')}</TableCell>
              <TableCell>{formatMessage('field.email')}</TableCell>
              <TableCell>{formatMessage('field.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id} hover className={classes.row} onClick={() => open(r)}>
                <TableCell>{r.referenceCode}</TableCell>
                <TableCell>{r.fullName}</TableCell>
                <TableCell>{r.organizationPaa}</TableCell>
                <TableCell>{formatMessage(`requestType.${r.requestType}`)}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={formatMessage(`status.${r.status}`)}
                    style={{ background: STATUS_COLOR[r.status] || '#607d8b', color: '#fff' }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!fetching && requests.length === 0 && (
              <TableRow><TableCell colSpan={6}>{formatMessage('requests.empty')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
}
