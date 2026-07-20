import React, { useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  Searcher, useHistory, useModulesManager, useTranslations, journalize, formatDateFromISO, decodeId,
} from '@openimis/fe-core';
import { fetchAccessRequests } from '../actions';
import {
  MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, RIGHT_REQUEST_SEARCH, AR_ROUTE_REQUEST,
} from '../constants';
import AccessRequestFilter from './AccessRequestFilter';
import AccessRequestStatusChip from './AccessRequestStatusChip';

const useStyles = makeStyles(() => ({
  searcher: {
    '& table': { tableLayout: 'fixed', minWidth: '100%' },
    '& table th, & table td': { whiteSpace: 'nowrap' },
    '& table th:nth-child(-n+7), & table td:nth-child(-n+7)': { overflow: 'hidden', textOverflow: 'ellipsis' },
    '& table th:nth-child(1), & table td:nth-child(1)': { width: 160 },
    '& table th:nth-child(2), & table td:nth-child(2)': { width: 200 },
    '& table th:nth-child(3), & table td:nth-child(3)': { width: 130 },
    '& table th:nth-child(4), & table td:nth-child(4)': { width: 120 },
    '& table th:nth-child(5), & table td:nth-child(5)': { width: 240 },
    '& table th:nth-child(6), & table td:nth-child(6)': { width: 120 },
    '& table th:nth-child(7), & table td:nth-child(7)': { width: 140 },
    '& table th:nth-child(8), & table td:nth-child(8)': { width: 56 },
  },
}));

function AccessRequestSearcher({
  fetchAccessRequests, journalize,
  fetchingRequests, fetchedRequests, errorRequests, requests,
  requestsPageInfo, requestsTotalCount, submittingMutation, mutation,
}) {
  const history = useHistory();
  const intl = useIntl();
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const queryParams = useRef([]);
  const prev = useRef();

  const open = (r) => r?.id && rights.includes(RIGHT_REQUEST_SEARCH)
    && history.push(`/${modulesManager.getRef(AR_ROUTE_REQUEST)}/${decodeId(r.id)}`);

  useEffect(() => {
    if (prev.current && !submittingMutation) {
      journalize(mutation);
      fetchAccessRequests(queryParams.current);
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const fetch = (params) => { queryParams.current = params; return fetchAccessRequests(params); };

  const headers = () => [
    'field.referenceCode', 'field.fullName', 'field.userCategory', 'field.requestType',
    'field.email', 'field.status', 'field.dateCreated', 'emptyLabel',
  ];
  const sorts = () => [
    ['referenceCode', true], ['fullName', true], null, ['requestType', true],
    null, ['status', true], ['dateCreated', true], null,
  ];
  const itemFormatters = () => [
    (r) => r?.referenceCode,
    (r) => r?.fullName,
    (r) => (r?.userCategory ? formatMessage(`userCategory.${r.userCategory}`) : ''),
    (r) => (r?.requestType ? formatMessage(`requestType.${r.requestType}`) : ''),
    (r) => r?.email,
    (r) => <AccessRequestStatusChip status={r?.status} />,
    (r) => (r?.dateCreated ? formatDateFromISO(modulesManager, intl, r.dateCreated) : ''),
    (r) => (
      <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
        <IconButton onClick={() => open(r)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <AccessRequestFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <div className={classes.searcher}>
      <Searcher
        module={MODULE_NAME}
        FilterPane={filterPane}
        fetch={fetch}
        items={requests}
        itemsPageInfo={requestsPageInfo}
        fetchedItems={fetchedRequests}
        fetchingItems={fetchingRequests}
        errorItems={errorRequests}
        tableTitle={formatMessageWithValues('searcherResultsTitle', { count: requestsTotalCount })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="-dateCreated"
        rowIdentifier={(r) => r.id}
        onDoubleClick={open}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingRequests: state.access_request.fetchingRequests,
  fetchedRequests: state.access_request.fetchedRequests,
  errorRequests: state.access_request.errorRequests,
  requests: state.access_request.requests,
  requestsPageInfo: state.access_request.requestsPageInfo,
  requestsTotalCount: state.access_request.requestsTotalCount,
  submittingMutation: state.access_request.submittingMutation,
  mutation: state.access_request.mutation,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchAccessRequests, journalize }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AccessRequestSearcher);
