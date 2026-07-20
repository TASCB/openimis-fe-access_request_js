export const MODULE_NAME = 'access_request';

export const RIGHT_REQUEST_SEARCH = 230101;
export const RIGHT_REQUEST_VIEW = 230102;
export const RIGHT_MANAGER_APPROVE = 230201;
export const RIGHT_ICT_APPROVE = 230202;
export const RIGHT_PROFILE_MANAGE = 230301;

export const AR_ROUTE_REQUESTS = 'access_request.route.requests';
export const AR_ROUTE_REQUEST = 'access_request.route.request';
export const AR_ROUTE_PROFILES = 'access_request.route.profiles';

export const AR_API_BASE = 'access_request';
export const AR_API_PROFILES = `${AR_API_BASE}/profiles/`;
export const AR_API_SECTIONS = `${AR_API_BASE}/sections/`;
export const AR_API_LOCATIONS = `${AR_API_BASE}/locations/`;
export const AR_API_SUBMIT = `${AR_API_BASE}/submit/`;
export const AR_API_STATUS = `${AR_API_BASE}/status/`;

export const REQUEST_TYPE = {
  NEW: 'NEW',
  ACTIVATE: 'ACTIVATE',
};

export const USER_CATEGORY = {
  TASAF_STAFF: 'TASAF_STAFF',
  PAA_STAFF: 'PAA_STAFF',
  OTHER: 'OTHER',
};

export const ADMIN_LEVEL = {
  PAA: 'PAA',
  VILLAGE: 'VILLAGE',
};

export const PAA_SECTIONS = ['TMO', 'PSSC', 'PSSNA'];

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

export const REQUEST_STATUS_LIST = [
  'SUBMITTED', 'MANAGER_APPROVED', 'ICT_APPROVED', 'PROVISIONED', 'REJECTED', 'FAILED',
];
export const REQUEST_TYPE_LIST = ['NEW', 'ACTIVATE'];
export const USER_CATEGORY_LIST = ['TASAF_STAFF', 'PAA_STAFF', 'OTHER'];

export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const CONTAINS_LOOKUP = 'Icontains';
export const EMPTY_STRING = '';
