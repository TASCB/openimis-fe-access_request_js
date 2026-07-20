
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForward';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import LockOutlined from '@material-ui/icons/LockOutlined';
import MailOutline from '@material-ui/icons/MailOutline';
import PersonOutline from '@material-ui/icons/PersonOutline';
import PhoneOutlined from '@material-ui/icons/PhoneOutlined';
import BusinessOutlined from '@material-ui/icons/BusinessOutlined';
import WorkOutline from '@material-ui/icons/WorkOutline';
import GroupOutlined from '@material-ui/icons/GroupOutlined';
import CategoryOutlined from '@material-ui/icons/CategoryOutlined';
import LayersOutlined from '@material-ui/icons/LayersOutlined';
import PlaceOutlined from '@material-ui/icons/PlaceOutlined';
import Add from '@material-ui/icons/Add';
import Autorenew from '@material-ui/icons/Autorenew';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import { useModulesManager, useTranslations, useHistory } from '@openimis/fe-core';
import {
  MODULE_NAME, AR_API_SUBMIT, AR_API_SECTIONS, AR_API_LOCATIONS,
  REQUEST_TYPE, USER_CATEGORY, ADMIN_LEVEL, PAA_SECTIONS,
} from '../constants';

const LOC_CHAIN = {
  [ADMIN_LEVEL.PAA]: ['region', 'district'],
  [ADMIN_LEVEL.VILLAGE]: ['region', 'district', 'ward', 'village'],
};

const LOGO = '/front/tasaf-logo.png';

const T = {
  forest: '#013B33',
  primary: '#00695C',
  primaryDk: '#00544a',
  accent: '#7ad0c2',
  paper: '#DCEEE9',
  ink: '#14312c',
  muted: '#5b7671',
  border: '#cfe2dd',
  white: '#fff',
  head: "'DM Sans', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
};

const useStyles = makeStyles({
  '@global': {
    '.ar-public, .ar-public *': { boxSizing: 'border-box', fontFamily: T.body },
    '.ar-public h1, .ar-public h2, .ar-public h3, .ar-public .ar-head': { fontFamily: T.head },
    '@media (prefers-reduced-motion: reduce)': {
      '.ar-public *': { transition: 'none !important', animation: 'none !important', scrollBehavior: 'auto !important' },
    },
  },
  page: { minHeight: '100vh', background: T.paper, color: T.ink, display: 'flex', flexDirection: 'column' },

  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '10px 24px', background: T.white, borderBottom: `1px solid ${T.border}`,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { height: 34, width: 'auto', display: 'block' },
  wordmark: { fontFamily: T.head, fontWeight: 800, fontSize: 16, letterSpacing: 0.4, color: T.forest },
  wordmarkSub: { color: T.muted, fontWeight: 600, fontSize: 12, marginLeft: 8, letterSpacing: 0.3 },
  topbarRight: { color: T.muted, fontSize: 13, fontWeight: 600 },

  hero: {
    position: 'relative', overflow: 'hidden', color: T.white,
    background: `radial-gradient(1200px 400px at 78% -10%, rgba(122,208,194,.14), transparent 60%), linear-gradient(155deg, ${T.forest} 0%, #015043 60%, ${T.primary} 100%)`,
    padding: '56px 24px 64px',
  },
  heroInner: { maxWidth: 1120, margin: '0 auto' },
  h1: { fontSize: 46, lineHeight: 1.06, fontWeight: 800, margin: '0 0 14px', maxWidth: 640, letterSpacing: -0.5 },
  h1accent: { color: T.accent },
  heroSub: { fontSize: 17, lineHeight: 1.55, color: '#d7e6dd', maxWidth: 560, margin: 0 },
  ctaRow: { display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' },

  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    background: T.white, color: T.primary, border: 0, borderRadius: 10, padding: '13px 20px',
    fontFamily: T.body, fontSize: 15, fontWeight: 700, transition: 'background .15s, transform .05s',
    '&:hover': { background: '#eef6f4' },
    '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: 'none', boxShadow: '0 0 0 3px rgba(255,255,255,.55)' },
    '&:disabled': { opacity: 0.7, cursor: 'default' },
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    background: 'transparent', color: T.white, border: '1px solid rgba(255,255,255,.4)', borderRadius: 10,
    padding: '13px 18px', fontFamily: T.body, fontSize: 15, fontWeight: 600, transition: 'background .15s',
    '&:hover': { background: 'rgba(255,255,255,.08)' },
    '&:focus-visible': { outline: 'none', boxShadow: '0 0 0 3px rgba(255,255,255,.35)' },
  },

  main: { flex: 1, padding: '0 24px' },
  cols: {
    maxWidth: 1120, margin: '48px auto 0', display: 'grid', gap: 40,
    gridTemplateColumns: '1fr 1.05fr', alignItems: 'start', paddingBottom: 64,
    '@media (max-width: 900px)': { gridTemplateColumns: '1fr', margin: '36px auto 0', gap: 28 },
  },

  process: { paddingTop: 4, '@media (max-width: 900px)': { paddingTop: 0 } },
  procEyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.primary },
  procTitle: { fontSize: 24, fontWeight: 800, color: T.ink, margin: '8px 0 8px' },
  procSub: { fontSize: 14.5, lineHeight: 1.55, color: T.muted, maxWidth: 380, margin: '0 0 26px' },
  timeline: { position: 'relative', paddingLeft: 44 },
  rail: { position: 'absolute', left: 15, top: 8, bottom: 24, width: 2, background: `linear-gradient(${T.primary}, ${T.border})` },
  step: { position: 'relative', paddingBottom: 26, '&:last-child': { paddingBottom: 0 } },
  node: {
    position: 'absolute', left: -44, top: 0, width: 32, height: 32, borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.head, fontWeight: 800, fontSize: 14,
    background: T.white, color: T.primary, border: `2px solid ${T.primary}`, zIndex: 1,
  },
  nodeDone: { background: T.primary, color: T.white, borderColor: T.primary },
  stepTitle: { fontSize: 15.5, fontWeight: 700, color: T.ink, margin: '4px 0 4px' },
  stepBody: { fontSize: 13.5, lineHeight: 1.5, color: T.muted, margin: 0 },

  card: {
    background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28,
    boxShadow: '0 18px 40px rgba(6,56,31,.08)',
    '@media (max-width: 430px)': { padding: 18 },
  },
  cardTitle: { fontSize: 20, fontWeight: 800, color: T.ink, margin: '0 0 4px' },
  cardHint: { fontSize: 13, color: T.muted, margin: '0 0 18px' },

  segment: {
    position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
    background: T.paper, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, marginBottom: 22,
  },
  segIndicator: {
    position: 'absolute', top: 4, bottom: 4, width: 'calc(50% - 4px)', borderRadius: 8,
    background: T.white, boxShadow: '0 2px 6px rgba(6,56,31,.12)', border: `1px solid ${T.border}`,
    transition: 'transform .22s cubic-bezier(.4,0,.2,1)', zIndex: 0,
  },
  segBtn: {
    position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    background: 'transparent', border: 0, cursor: 'pointer', padding: '10px 8px', borderRadius: 8,
    fontFamily: T.body, fontSize: 14, fontWeight: 700, color: T.muted, transition: 'color .18s',
    '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px rgba(0,105,92,.28)` },
  },
  segBtnActive: { color: T.primary },

  group: { marginBottom: 18 },
  groupLabel: { fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: T.muted, margin: '0 0 12px' },
  twoUp: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, '@media (max-width: 560px)': { gridTemplateColumns: '1fr' } },
  field: { marginBottom: 14, '&:last-child': { marginBottom: 0 } },
  label: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 6 },
  req: { color: T.primary },
  opt: { color: T.muted, fontWeight: 500, fontSize: 11.5 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 11, fontSize: 18, color: T.muted, pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 12px 11px 36px', borderRadius: 9, border: `1px solid ${T.border}`,
    fontFamily: T.body, fontSize: 14.5, color: T.ink, background: T.white, transition: 'border-color .15s, box-shadow .15s',
    '&::placeholder': { color: '#9aa8a0' },
    '&:hover': { borderColor: '#c9d4cd' },
    '&:focus': { outline: 'none', borderColor: T.primary, boxShadow: `0 0 0 3px rgba(0,105,92,.16)` },
  },
  select: { cursor: 'pointer', appearance: 'menulist', paddingRight: 12 },
  selectDisabled: { background: T.paper, cursor: 'not-allowed', color: T.muted },
  inputError: { borderColor: '#c0392b', '&:focus': { borderColor: '#c0392b', boxShadow: '0 0 0 3px rgba(192,57,43,.15)' } },
  errText: { display: 'flex', alignItems: 'center', gap: 5, color: '#c0392b', fontSize: 12, fontWeight: 600, marginTop: 5 },
  errIcon: { fontSize: 14 },

  submit: {
    width: '100%', marginTop: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    background: T.primary, color: T.white, border: 0, borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
    fontFamily: T.body, fontSize: 15.5, fontWeight: 700, transition: 'background .15s',
    '&:hover': { background: T.primaryDk },
    '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px rgba(0,105,92,.35)` },
    '&:disabled': { opacity: 0.85, cursor: 'default' },
  },
  submitDone: { background: '#2e7d32' },
  note: {
    display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: '12px 14px',
    background: T.paper, border: `1px solid ${T.border}`, borderRadius: 10, color: T.muted, fontSize: 12.5, lineHeight: 1.5,
  },
  noteIcon: { fontSize: 17, color: T.primary, flexShrink: 0, marginTop: 1 },
  hp: { position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' },

  success: { textAlign: 'center', padding: '20px 6px' },
  successRing: {
    width: 64, height: 64, borderRadius: 32, background: '#e7f4ea', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  successTitle: { fontSize: 20, fontWeight: 800, color: T.ink, margin: '0 0 6px' },
  successBody: { fontSize: 14, color: T.muted, lineHeight: 1.55, margin: '0 auto 16px', maxWidth: 340 },
  refBox: {
    display: 'inline-block', padding: '10px 18px', borderRadius: 10, background: T.paper,
    border: `1px dashed ${T.primary}`, fontFamily: T.head, fontSize: 22, fontWeight: 800, letterSpacing: 1, color: T.forest,
  },
  successLink: { marginTop: 18 },
  linkBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    background: 'transparent', border: 0, color: T.primary, fontFamily: T.body, fontSize: 14, fontWeight: 700,
    '&:hover': { textDecoration: 'underline' },
    '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px rgba(0,105,92,.28)`, borderRadius: 6 },
  },

  footer: {
    borderTop: `1px solid ${T.border}`, background: T.white, padding: '18px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    fontSize: 13, color: T.muted,
  },
  footerLink: { color: T.primary, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  ctx, name, label, required, icon, type = 'text', placeholder,
}) {
  const {
    classes, fm, form, errors, set,
  } = ctx;
  return (
    <div className={classes.field}>
      <span className={classes.label}>
        {label}
        {required
          ? <span className={classes.req}>*</span>
          : <span className={classes.opt}>({fm('public.optional')})</span>}
      </span>
      <span className={classes.inputWrap}>
        {icon}
        <input
          className={`${classes.input} ${errors[name] ? classes.inputError : ''}`}
          type={type}
          value={form[name]}
          onChange={set(name)}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={!!errors[name]}
        />
      </span>
      {errors[name] && (
        <span className={classes.errText}><ErrorOutline className={classes.errIcon} />{errors[name]}</span>
      )}
    </div>
  );
}

function SelectField({
  ctx, name, label, required, icon, options, placeholder, value, onChange, disabled,
}) {
  const {
    classes, fm, form, errors, set,
  } = ctx;
  return (
    <div className={classes.field}>
      <span className={classes.label}>
        {label}
        {required
          ? <span className={classes.req}>*</span>
          : <span className={classes.opt}>({fm('public.optional')})</span>}
      </span>
      <span className={classes.inputWrap}>
        {icon}
        <select
          className={`${classes.input} ${classes.select} ${disabled ? classes.selectDisabled : ''} ${errors[name] ? classes.inputError : ''}`}
          value={value !== undefined ? value : form[name]}
          onChange={onChange || set(name)}
          disabled={disabled}
          aria-label={label}
          aria-invalid={!!errors[name]}
        >
          <option value="">{placeholder || fm('public.select.placeholder')}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </span>
      {errors[name] && (
        <span className={classes.errText}><ErrorOutline className={classes.errIcon} />{errors[name]}</span>
      )}
    </div>
  );
}

export default function AccessRequestPublicPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const fm = (id) => formatMessage(id);

  const [form, setForm] = useState({
    request_type: REQUEST_TYPE.NEW, full_name: '', email: '', phone: '',
    organization_paa: '', section_group_id: '', designation: '', hp: '',
    user_category: '', administrative_level: '',
    region: '', district: '', ward: '', village: '',
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | done
  const [reference, setReference] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Reference data (from public REST endpoints).
  const [sections, setSections] = useState([]);
  const [locOptions, setLocOptions] = useState({
    region: [], district: [], ward: [], village: [],
  });

  const isActivate = form.request_type === REQUEST_TYPE.ACTIVATE;
  const isTasaf = form.user_category === USER_CATEGORY.TASAF_STAFF;
  const isPaa = form.user_category === USER_CATEGORY.PAA_STAFF;
  const isOther = form.user_category === USER_CATEGORY.OTHER;
  const locChain = isPaa ? (LOC_CHAIN[form.administrative_level] || []) : [];

  // Section options depend on the chosen category: TASAF staff → all but "user",
  // PAA staff → TMO/PSSC/PSSNA, Other → "user" only.
  const isUserSection = (o) => o.label.trim().toLowerCase() === 'user';
  const isPaaSection = (o) => PAA_SECTIONS.includes(o.label.trim().toUpperCase());
  const sectionOptions = sections.filter((o) => {
    if (isTasaf) return !isUserSection(o) && !isPaaSection(o);
    if (isPaa) return isPaaSection(o);
    if (isOther) return isUserSection(o);
    return false;
  });

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: null });
  };

  const fetchLocations = (parent) => fetch(
    `/api/${AR_API_LOCATIONS}${parent ? `?parent=${parent}` : ''}`,
  ).then((r) => r.json()).then((d) => (d.locations || []).map(
    (l) => ({ value: String(l.id), label: l.name }),
  )).catch(() => []);

  // Load sections + root regions once.
  useEffect(() => {
    fetch(`/api/${AR_API_SECTIONS}`).then((r) => r.json())
      .then((d) => setSections((d.sections || []).map((s) => ({ value: String(s.id), label: s.name }))))
      .catch(() => setSections([]));
    fetchLocations(null).then((opts) => setLocOptions((p) => ({ ...p, region: opts })));
  }, []);

  // Cascading select: set this level, clear all deeper levels + their options, load children.
  const onPickLocation = (level) => (e) => {
    const value = e.target.value;
    const idx = ['region', 'district', 'ward', 'village'].indexOf(level);
    const deeper = ['region', 'district', 'ward', 'village'].slice(idx + 1);
    const clearedForm = { ...form, [level]: value };
    deeper.forEach((d) => { clearedForm[d] = ''; });
    setForm(clearedForm);
    setErrors((prev) => ({ ...prev, [level]: null, location: null }));
    const nextLevel = ['region', 'district', 'ward', 'village'][idx + 1];
    setLocOptions((prev) => {
      const cleared = { ...prev };
      deeper.forEach((d) => { cleared[d] = []; });
      return cleared;
    });
    if (nextLevel && value) {
      fetchLocations(value).then((opts) => setLocOptions((prev) => ({ ...prev, [nextLevel]: opts })));
    }
  };

  // Changing category/level must clear now-hidden fields so they never validate or submit.
  const onPickCategory = (e) => {
    setForm({
      ...form, user_category: e.target.value, section_group_id: '', administrative_level: '',
      region: '', district: '', ward: '', village: '', organization_paa: '', designation: '',
    });
    setErrors((p) => ({ ...p, user_category: null, section_group_id: null }));
  };
  const onPickAdminLevel = (e) => {
    setForm({
      ...form, administrative_level: e.target.value, region: '', district: '', ward: '', village: '',
    });
    setErrors((p) => ({ ...p, administrative_level: null }));
    setLocOptions((p) => ({ ...p, district: [], ward: [], village: [] }));
  };

  // Deepest selected location id is the one persisted (parents derivable via hierarchy).
  const deepestLocationId = () => {
    for (let i = locChain.length - 1; i >= 0; i -= 1) {
      if (form[locChain[i]]) return form[locChain[i]];
    }
    return '';
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = fm('public.form.err.fullNameRequired');
    if (!form.email.trim()) errs.email = fm('public.form.err.emailRequired');
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = fm('public.form.err.emailInvalid');
    if (!form.section_group_id) errs.section_group_id = fm('public.form.err.sectionRequired');
    if (!form.user_category) errs.user_category = fm('public.form.err.categoryRequired');

    if (isPaa) {
      if (!form.administrative_level) errs.administrative_level = fm('public.form.err.adminLevelRequired');
      // Only validate the location levels that are actually shown for this admin level.
      locChain.forEach((lvl) => {
        if (!form[lvl]) errs[lvl] = fm('public.form.err.locationRequired');
      });
    } else if (isOther) {
      if (!form.organization_paa.trim()) errs.organization_paa = fm('public.form.err.orgRequired');
      if (!form.designation.trim()) errs.designation = fm('public.form.err.jobTitleRequired');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    setSubmitError(null);
    if (!validate()) return;
    setState('sending');
    // Send only category-relevant fields; the backend re-validates the same conditions.
    const section = sections.find((s) => s.value === form.section_group_id);
    const payload = {
      request_type: form.request_type,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      hp: form.hp,
      section_group_id: form.section_group_id,
      section: section ? section.label : '',
      user_category: form.user_category,
      administrative_level: isPaa ? form.administrative_level : '',
      requested_location_id: isPaa ? deepestLocationId() : '',
      organization_paa: isOther ? form.organization_paa : '',
      designation: isOther ? form.designation : '',
    };
    fetch(`/api/${AR_API_SUBMIT}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.ok) { setReference(d.reference_code); setState('done'); }
        else { setSubmitError(fm('public.form.failed')); setState('idle'); }
      })
      .catch(() => { setSubmitError(fm('public.form.failed')); setState('idle'); });
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const steps = [
    { n: 1, t: fm('public.step1.title'), b: fm('public.step1.body') },
    { n: 2, t: fm('public.step2.title'), b: fm('public.step2.body') },
    { n: 3, t: fm('public.step3.title'), b: fm('public.step3.body'), done: true },
  ];

  const ctx = {
    classes, fm, form, errors, set,
  };

  return (
    <div className={`ar-public ${classes.page}`}>
      <div className={classes.topbar}>
        <div className={classes.brandRow}>
          <img className={classes.logo} src={LOGO} alt="TASAF" onError={(e) => { e.target.style.display = 'none'; }} />
          <span>
            <span className={classes.wordmark}>TASAF MIS</span>
            <span className={classes.wordmarkSub}>{fm('public.topbar.portal')}</span>
          </span>
        </div>
        <span className={classes.topbarRight}>{fm('public.topbar.gov')}</span>
      </div>

      <div className={classes.hero}>
        <div className={classes.heroInner}>
          <h1 className={classes.h1}>
            {fm('public.hero.line1')}
            {' '}
            <span className={classes.h1accent}>{fm('public.hero.brand')}</span>
            {' '}
            {fm('public.hero.line2')}
          </h1>
          <p className={classes.heroSub}>{fm('public.hero.subtitle')}</p>
          <div className={classes.ctaRow}>
            <button type="button" className={classes.btnPrimary} onClick={() => scrollTo('ar-form')}>
              {fm('public.hero.start')}<ArrowForward style={{ fontSize: 18 }} />
            </button>
            <button type="button" className={classes.btnGhost} onClick={() => history.push('/application-status')}>
              {fm('public.hero.checkStatus')}<ArrowForward style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      <div className={classes.main}>
        <div className={classes.cols}>
          <div id="ar-process" className={classes.process}>
            <div className={`ar-head ${classes.procEyebrow}`}>{fm('public.process.eyebrow')}</div>
            <h2 className={classes.procTitle}>{fm('public.process.title')}</h2>
            <p className={classes.procSub}>{fm('public.process.subtitle')}</p>
            <div className={classes.timeline}>
              <span className={classes.rail} />
              {steps.map((s) => (
                <div key={s.n} className={classes.step}>
                  <span className={`${classes.node} ${s.done ? classes.nodeDone : ''}`}>{s.n}</span>
                  <div className={classes.stepTitle}>{s.t}</div>
                  <p className={classes.stepBody}>{s.b}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="ar-form" className={classes.card}>
            {state === 'done' ? (
              <div className={classes.success}>
                <span className={classes.successRing}><CheckCircleOutline style={{ color: '#2e7d32', fontSize: 40 }} /></span>
                <h3 className={classes.successTitle}>{fm('public.form.successTitle')}</h3>
                <p className={classes.successBody}>{fm('public.form.successBody')}</p>
                <div className={classes.refBox}>{reference}</div>
                <div className={classes.successLink}>
                  <button
                    type="button"
                    className={classes.linkBtn}
                    onClick={() => history.push('/application-status')}
                  >
                    {fm('public.form.checkStatus')}<ArrowForward style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className={classes.cardTitle}>{fm('public.form.title')}</h2>
                <p className={classes.cardHint}>{fm('public.form.requiredNote')}</p>

                <div className={classes.segment} role="tablist" aria-label={fm('public.form.title')}>
                  <span
                    className={classes.segIndicator}
                    style={{ transform: isActivate ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}
                  />
                  <button
                    type="button" role="tab" aria-selected={!isActivate}
                    className={`${classes.segBtn} ${!isActivate ? classes.segBtnActive : ''}`}
                    onClick={() => setForm({ ...form, request_type: REQUEST_TYPE.NEW })}
                  >
                    <Add style={{ fontSize: 17 }} />{fm('public.segmented.new')}
                  </button>
                  <button
                    type="button" role="tab" aria-selected={isActivate}
                    className={`${classes.segBtn} ${isActivate ? classes.segBtnActive : ''}`}
                    onClick={() => setForm({ ...form, request_type: REQUEST_TYPE.ACTIVATE })}
                  >
                    <Autorenew style={{ fontSize: 17 }} />{fm('public.segmented.activate')}
                  </button>
                </div>

                <div className={classes.group}>
                  <div className={classes.groupLabel}>{fm('public.form.group.details')}</div>
                  <Field
                    ctx={ctx}
                    name="full_name" required label={fm('field.fullName')}
                    placeholder={fm('public.ph.fullName')}
                    icon={<PersonOutline className={classes.inputIcon} />}
                  />
                  <div className={classes.twoUp}>
                    <Field
                    ctx={ctx}
                      name="email" required type="email" label={fm('field.email')}
                      placeholder={fm('public.ph.email')}
                      icon={<MailOutline className={classes.inputIcon} />}
                    />
                    <Field
                    ctx={ctx}
                      name="phone" label={fm('field.phone')}
                      placeholder={fm('public.ph.phone')}
                      icon={<PhoneOutlined className={classes.inputIcon} />}
                    />
                  </div>
                </div>

                <div className={classes.group}>
                  <div className={classes.groupLabel}>{fm('public.form.group.org')}</div>
                  <div className={classes.twoUp}>
                    <SelectField
                      ctx={ctx}
                      name="user_category" required label={fm('field.userCategory')}
                      onChange={onPickCategory}
                      options={[
                        { value: USER_CATEGORY.TASAF_STAFF, label: fm(`userCategory.${USER_CATEGORY.TASAF_STAFF}`) },
                        { value: USER_CATEGORY.PAA_STAFF, label: fm(`userCategory.${USER_CATEGORY.PAA_STAFF}`) },
                        { value: USER_CATEGORY.OTHER, label: fm(`userCategory.${USER_CATEGORY.OTHER}`) },
                      ]}
                      placeholder={fm('public.ph.userCategory')}
                      icon={<CategoryOutlined className={classes.inputIcon} />}
                    />
                    <SelectField
                      ctx={ctx}
                      name="section_group_id" required label={fm('field.section')}
                      options={sectionOptions}
                      disabled={!form.user_category}
                      placeholder={fm('public.ph.section')}
                      icon={<GroupOutlined className={classes.inputIcon} />}
                    />
                  </div>

                  {isPaa && (
                    <SelectField
                      ctx={ctx}
                      name="administrative_level" required label={fm('field.administrativeLevel')}
                      onChange={onPickAdminLevel}
                      options={[
                        { value: ADMIN_LEVEL.PAA, label: fm(`adminLevel.${ADMIN_LEVEL.PAA}`) },
                        { value: ADMIN_LEVEL.VILLAGE, label: fm(`adminLevel.${ADMIN_LEVEL.VILLAGE}`) },
                      ]}
                      placeholder={fm('public.ph.administrativeLevel')}
                      icon={<LayersOutlined className={classes.inputIcon} />}
                    />
                  )}
                </div>

                {isPaa && !!locChain.length && (
                  <div className={classes.group}>
                    <div className={classes.groupLabel}>{fm('public.form.group.location')}</div>
                    <div className={classes.twoUp}>
                      {locChain.map((lvl, i) => (
                        <SelectField
                          key={lvl}
                          ctx={ctx}
                          name={lvl} required label={fm(`field.${lvl}`)}
                          options={locOptions[lvl]}
                          value={form[lvl]}
                          onChange={onPickLocation(lvl)}
                          disabled={i > 0 && !form[locChain[i - 1]]}
                          icon={<PlaceOutlined className={classes.inputIcon} />}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isOther && (
                  <div className={classes.group}>
                    <div className={classes.groupLabel}>{fm('public.form.group.external')}</div>
                    <Field
                      ctx={ctx}
                      name="organization_paa" required label={fm('field.organizationName')}
                      placeholder={fm('public.ph.org')}
                      icon={<BusinessOutlined className={classes.inputIcon} />}
                    />
                    <Field
                      ctx={ctx}
                      name="designation" required label={fm('field.designation')}
                      placeholder={fm('public.ph.designation')}
                      icon={<WorkOutline className={classes.inputIcon} />}
                    />
                  </div>
                )}

                {/* honeypot — bots fill this; humans never see it */}
                <input className={classes.hp} tabIndex={-1} autoComplete="off" value={form.hp} onChange={set('hp')} aria-hidden="true" />

                {submitError && (
                  <span className={classes.errText}><ErrorOutline className={classes.errIcon} />{submitError}</span>
                )}

                <button
                  type="button"
                  className={`${classes.submit} ${state === 'done' ? classes.submitDone : ''}`}
                  onClick={submit}
                  disabled={state === 'sending'}
                >
                  {state === 'sending' && <CircularProgress size={18} style={{ color: '#fff' }} />}
                  {state === 'sending'
                    ? fm('public.form.submit.sending')
                    : (isActivate ? fm('public.form.submit.activate') : fm('public.form.submit.new'))}
                  {state === 'idle' && <ArrowForward style={{ fontSize: 18 }} />}
                </button>

                <div className={classes.note}>
                  <LockOutlined className={classes.noteIcon} />
                  <span>{fm('public.form.note')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={classes.footer}>
        <span>{`© ${new Date().getFullYear()} ${fm('public.footer.copy')}`}</span>
        <span>
          {fm('public.footer.help')}{' '}
          <a className={classes.footerLink} href={fm('public.footer.helpHref')}>{fm('public.footer.helpLink')}</a>
        </span>
      </div>
    </div>
  );
}
