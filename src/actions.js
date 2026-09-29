import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';

const REQUEST_PROJECTION = () => [
  'id', 'referenceCode', 'requestType', 'fullName', 'organizationPaa', 'section',
  'designation', 'email', 'phone', 'status', 'rejectionReason', 'assignedUsername',
  'userCategory', 'administrativeLevel',
  'profile { id name code }', 'requestedLocation { id name type }',
  'createdUser { id username }',
  'dateCreated', 'dateUpdated', 'version',
];

const REQUEST_FULL_PROJECTION = () => [
  ...REQUEST_PROJECTION(),
  'applicantSignature', 'provisioningError', 'existingUserLogins',
  'approval { uuid status currentStepOrder requestedAt completedAt entityModel objectId flow { code name } '
    + 'steps { uuid order code label status requiredRight assignedRoleId dateCreated '
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

export function provisionAccessRequest(requestId, username, roleIds, districtIds, clientMutationLabel) {
  const mutation = formatMutation('provisionAccessRequest', `
    id: "${requestId}"
    username: "${formatGQLString(username)}"
    roleIds: [${(roleIds || []).join(', ')}]
    ${districtIds && districtIds.length ? `districtIds: [${districtIds.join(', ')}]` : ''}
  `, clientMutationLabel);
  return graphql(mutation.payload, ['ACCESS_REQUEST_MUTATION_REQ', 'ACCESS_REQUEST_MUTATION_RESP', 'ACCESS_REQUEST_MUTATION_ERR'],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel });
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
  return graphql(
    mutation.payload,
    ['ACCESS_REQUEST_MUTATION_REQ', 'ACCESS_REQUEST_MUTATION_RESP', 'ACCESS_REQUEST_MUTATION_ERR'],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel },
  );
}

export const approveAccessRequestStep = (requestUuid, stepUuid, comment, label) => approvalStepMutation(
  'approveApprovalStep', requestUuid, stepUuid, comment, label,
);

export const rejectAccessRequestStep = (requestUuid, stepUuid, comment, label) => approvalStepMutation(
  'rejectApprovalStep', requestUuid, stepUuid, comment, label,
);
