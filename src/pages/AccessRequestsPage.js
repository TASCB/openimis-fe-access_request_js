import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Paper, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Helmet, PublishedComponent, useTranslations, useModulesManager,
} from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_PROFILE_MANAGE, RIGHT_REQUEST_SEARCH } from '../constants';
import { defaultPageStyles } from '../utils/styles';
import AccessRequestSearcher from '../components/AccessRequestSearcher';
import SectionManagersPanel from '../components/SectionManagersPanel';
import AccessProfilesPanel from '../components/AccessProfilesPanel';

const useStyles = makeStyles((theme) => ({
  ...defaultPageStyles(theme),
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: { display: 'flex', alignItems: 'center' },
  selectedTab: { borderBottom: '4px solid white' },
  unselectedTab: { borderBottom: '4px solid transparent' },
}));

const TAB_REQUESTS = 'requests';
const TAB_SECTIONS = 'sectionManagers';
const TAB_PROFILES = 'jobTitles';

export default function AccessRequestsPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const canSearch = rights.includes(RIGHT_REQUEST_SEARCH);
  const canConfigure = rights.includes(RIGHT_PROFILE_MANAGE);
  const [activeTab, setActiveTab] = useState(canSearch ? TAB_REQUESTS : TAB_PROFILES);

  if (!canSearch && !canConfigure) return null;
  if (!canConfigure) {
    return (
      <div className={classes.page}>
        <Helmet title={formatMessage('requests.title')} />
        <AccessRequestSearcher />
      </div>
    );
  }

  const isSelected = (tab) => tab === activeTab;
  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);
  const onChange = (_, tab) => setActiveTab(tab);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('requests.title')} />
      <Paper className={classes.paper}>
        <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
          {canSearch && (
            <Tab
              onChange={onChange}
              className={tabStyle(TAB_REQUESTS)}
              selected={isSelected(TAB_REQUESTS)}
              value={TAB_REQUESTS}
              label={formatMessage('requests.tab.requests')}
            />
          )}
          <Tab
            onChange={onChange}
            className={tabStyle(TAB_PROFILES)}
            selected={isSelected(TAB_PROFILES)}
            value={TAB_PROFILES}
            label={formatMessage('requests.tab.jobTitles')}
          />
          <Tab
            onChange={onChange}
            className={tabStyle(TAB_SECTIONS)}
            selected={isSelected(TAB_SECTIONS)}
            value={TAB_SECTIONS}
            label={formatMessage('requests.tab.sectionManagers')}
          />
        </Grid>
        {canSearch && (
          <PublishedComponent pubRef="policyHolder.TabPanel" module={MODULE_NAME} index={TAB_REQUESTS} value={activeTab}>
            <AccessRequestSearcher />
          </PublishedComponent>
        )}
        <PublishedComponent pubRef="policyHolder.TabPanel" module={MODULE_NAME} index={TAB_PROFILES} value={activeTab}>
          <AccessProfilesPanel />
        </PublishedComponent>
        <PublishedComponent pubRef="policyHolder.TabPanel" module={MODULE_NAME} index={TAB_SECTIONS} value={activeTab}>
          <SectionManagersPanel />
        </PublishedComponent>
      </Paper>
    </div>
  );
}
