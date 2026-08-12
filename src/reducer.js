/* eslint-disable default-param-last */
import {
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {
  MUTATION: 'ACCESS_REQUEST_MUTATION',
  SEARCH_REQUESTS: 'ACCESS_REQUEST_REQUESTS',
  GET_REQUEST: 'ACCESS_REQUEST_REQUEST',
  SEARCH_APPROVALS: 'ACCESS_REQUEST_APPROVALS',
  SEARCH_PROFILES: 'ACCESS_REQUEST_PROFILES',
  SEARCH_ROLES: 'ACCESS_REQUEST_ROLES',
};

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},
  fetchingRequests: false,
  fetchedRequests: false,
  errorRequests: null,
  requests: [],
  requestsPageInfo: {},
  requestsTotalCount: 0,
  fetchingRequest: false,
  request: null,
  errorRequest: null,
  fetchingRoles: false,
  roles: [],
  errorRoles: null,
  fetchingProfiles: false,
  profiles: [],
  profilesPageInfo: {},
  profilesTotalCount: 0,
};

function reducer(state = STORE_STATE, action) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_REQUESTS):
      return {
        ...state, fetchingRequests: true, fetchedRequests: false, requests: [], errorRequests: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_ROLES):
      return { ...state, fetchingRoles: true, errorRoles: null };
    case SUCCESS(ACTION_TYPE.SEARCH_ROLES):
      return {
        ...state,
        fetchingRoles: false,
        roles: parseData(action.payload.data.role) || [],
        errorRoles: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_ROLES):
      return { ...state, fetchingRoles: false, errorRoles: formatServerError(action.payload) };
    case SUCCESS(ACTION_TYPE.SEARCH_REQUESTS):
      return {
        ...state,
        fetchingRequests: false,
        fetchedRequests: true,
        requests: parseData(action.payload.data.accessRequest),
        requestsPageInfo: pageInfo(action.payload.data.accessRequest),
        requestsTotalCount: action.payload.data.accessRequest?.totalCount ?? 0,
        errorRequests: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_REQUESTS):
      return { ...state, fetchingRequests: false, errorRequests: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_REQUEST):
      return {
        ...state, fetchingRequest: true, request: null, errorRequest: null,
      };
    case SUCCESS(ACTION_TYPE.GET_REQUEST):
      return {
        ...state,
        fetchingRequest: false,
        request: parseData(action.payload.data.accessRequest)?.[0] ?? null,
        errorRequest: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_REQUEST):
      return { ...state, fetchingRequest: false, errorRequest: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.SEARCH_PROFILES):
      return { ...state, fetchingProfiles: true, profiles: [] };
    case SUCCESS(ACTION_TYPE.SEARCH_PROFILES):
      return {
        ...state,
        fetchingProfiles: false,
        profiles: parseData(action.payload.data.accessProfile),
        profilesPageInfo: pageInfo(action.payload.data.accessProfile),
        profilesTotalCount: action.payload.data.accessProfile?.totalCount ?? 0,
      };
    case ERROR(ACTION_TYPE.SEARCH_PROFILES):
      return { ...state, fetchingProfiles: false };

    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.MUTATION):
      return dispatchMutationResp(state, action.meta.clientMutationId, action);
    case CLEAR(ACTION_TYPE.MUTATION):
      return { ...state, mutation: {} };
    default:
      return state;
  }
}

export default reducer;
