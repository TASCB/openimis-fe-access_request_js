import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Helmet, useTranslations, useModulesManager } from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_REQUEST_SEARCH } from '../constants';
import { defaultPageStyles } from '../utils/styles';
import AccessRequestSearcher from '../components/AccessRequestSearcher';

const useStyles = makeStyles(defaultPageStyles);

export default function AccessRequestsPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);

  if (!rights.includes(RIGHT_REQUEST_SEARCH)) return null;

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('requests.title')} />
      <AccessRequestSearcher />
    </div>
  );
}
