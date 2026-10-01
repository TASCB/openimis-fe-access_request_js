import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';

const REQUEST_PROJECTION = () => [
  'id', 'referenceCode', 'requestType', 'fullName', 'organizationPaa', 'section',
  'designation', 'email', 'phone', 'status', 'rejectionReason', 'assignedUsername',
  'userCategory', 'administrativeLevel',
  'profile { id name code }',
  'requestedLocation { id uuid code name type parent { id uuid code name type parent { id uuid code name type '
    + 'parent { id uuid code name type } } } }',
  'createdUser { id username }', 'userUpdated { username iUser { otherNames lastName } }',
  'dateCreated', 'dateUpdated', 'version',
];

const REQUEST_FULL_PROJECTION = () => [
  ...REQUEST_PROJECTION(),
  'applicantSignature', 'provisioningError', 'existingUserLogins',
  'approval { uuid status currentStepOrder requestedAt completedAt entityModel objectId flow { code name } '
    + 'steps { uuid order code label status requiredRight assignedRoleId assignedGroupName dateCreated '
    + 'decisions { uuid decision comment decidedAt approver { username otherNames lastName } } } }',
  
];

const PROFILE_PROJECTION = () => [
  'id', 'code', 'name', 'description', 'suggestedRoleIds', 'isActive',
  'defaultLocation { id name }', 'version',
];

export function fetchAccessRequests(params) {
  const payload = formatPageQueryWithCount('accessRequest', params, REQUEST_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_REQUESTS);
}

export function fetchAccessRequest(id) {
  const payload = formatPageQueryWithCount(
    'accessRequest', [`id: "${id}"`], REQUEST_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_REQUEST);
}

export function fetchAccessProfiles(params) {
  const payload = formatPageQueryWithCount('accessProfile', params, PROFILE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_PROFILES);
}

const MUTATION_LOG_QUERY = (clientMutationId) => `query { mutationLogs(clientMutationId: "${clientMutationId}") `
  + '{ edges { node { status error } } } }';
const MUTATION_RECEIVED = 0;
const MUTATION_POLL_ATTEMPTS = 40;

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function waitForMutationLog(dispatch, clientMutationId) {
  for (let attempt = 0; attempt < MUTATION_POLL_ATTEMPTS; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await dispatch(graphql(MUTATION_LOG_QUERY(clientMutationId), 'ACCESS_REQUEST_MUTATION_LOG'));
    const log = response?.payload?.data?.mutationLogs?.edges?.[0]?.node;
    if (response?.error || (log && log.status !== MUTATION_RECEIVED)) return log || null;
    // eslint-disable-next-line no-await-in-loop
    await sleep(Math.min(250 * (attempt + 1), 2000));
  }
  return null;
}

function submitMutation(mutation, clientMutationLabel) {
  const meta = { clientMutationId: mutation.clientMutationId, clientMutationLabel };
  return async (dispatch) => {
    dispatch({ type: 'ACCESS_REQUEST_MUTATION_REQ', meta });
    const sent = await dispatch(graphql(mutation.payload, 'ACCESS_REQUEST_MUTATION_SEND', meta));
    if (sent?.error) {
      dispatch({ type: 'ACCESS_REQUEST_MUTATION_ERR', payload: sent.payload, meta });
      return;
    }
    const log = await waitForMutationLog(dispatch, meta.clientMutationId);
    dispatch({ type: 'ACCESS_REQUEST_MUTATION_RESP', payload: log, meta });
  };
}

export function provisionAccessRequest(requestId, username, roleIds, districtIds, clientMutationLabel) {
  const mutation = formatMutation('provisionAccessRequest', `
    id: "${requestId}"
    username: "${formatGQLString(username)}"
    roleIds: [${(roleIds || []).join(', ')}]
    ${districtIds && districtIds.length ? `districtIds: [${districtIds.join(', ')}]` : ''}
  `, clientMutationLabel);
  return submitMutation(mutation, clientMutationLabel);
}


// Core roles offered in the provisioning picker. `node.id` is a relay global id; the
// provision mutation takes the integer Role id, so callers decodeId() before sending.
// 100 is the server's page cap; asking for more fails the whole query and empties the picker.
export function fetchAssignableRoles() {
  const payload = `query { role(first: 100, orderBy: ["name"]) { totalCount edges { node { id name isSystem isBlocked } } } }`;
  return graphql(payload, ACTION_TYPE.SEARCH_ROLES);
}

// Approval Engine decisions on the application's current step. They reuse this module's
// mutation action types so the page's submit → journalize → refetch cycle covers them too.
function approvalStepMutation(name, requestUuid, stepUuid, comment, clientMutationLabel) {
  const mutation = formatMutation(name, `
    requestId: "${requestUuid}"
    stepId: "${stepUuid}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
  `, clientMutationLabel);
  return submitMutation(mutation, clientMutationLabel);
}

export const approveAccessRequestStep = (requestUuid, stepUuid, comment, label) => approvalStepMutation(
  'approveApprovalStep', requestUuid, stepUuid, comment, label,
);

export const rejectAccessRequestStep = (requestUuid, stepUuid, comment, label) => approvalStepMutation(
  'rejectApprovalStep', requestUuid, stepUuid, comment, label,
);

export function fetchAccessSections() {
  const managers = 'managers { userId username otherNames lastName canApprove }';
  return graphql(`query { accessSections { sectionId sectionName ${managers} } }`, ACTION_TYPE.SEARCH_SECTIONS);
}

function sectionManagerMutation(name, sectionId, userUuid, clientMutationLabel) {
  const mutation = formatMutation(name, `
    sectionId: ${sectionId}
    userId: "${userUuid}"
  `, clientMutationLabel);
  return submitMutation(mutation, clientMutationLabel);
}

export function addSectionManager(sectionId, userUuid, label) {
  return sectionManagerMutation('addAccessSectionManager', sectionId, userUuid, label);
}

export function removeSectionManager(sectionId, userUuid, label) {
  return sectionManagerMutation('removeAccessSectionManager', sectionId, userUuid, label);
}

export function fetchTemporaryPassword(requestUuid) {
  return graphql(`query { accessRequestTemporaryPassword(id: "${requestUuid}") }`, ACTION_TYPE.TEMP_PASSWORD);
}

export function clearTemporaryPassword() {
  return { type: `${ACTION_TYPE.TEMP_PASSWORD}_CLEAR` };
}
