import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { TextInput } from '@openimis/fe-core';
import { defaultFilterStyles } from '../utils/styles';
import { DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, CONTAINS_LOOKUP } from '../constants';
import { AccessRequestStatusPicker, RequestTypePicker, UserCategoryPicker } from '../pickers/ConstantPickers';

function AccessRequestFilter({ classes, filters, onChangeFilters }) {
  const debounced = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const fv = (k) => filters?.[k]?.value;
  const ft = (k) => filters?.[k]?.value ?? EMPTY_STRING;
  const onText = (name) => (value) => debounced([{
    id: name, value, filter: value ? `${name}_${CONTAINS_LOOKUP}: "${value}"` : '',
  }]);

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="access_request" label="field.referenceCode"
          value={ft('referenceCode')} onChange={onText('referenceCode')}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="access_request" label="field.fullName"
          value={ft('fullName')} onChange={onText('fullName')}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="access_request" label="field.email"
          value={ft('email')} onChange={onText('email')}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        {/* status / requestType / userCategory are GraphQL enums — the value is UNQUOTED. */}
        <AccessRequestStatusPicker
          withNull label="field.status" value={fv('status')}
          onChange={(v) => onChangeFilters([{ id: 'status', value: v, filter: v ? `status: ${v}` : '' }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <RequestTypePicker
          withNull label="field.requestType" value={fv('requestType')}
          onChange={(v) => onChangeFilters([{ id: 'requestType', value: v, filter: v ? `requestType: ${v}` : '' }])}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <UserCategoryPicker
          withNull label="field.userCategory" value={fv('userCategory')}
          onChange={(v) => onChangeFilters([{ id: 'userCategory', value: v, filter: v ? `userCategory: ${v}` : '' }])}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(AccessRequestFilter)));
