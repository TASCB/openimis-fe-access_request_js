import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';

const REQUEST_PROJECTION = () => [
  'id', 'referenceCode', 'requestType', 'fullName', 'organizationPaa', 'section',
  'designation', 'email', 'phone', 'status', 'rejectionReason', 'assignedUsername',
  'profile { id name code }', 'requestedLocation { id name }',
  'createdUser { id username }',
  'dateCreated', 'dateUpdated', 'version',
];

const REQUEST_FULL_PROJECTION = () => [
  ...REQUEST_PROJECTION(),
  'applicantSignature', 'provisioningError',
  // The Manager→ICT sign-off now lives in the generic Approval Engine (not this module).
  // Approvers act from the Tasks inbox; this page only shows status + provisioning.
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

// Manager/ICT approvals moved to the generic Approval Engine (Tasks inbox / approval dashboard);
// their in-module mutations were removed. This module keeps only provisioning.
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
