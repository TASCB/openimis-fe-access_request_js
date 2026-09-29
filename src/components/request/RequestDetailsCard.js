import React, { useState } from 'react';
import {
  Button, Divider, Grid, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FileCopyOutlined from '@material-ui/icons/FileCopyOutlined';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import { InfoField, RequestCard, useAR } from './common';
import { USER_CATEGORY } from '../../constants';

const useStyles = makeStyles((theme) => ({
  section: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, margin: theme.spacing(0, 0, 1.5),
  },
  divider: { margin: theme.spacing(2, 0) },
  icon: { fontSize: 16 },
  copy: { textTransform: 'none' },
}));

export default function RequestDetailsCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatDateTimeFromISO } = useAR();
  const [copied, setCopied] = useState(false);
  const approval = request.approval || {};
  const notProvided = (
    <>
      <InfoOutlined className={classes.icon} />
      {formatMessage('request.notProvided')}
    </>
  );
  const enumLabel = (prefix, v) => (v ? formatMessage(`${prefix}.${v}`) : '');

  const copyPayload = () => {
    const { approval: omitted, ...payload } = request;
    try {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    } catch (e) { /* clipboard unavailable (insecure origin) — nothing to do */ }
  };

  const isOther = request.userCategory === USER_CATEGORY.OTHER;
  const isPaa = request.userCategory === USER_CATEGORY.PAA_STAFF;

  return (
    <RequestCard
      title={formatMessage('request.details.title')}
      action={(
        <Button size="small" variant="outlined" color="primary" className={classes.copy} startIcon={<FileCopyOutlined />} onClick={copyPayload}>
          {formatMessage(copied ? 'request.details.copied' : 'request.details.copy')}
        </Button>
      )}
    >
      <Typography className={classes.section}>{formatMessage('request.details.person')}</Typography>
      <Grid container spacing={2}>
        <InfoField label={formatMessage('field.fullName')} value={request.fullName} />
        <InfoField label={formatMessage('field.email')} value={request.email} />
        <InfoField label={formatMessage('field.phone')} value={request.phone} missing={notProvided} />
        <InfoField label={formatMessage('field.userCategory')} value={enumLabel('userCategory', request.userCategory)} />
        <InfoField label={formatMessage('field.section')} value={request.section} missing={notProvided} />
        <InfoField label={formatMessage('field.requestType')} value={enumLabel('requestType', request.requestType)} />
        {isPaa && (
          <>
            <InfoField label={formatMessage('field.administrativeLevel')} value={enumLabel('adminLevel', request.administrativeLevel)} missing={notProvided} />
            <InfoField label={formatMessage('field.requestedLocation')} value={request.requestedLocation?.name} missing={notProvided} />
          </>
        )}
        {isOther && (
          <>
            <InfoField label={formatMessage('field.organizationPaa')} value={request.organizationPaa} missing={notProvided} />
            <InfoField label={formatMessage('field.designation')} value={request.designation} missing={notProvided} />
          </>
        )}
        <InfoField
          label={formatMessage('field.profile')}
          value={request.profile?.name}
          missing={formatMessage('request.details.profileAtProvision')}
        />
        {!!request.assignedUsername && <InfoField label={formatMessage('field.assignedUsername')} value={request.assignedUsername} />}
        {!!request.rejectionReason && <InfoField sm={12} label={formatMessage('field.rejectionReason')} value={request.rejectionReason} />}
        {!!request.provisioningError && <InfoField sm={12} label={formatMessage('field.provisioningError')} value={request.provisioningError} />}
      </Grid>
      <Divider className={classes.divider} />
      <Typography className={classes.section}>{formatMessage('request.details.workflow')}</Typography>
      <Grid container spacing={2}>
        <InfoField sm={6} mono label={formatMessage('request.tech.flow')} value={approval.flow?.code} />
        <InfoField sm={6} mono label={formatMessage('request.tech.entity')} value={approval.entityModel} />
        <InfoField sm={6} mono label={formatMessage('field.referenceCode')} value={request.referenceCode} />
        <InfoField sm={6} label={formatMessage('field.dateCreated')} value={request.dateCreated && formatDateTimeFromISO(request.dateCreated)} />
      </Grid>
    </RequestCard>
  );
}
