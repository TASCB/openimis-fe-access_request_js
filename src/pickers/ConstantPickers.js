import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { REQUEST_STATUS_LIST, REQUEST_TYPE_LIST, USER_CATEGORY_LIST } from '../constants';

function makePicker(constants, defaultLabel) {
  return function ConstantPicker({
    required, withNull, readOnly, onChange, value, nullLabel, withLabel, label,
  }) {
    return (
      <ConstantBasedPicker
        module="access_request"
        label={label || defaultLabel}
        constants={constants}
        required={required}
        withNull={withNull}
        readOnly={readOnly}
        onChange={onChange}
        value={value}
        nullLabel={nullLabel}
        withLabel={withLabel}
      />
    );
  };
}

export const AccessRequestStatusPicker = makePicker(REQUEST_STATUS_LIST, 'field.status');
export const RequestTypePicker = makePicker(REQUEST_TYPE_LIST, 'field.requestType');
export const UserCategoryPicker = makePicker(USER_CATEGORY_LIST, 'field.userCategory');
