# openimis-fe-access_request_js

openIMIS frontend module for public access requests and staff-side account
provisioning review.

## Developer Guide

Package: `@openimis/fe-access_request`.

Main entry point: `src/index.js`. It registers translations, the
`access_request` reducer, staff routes, a public unauthenticated route, and the
main menu entry.

Routes:

- `/account-request` - public account application page.
- `/access-requests` - staff request search/list.
- `/access-requests/request/:access_request_id?` - staff detail/provisioning page.

Important files:

- `src/actions.js` - GraphQL queries/mutations and public REST submit/status calls.
- `src/constants.js` - rights, routes, request statuses and public endpoint paths.
- `src/pages/AccessRequestPublicPage.js` - unauthenticated application flow.
- `src/pages/AccessRequestsPage.js` and `src/pages/AccessRequestPage.js` - staff UI.
- `src/translations/en.json` - module text.

Backend dependency: `openimis-be-access_request_py`. Approval decisions are handled
by the generic approval module; this frontend shows request status and provisioning
state.

Development:

```bash
npm install
npm run build
```

Register the built package in the openIMIS frontend bundle the same way as other
`@openimis/fe-*` modules.
