import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useHistory, useModulesManager, useTranslations } from '@openimis/fe-core';

import { MODULE_NAME } from '../constants';

const LoginPageLink = () => {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <Box width="100%">
      <Button
        onClick={(e) => {
          e.preventDefault();
          history.push('/account-request');
        }}
      >
        {formatMessage('login.requestAccount')}
      </Button>
    </Box>
  );
};

export default LoginPageLink;
