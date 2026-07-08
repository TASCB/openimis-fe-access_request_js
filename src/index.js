/* eslint-disable import/prefer-default-export */
import React from 'react';
import { HowToReg } from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';

import messages_en from './translations/en.json';
import reducer from './reducer';
import {
  RIGHT_REQUEST_SEARCH,
  AR_ROUTE_REQUESTS, AR_ROUTE_REQUEST,
} from './constants';

import AccessRequestPublicPage from './pages/AccessRequestPublicPage';
import AccessRequestsPage from './pages/AccessRequestsPage';
import AccessRequestPage from './pages/AccessRequestPage';

const ROUTE_REQUESTS = 'access-requests';
const ROUTE_REQUEST = 'access-requests/request';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'access_request', reducer }],
  refs: [
    { key: AR_ROUTE_REQUESTS, ref: ROUTE_REQUESTS },
    { key: AR_ROUTE_REQUEST, ref: ROUTE_REQUEST },
  ],
  // Authenticated staff review/approval routes.
  'core.Router': [
    { path: ROUTE_REQUESTS, component: AccessRequestsPage },
    { path: `${ROUTE_REQUEST}/:access_request_id?`, component: AccessRequestPage },
  ],
  // PUBLIC (no login) landing + application page.
  'core.UnauthenticatedRouter': [
    { path: 'account-request', component: AccessRequestPublicPage },
  ],
  'core.MainMenu': [
    {
      text: <FormattedMessage module="access_request" id="menu.requests" />,
      icon: <HowToReg />,
      route: `/${ROUTE_REQUESTS}`,
      filter: (rights) => rights.includes(RIGHT_REQUEST_SEARCH),
      id: 'access_request.requests',
    },
  ],
};

export const AccessRequestModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
