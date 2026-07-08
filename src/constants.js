export const MODULE_NAME = 'access_request';

// Rights (backend module 23 — see openimis-be-access_request_py/access_request/apps.py)
export const RIGHT_REQUEST_SEARCH = 230101;
export const RIGHT_REQUEST_VIEW = 230102;
export const RIGHT_MANAGER_APPROVE = 230201;
export const RIGHT_ICT_APPROVE = 230202;
export const RIGHT_PROFILE_MANAGE = 230301;

// Ref keys (so other modules can navigate to these routes)
export const AR_ROUTE_REQUESTS = 'access_request.route.requests';
export const AR_ROUTE_REQUEST = 'access_request.route.request';
export const AR_ROUTE_PROFILES = 'access_request.route.profiles';

// Public (unauthenticated) REST endpoints exposed by the backend module.
export const AR_API_BASE = 'access_request';
export const AR_API_PROFILES = `${AR_API_BASE}/profiles/`;
export const AR_API_SUBMIT = `${AR_API_BASE}/submit/`;
export const AR_API_STATUS = `${AR_API_BASE}/status/`;

// Request type + status enums (mirror backend TextChoices)
export const REQUEST_TYPE = {
  NEW: 'NEW',
  ACTIVATE: 'ACTIVATE',
};

export const REQUEST_STATUS = {
  SUBMITTED: 'SUBMITTED',
  MANAGER_APPROVED: 'MANAGER_APPROVED',
  ICT_APPROVED: 'ICT_APPROVED',
  PROVISIONED: 'PROVISIONED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
};

export const STATUS_COLOR = {
  SUBMITTED: '#1976d2',
  MANAGER_APPROVED: '#00695C',
  ICT_APPROVED: '#00897B',
  PROVISIONED: '#2e7d32',
  REJECTED: '#c62828',
  FAILED: '#e65100',
};
