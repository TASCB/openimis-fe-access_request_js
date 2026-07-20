import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import ConfirmationNumberOutlined from '@material-ui/icons/ConfirmationNumberOutlined';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import { useModulesManager, useTranslations, useHistory } from '@openimis/fe-core';
import { MODULE_NAME, AR_API_STATUS } from '../constants';

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

const STATUS_META = {
  received: { color: '#00695C', bg: '#DCEEE9' },
  in_review: { color: '#b26a00', bg: '#fdf0dc' },
  approved: { color: '#2e7d32', bg: '#e7f4ea' },
  not_approved: { color: '#c0392b', bg: '#fbe9e7' },
};
const STATUS_ORDER = ['received', 'in_review', 'approved', 'not_approved'];

const useStyles = makeStyles({
  '@global': {
    '.ar-public, .ar-public *': { boxSizing: 'border-box', fontFamily: T.body },
    '.ar-public h1, .ar-public h2, .ar-public h3, .ar-public .ar-head': { fontFamily: T.head },
    '@media (prefers-reduced-motion: reduce)': {
      '.ar-public *': { transition: 'none !important', animation: 'none !important' },
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

  guide: { paddingTop: 4, '@media (max-width: 900px)': { paddingTop: 0 } },
  guideEyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.primary },
  guideTitle: { fontSize: 24, fontWeight: 800, color: T.ink, margin: '8px 0 8px' },
  guideSub: { fontSize: 14.5, lineHeight: 1.55, color: T.muted, maxWidth: 380, margin: '0 0 24px' },
  legend: { display: 'flex', flexDirection: 'column', gap: 14 },
  legendItem: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, flexShrink: 0 },
  legendLabel: { fontSize: 15, fontWeight: 700, color: T.ink, margin: 0 },
  legendDesc: { fontSize: 13, lineHeight: 1.5, color: T.muted, margin: '2px 0 0' },

  card: {
    background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28,
    boxShadow: '0 18px 40px rgba(6,56,31,.08)',
    '@media (max-width: 430px)': { padding: 18 },
  },
  cardTitle: { fontSize: 20, fontWeight: 800, color: T.ink, margin: '0 0 4px' },
  cardHint: { fontSize: 13, color: T.muted, margin: '0 0 18px' },

  label: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 6 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 11, fontSize: 18, color: T.muted, pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 12px 11px 36px', borderRadius: 9, border: `1px solid ${T.border}`,
    fontFamily: T.head, fontSize: 15, fontWeight: 700, letterSpacing: 0.5, color: T.ink, background: T.white,
    textTransform: 'uppercase', transition: 'border-color .15s, box-shadow .15s',
    '&::placeholder': { color: '#9aa8a0', fontWeight: 500, letterSpacing: 0, textTransform: 'none' },
    '&:hover': { borderColor: '#c9d4cd' },
    '&:focus': { outline: 'none', borderColor: T.primary, boxShadow: `0 0 0 3px rgba(0,105,92,.16)` },
  },
  inputError: { borderColor: '#c0392b', '&:focus': { borderColor: '#c0392b', boxShadow: '0 0 0 3px rgba(192,57,43,.15)' } },

  submit: {
    width: '100%', marginTop: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    background: T.primary, color: T.white, border: 0, borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
    fontFamily: T.body, fontSize: 15.5, fontWeight: 700, transition: 'background .15s',
    '&:hover': { background: T.primaryDk },
    '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px rgba(0,105,92,.35)` },
    '&:disabled': { opacity: 0.85, cursor: 'default' },
  },
  errText: { display: 'flex', alignItems: 'center', gap: 5, color: '#c0392b', fontSize: 12.5, fontWeight: 600, marginTop: 12 },
  errIcon: { fontSize: 15 },

  result: { marginTop: 20, borderRadius: 12, padding: '18px 18px', border: '1px solid' },
  resultTop: { display: 'flex', alignItems: 'center', gap: 12 },
  pill: {
    display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 999,
    fontFamily: T.head, fontSize: 13, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  resultRef: { fontFamily: T.head, fontWeight: 800, fontSize: 15, color: T.ink, marginLeft: 'auto' },
  resultDesc: { fontSize: 13.5, lineHeight: 1.55, color: T.ink, margin: '12px 0 0' },

  footer: {
    borderTop: `1px solid ${T.border}`, background: T.white, padding: '18px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    fontSize: 13, color: T.muted,
  },
  footerLink: { color: T.primary, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
});

export default function AccessRequestStatusPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const fm = formatMessage;

  const [ref, setRef] = useState('');
  const [state, setState] = useState('idle'); // idle | checking | result | error
  const [status, setStatus] = useState(null); // one of STATUS_META keys
  const [checked, setChecked] = useState(''); // reference the result belongs to
  const [error, setError] = useState(null);

  const check = () => {
    const code = ref.trim();
    setError(null); setStatus(null);
    if (!code) { setError(fm('public.track.err.required')); setState('error'); return; }
    setState('checking');
    fetch(`/api/${AR_API_STATUS}${encodeURIComponent(code)}/`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.status && STATUS_META[d.status]) {
          setStatus(d.status); setChecked(code.toUpperCase()); setState('result');
        } else {
          setError(fm('public.track.err.notFound')); setState('error');
        }
      })
      .catch(() => { setError(fm('public.track.err.generic')); setState('error'); });
  };

  const onKeyDown = (e) => { if (e.key === 'Enter') check(); };
  const meta = status ? STATUS_META[status] : null;

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
            {fm('public.track.hero.line1')}
            {' '}
            <span className={classes.h1accent}>{fm('public.track.hero.brand')}</span>
            {' '}
            {fm('public.track.hero.line2')}
          </h1>
          <p className={classes.heroSub}>{fm('public.track.hero.subtitle')}</p>
          <div className={classes.ctaRow}>
            <button type="button" className={classes.btnGhost} onClick={() => history.push('/account-request')}>
              <ArrowBack style={{ fontSize: 18 }} />{fm('public.track.hero.newApplication')}
            </button>
          </div>
        </div>
      </div>

      <div className={classes.main}>
        <div className={classes.cols}>
          <div className={classes.guide}>
            <div className={`ar-head ${classes.guideEyebrow}`}>{fm('public.track.guide.eyebrow')}</div>
            <h2 className={classes.guideTitle}>{fm('public.track.guide.title')}</h2>
            <p className={classes.guideSub}>{fm('public.track.guide.subtitle')}</p>
            <div className={classes.legend}>
              {STATUS_ORDER.map((k) => (
                <div key={k} className={classes.legendItem}>
                  <span className={classes.dot} style={{ background: STATUS_META[k].color }} />
                  <div>
                    <p className={classes.legendLabel}>{fm(`public.track.state.${k}`)}</p>
                    <p className={classes.legendDesc}>{fm(`public.track.desc.${k}`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={classes.card}>
            <h2 className={classes.cardTitle}>{fm('public.track.card.title')}</h2>
            <p className={classes.cardHint}>{fm('public.track.card.hint')}</p>

            <div className={classes.label}>
              <ConfirmationNumberOutlined style={{ fontSize: 16, color: T.primary }} />
              {fm('public.track.field.reference')}
            </div>
            <div className={classes.inputWrap}>
              <SearchOutlined className={classes.inputIcon} />
              <input
                className={`${classes.input} ${state === 'error' && error ? classes.inputError : ''}`}
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={fm('public.track.field.placeholder')}
                aria-label={fm('public.track.field.reference')}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {state === 'error' && error && (
              <span className={classes.errText}><ErrorOutline className={classes.errIcon} />{error}</span>
            )}

            {state === 'result' && meta && (
              <div className={classes.result} style={{ background: meta.bg, borderColor: meta.color }}>
                <div className={classes.resultTop}>
                  <span className={classes.pill} style={{ background: meta.color, color: T.white }}>
                    {fm(`public.track.state.${status}`)}
                  </span>
                  <span className={classes.resultRef}>{checked}</span>
                </div>
                <p className={classes.resultDesc}>{fm(`public.track.desc.${status}`)}</p>
              </div>
            )}

            <button type="button" className={classes.submit} onClick={check} disabled={state === 'checking'}>
              {state === 'checking' && <CircularProgress size={18} style={{ color: '#fff' }} />}
              {state === 'checking' ? fm('public.track.checking') : fm('public.track.check')}
              {state !== 'checking' && <ArrowForward style={{ fontSize: 18 }} />}
            </button>
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
