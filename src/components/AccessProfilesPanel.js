import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Chip, Grid, IconButton, MenuItem, TextField, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import _debounce from 'lodash/debounce';
import {
  Searcher, TextInput, journalize, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import {
  fetchAccessProfiles, fetchAccessSections, fetchAssignableRoles, saveAccessProfile,
} from '../actions';
import {
  MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, RIGHT_PROFILE_MANAGE,
  DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, CONTAINS_LOOKUP,
} from '../constants';
import { ProfileStatePicker } from '../pickers/ConstantPickers';
import { roleIdOf } from './RolePicker';
import { suggestedRoleIds } from '../utils/profiles';
import AccessProfileDialog from './AccessProfileDialog';

const useStyles = makeStyles((theme) => ({
  help: { marginBottom: theme.spacing(2) },
  bar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chip: { margin: theme.spacing(0.25) },
  searcher: {
    '& table': { tableLayout: 'fixed' },
    '& table th:nth-child(1), & table td:nth-child(1)': { width: 110 },
    '& table th:nth-child(5), & table td:nth-child(5)': { width: 120 },
    '& table th:nth-child(6), & table td:nth-child(6)': { width: 56, whiteSpace: 'nowrap' },
  },
  form: { padding: theme.spacing(1) },
  item: { padding: theme.spacing(1) },
}));

function ProfileFilter({ filters, onChangeFilters }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const sections = useSelector((s) => s.access_request?.sections ?? []);
  const debounced = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const onText = (name) => (value) => debounced([{
    id: name, value, filter: value ? `${name}_${CONTAINS_LOOKUP}: "${value}"` : '',
  }]);
  const state = filters?.isActive?.value;
  const section = filters?.sectionGroup?.value ?? '';
  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module={MODULE_NAME} label="profiles.code"
          value={filters?.code?.value ?? EMPTY_STRING} onChange={onText('code')}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module={MODULE_NAME} label="profiles.name"
          value={filters?.name?.value ?? EMPTY_STRING} onChange={onText('name')}
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <TextField
          select
          fullWidth
          label={formatMessage('profiles.section')}
          value={section}
          onChange={(e) => onChangeFilters([{
            id: 'sectionGroup',
            value: e.target.value,
            filter: e.target.value ? `sectionGroup_Name: ${JSON.stringify(e.target.value)}` : '',
          }])}
        >
          <MenuItem value="">{formatMessage('profiles.state.null')}</MenuItem>
          {sections.map((s) => <MenuItem key={s.sectionId} value={s.sectionName}>{s.sectionName}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <ProfileStatePicker
          withNull value={state}
          onChange={(v) => onChangeFilters([{
            id: 'isActive', value: v, filter: v ? `isActive: ${v === 'ACTIVE'}` : '',
          }])}
        />
      </Grid>
    </Grid>
  );
}

export default function AccessProfilesPanel() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const ar = useSelector((s) => s.access_request ?? {});
  const [edited, setEdited] = useState(null);
  const [open, setOpen] = useState(false);
  const queryParams = useRef([]);
  const prevSubmitting = useRef(false);
  const canManage = rights.includes(RIGHT_PROFILE_MANAGE);

  useEffect(() => {
    if (!ar.roles?.length && !ar.fetchingRoles) dispatch(fetchAssignableRoles());
    if (!ar.sections?.length && !ar.fetchingSections) dispatch(fetchAccessSections());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (prevSubmitting.current && !ar.submittingMutation) {
      dispatch(journalize(ar.mutation));
      dispatch(fetchAccessProfiles(queryParams.current));
      setOpen(false);
    }
    prevSubmitting.current = ar.submittingMutation;
  }, [ar.submittingMutation]);

  const roleName = (id) => (ar.roles || []).find((r) => roleIdOf(r) === id)?.name ?? `#${id}`;
  const fetch = (params) => { queryParams.current = params; return dispatch(fetchAccessProfiles(params)); };
  const edit = (p) => { if (!canManage) return; setEdited(p); setOpen(true); };
  const save = (form) => dispatch(saveAccessProfile(
    form, `${formatMessage(form.uuid ? 'profiles.mutation.update' : 'profiles.mutation.create')} — ${form.name}`,
  ));

  const headers = () => [
    'profiles.code', 'profiles.name', 'profiles.section', 'profiles.roles', 'profiles.state', 'emptyLabel',
  ];
  const sorts = () => [['code', true], ['name', true], ['sectionGroup__name', true], null, ['isActive', false], null];
  const itemFormatters = () => [
    (p) => p.code,
    (p) => p.name,
    (p) => p.sectionName || formatMessage('profiles.section.any'),
    (p) => suggestedRoleIds(p).map((id) => (
      <Chip key={id} size="small" className={classes.chip} label={roleName(id)} />
    )),
    (p) => formatMessage(`profiles.state.${p.isActive ? 'ACTIVE' : 'INACTIVE'}`),
    (p) => (canManage ? (
      <Tooltip title={formatMessage('profiles.edit')}>
        <IconButton size="small" onClick={() => edit(p)}><EditIcon /></IconButton>
      </Tooltip>
    ) : null),
  ];

  return (
    <div>
      <div className={classes.bar}>
        <Typography variant="body2" className={classes.help}>{formatMessage('profiles.help')}</Typography>
        {canManage && (
          <Button color="primary" variant="contained" disableElevation onClick={() => edit(null)}>
            {formatMessage('profiles.add')}
          </Button>
        )}
      </div>
      <div className={classes.searcher}>
        <Searcher
          module={MODULE_NAME}
          FilterPane={ProfileFilter}
          fetch={fetch}
          items={ar.profiles}
          itemsPageInfo={ar.profilesPageInfo}
          fetchedItems={!ar.fetchingProfiles}
          fetchingItems={ar.fetchingProfiles}
          errorItems={null}
          tableTitle={formatMessageWithValues('profiles.results', { count: ar.profilesTotalCount })}
          headers={headers}
          itemFormatters={itemFormatters}
          sorts={sorts}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          defaultPageSize={ROWS_PER_PAGE_OPTIONS[2] || DEFAULT_PAGE_SIZE}
          defaultOrderBy="name"
          rowIdentifier={(p) => p.id}
          onDoubleClick={edit}
        />
      </div>
      <AccessProfileDialog
        open={open}
        profile={edited}
        sections={ar.sections || []}
        onClose={() => setOpen(false)}
        onSave={save}
        submitting={ar.submittingMutation}
      />
    </div>
  );
}
