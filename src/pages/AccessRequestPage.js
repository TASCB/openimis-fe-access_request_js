import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Helmet, ProgressOrError, decodeId, historyPush, journalize, useHistory,
} from '@openimis/fe-core';
import RequestHeader from '../components/request/RequestHeader';
import RequestDetailsCard from '../components/request/RequestDetailsCard';
import ApprovalChainCard from '../components/request/ApprovalChainCard';
import DecisionNoteCard from '../components/request/DecisionNoteCard';
import ProvisionCard from '../components/request/ProvisionCard';
import HistoryCard from '../components/request/HistoryCard';
import ProvisionedDialog from '../components/request/ProvisionedDialog';
import {
  ApplicantCard, ChecklistCard,
} from '../components/request/SideCards';
import { canDecide, currentStep, useAR } from '../components/request/common';
import {
  approveAccessRequestStep, clearTemporaryPassword, fetchAccessRequest, fetchTemporaryPassword,
  provisionAccessRequest, rejectAccessRequestStep,
} from '../actions';
import {
  RIGHT_ICT_APPROVE, RIGHT_REQUEST_SEARCH, RIGHT_REQUEST_VIEW, REQUEST_STATUS, AR_ROUTE_REQUESTS,
} from '../constants';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

// A decision note is a per-reviewer draft: kept in this browser only, never shared.
const draftKey = (id) => `access_request.note.${id}`;
const readDraft = (id) => { try { return localStorage.getItem(draftKey(id)) || ''; } catch (e) { return ''; } };
const writeDraft = (id, v) => {
  try {
    if (v) localStorage.setItem(draftKey(id), v); else localStorage.removeItem(draftKey(id));
  } catch (e) { /* storage unavailable — the note simply isn't kept */ }
};

const districtOf = (location) => {
  let node = location;
  while (node && node.type !== 'D') node = node.parent;
  return node || null;
};

export default function AccessRequestPage({ match }) {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { modulesManager, formatMessage } = useAR();
  const id = match?.params?.access_request_id;

  // fe-core does not pass `rights` to route components — read it from redux.
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const request = useSelector((s) => s.access_request?.request);
  const fetchingRequest = useSelector((s) => s.access_request?.fetchingRequest);
  const errorRequest = useSelector((s) => s.access_request?.errorRequest);
  const mutation = useSelector((s) => s.access_request?.mutation);
  const submitting = useSelector((s) => s.access_request?.submittingMutation);
  const temporaryPassword = useSelector((s) => s.access_request?.temporaryPassword);

  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState(() => readDraft(id));
  const [noteError, setNoteError] = useState(null);
  const [username, setUsername] = useState('');
  const [roleIds, setRoleIds] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showProvisioned, setShowProvisioned] = useState(false);
  const prevSubmitting = useRef(false);
  const clearNoteOnDone = useRef(false);
  const provisioning = useRef(false);
  const districtsInitFor = useRef(null);

  useEffect(() => { if (id) dispatch(fetchAccessRequest(id)); }, [id, dispatch]);

  useEffect(() => {
    if (!request || districtsInitFor.current === request.id) return;
    districtsInitFor.current = request.id;
    const district = districtOf(request.requestedLocation);
    setDistricts(district ? [district] : []);
  }, [request]);

  // refresh after a mutation resolves
  useEffect(() => {
    if (prevSubmitting.current && !submitting) {
      dispatch(journalize(mutation));
      if (clearNoteOnDone.current) {
        setNote('');
        writeDraft(id, '');
        clearNoteOnDone.current = false;
      }
      if (id) dispatch(fetchAccessRequest(id));
      if (provisioning.current) {
        provisioning.current = false;
        if (id) dispatch(fetchTemporaryPassword(id));
        setShowProvisioned(true);
      }
    }
    prevSubmitting.current = submitting;
  }, [submitting]);

  if (!rights.includes(RIGHT_REQUEST_SEARCH) && !rights.includes(RIGHT_REQUEST_VIEW)) return null;

  const back = () => historyPush(modulesManager, history, AR_ROUTE_REQUESTS);

  if (!request) {
    return (
      <div className={classes.page}>
        <ProgressOrError progress={fetchingRequest} error={errorRequest} />
      </div>
    );
  }

  const approval = request.approval || null;
  // The access request's own status is authoritative; the engine step only matters while in approval.
  const mayDecide = request.status === REQUEST_STATUS.SUBMITTED || request.status === REQUEST_STATUS.MANAGER_APPROVED;
  const step = mayDecide ? currentStep(approval) : null;
  const stepTotal = approval?.steps?.length || 0;
  const decide = mayDecide && canDecide(step, rights);
  const canProvision = rights.includes(RIGHT_ICT_APPROVE) && request.status === REQUEST_STATUS.ICT_APPROVED;

  const changeNote = (v) => { setNote(v); setNoteError(null); writeDraft(id, v); };

  const label = (key) => `${formatMessage(key)} — ${request.referenceCode}`;
  const approve = () => {
    clearNoteOnDone.current = true;
    dispatch(approveAccessRequestStep(approval.uuid, step.uuid, note.trim(), label('request.mutation.approve')));
  };
  const reject = () => {
    if (!note.trim()) {
      setTab('overview');
      setNoteError(formatMessage('request.note.requiredForReject'));
      return;
    }
    clearNoteOnDone.current = true;
    dispatch(rejectAccessRequestStep(approval.uuid, step.uuid, note.trim(), label('request.mutation.reject')));
  };
  const provision = () => {
    provisioning.current = true;
    const districtIds = districts.map((d) => decodeId(d.id));
    dispatch(provisionAccessRequest(id, username.trim(), roleIds, districtIds, label('mutation.provision')));
  };
  const closeProvisioned = () => {
    setShowProvisioned(false);
    dispatch(clearTemporaryPassword());
  };

  return (
    <div className={classes.page}>
      <Helmet title={`${formatMessage('request.title')} ${request.referenceCode}`} />
      <RequestHeader
        request={request}
        step={step}
        stepTotal={stepTotal}
        tab={tab}
        onTab={setTab}
        onBack={back}
        canProvision={canProvision}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <div hidden={tab !== 'overview'}>
            <RequestDetailsCard request={request} />
            <ApprovalChainCard request={request} />
            {canProvision && (
              <ProvisionCard
                username={username}
                onUsername={setUsername}
                roleIds={roleIds}
                onRoleIds={setRoleIds}
                districts={districts}
                onDistricts={setDistricts}
                requestType={request.requestType}
                onProvision={provision}
                submitting={submitting}
              />
            )}
            {decide && (
              <DecisionNoteCard
                value={note}
                onChange={changeNote}
                error={noteError}
                onApprove={approve}
                onReject={reject}
                submitting={submitting}
              />
            )}
          </div>
          <div hidden={tab !== 'history'}>
            <HistoryCard request={request} />
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <ApplicantCard request={request} />
          <ChecklistCard request={request} />
        </Grid>
      </Grid>
      <ProvisionedDialog
        open={showProvisioned && request.status === REQUEST_STATUS.PROVISIONED}
        username={request.assignedUsername}
        password={temporaryPassword}
        userId={request.createdUser?.id}
        onClose={closeProvisioned}
      />
    </div>
  );
}
