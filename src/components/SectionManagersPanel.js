import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Chip, Grid, MenuItem, TextField, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WarningIcon from '@material-ui/icons/Warning';
import {
  PublishedComponent, Table, decodeId, journalize, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { addSectionManager, fetchAccessSections, removeSectionManager } from '../actions';
import { MODULE_NAME } from '../constants';

const useStyles = makeStyles((theme) => ({
  help: { marginBottom: theme.spacing(2) },
  chip: { margin: theme.spacing(0.25) },
}));

const fullName = (m) => [m.otherNames, m.lastName].filter(Boolean).join(' ');

export default function SectionManagersPanel() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const sections = useSelector((s) => s.access_request?.sections ?? []);
  const fetching = useSelector((s) => s.access_request?.fetchingSections);
  const error = useSelector((s) => s.access_request?.errorSections);
  const submitting = useSelector((s) => s.access_request?.submittingMutation);
  const mutation = useSelector((s) => s.access_request?.mutation);
  const [sectionId, setSectionId] = useState('');
  const [user, setUser] = useState(null);
  const prevSubmitting = useRef(false);

  useEffect(() => { dispatch(fetchAccessSections()); }, [dispatch]);
  useEffect(() => {
    if (prevSubmitting.current && !submitting) {
      dispatch(journalize(mutation));
      dispatch(fetchAccessSections());
    }
    prevSubmitting.current = submitting;
  }, [submitting]);

  const add = () => {
    dispatch(addSectionManager(sectionId, decodeId(user.id), formatMessage('sections.mutation.add')));
    setUser(null);
  };
  const remove = (section, m) => dispatch(
    removeSectionManager(section.sectionId, m.userId, formatMessage('sections.mutation.remove')),
  );

  const managerChips = (section) => {
    if (!section.managers.some((m) => m.canApprove)) {
      return <Chip size="small" icon={<WarningIcon />} label={formatMessage('sections.none')} />;
    }
    return null;
  };

  const itemFormatters = () => [
    (s) => s.sectionName,
    (s) => (
      <>
        {s.managers.map((m) => {
          const chip = (
            <Chip
              key={m.userId}
              size="small"
              className={classes.chip}
              color={m.canApprove ? 'primary' : 'default'}
              icon={m.canApprove ? undefined : <WarningIcon />}
              label={`${m.username}${fullName(m) ? ` — ${fullName(m)}` : ''}`}
              onDelete={() => remove(s, m)}
            />
          );
          return m.canApprove ? chip : (
            <Tooltip key={m.userId} title={formatMessage('sections.noRight')}>{chip}</Tooltip>
          );
        })}
        {managerChips(s)}
      </>
    ),
  ];

  return (
    <div>
      <Typography variant="body2" className={classes.help}>{formatMessage('sections.help')}</Typography>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label={formatMessage('sections.section')}
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            {sections.map((s) => <MenuItem key={s.sectionId} value={s.sectionId}>{s.sectionName}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={5}>
          <PublishedComponent
            pubRef="admin.UserPicker"
            module={MODULE_NAME}
            label={formatMessage('sections.user')}
            value={user}
            onChange={setUser}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            disabled={!sectionId || !user || submitting}
            onClick={add}
          >
            {formatMessage('sections.add')}
          </Button>
        </Grid>
      </Grid>
      <Table
        module={MODULE_NAME}
        header={formatMessage('sections.title')}
        headers={['sections.section', 'sections.managers']}
        itemFormatters={itemFormatters()}
        items={sections}
        fetching={fetching}
        error={error}
      />
    </div>
  );
}
