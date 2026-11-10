/**
 * Shared look of the platform console — same language as the landing and login:
 * espresso + copper, Vollkorn headings, Plus Jakarta Sans body, 16px+ text, visible focus.
 */
export const PA_STYLES = `
  :host { display: block; }
  .pa { --espresso: #17100c; --ink: #2a1b12; --copper: #b85a2b; --copper-2: #e09a68; --copper-soft: #fbeee4;
    --cream: #fbf7ef; --paper: #f5efe5; --line: #e6dccc; --text: #1c1c16; --muted: #5e5149; --muted-2: #6f6760;
    --green: #146c43; --green-bg: #e5f4ec; --amber: #7a4d00; --amber-bg: #fff4dc; --red: #8c1d12; --red-bg: #fdecea;
    color: var(--text); font: 15px/1.55 'Plus Jakarta Sans', sans-serif; margin: 0 auto; max-width: 1280px;
    padding: clamp(20px, 3.5vw, 36px); }
  .material-symbols-outlined { font-size: 20px; line-height: 1; }
  a { color: inherit; }
  a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 3px solid var(--copper-2); outline-offset: 2px; }

  .head { align-items: flex-end; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; margin-bottom: 24px; }
  .eyebrow { color: var(--copper); font-size: 13px; font-weight: 700; letter-spacing: .12em; margin: 0 0 6px; text-transform: uppercase; }
  h1 { font: 700 clamp(28px, 3.4vw, 38px)/1.12 'Vollkorn', serif; margin: 0; }
  h1 em { color: var(--copper); font-style: italic; }
  .sub { color: var(--muted); margin: 6px 0 0; max-width: 60ch; }
  h2 { font: 600 21px/1.25 'Vollkorn', serif; margin: 0; }
  .muted { color: var(--muted); }

  .btn { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 12px; color: var(--ink); cursor: pointer;
    display: inline-flex; font: 700 14px 'Plus Jakarta Sans', sans-serif; gap: 6px; justify-content: center; min-height: 42px; padding: 0 16px;
    text-decoration: none; transition: background .2s, border-color .2s, transform .2s, box-shadow .2s; white-space: nowrap; }
  .btn:hover:not(:disabled) { border-color: var(--copper); }
  .btn:disabled { cursor: not-allowed; opacity: .55; }
  .btn-primary { background: linear-gradient(135deg, var(--copper-2), #c4703f); border-color: transparent; box-shadow: 0 8px 20px rgba(196,112,63,.28); color: var(--espresso); }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 12px 26px rgba(196,112,63,.38); transform: translateY(-1px); }
  .btn-dark { background: var(--ink); border-color: var(--ink); color: #fff; }
  .btn-dark:hover:not(:disabled) { background: #412311; }
  .btn-danger { background: var(--red-bg); border-color: #f2bdb8; color: var(--red); }
  .btn-icon { min-height: 40px; padding: 0; width: 40px; }

  .card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px 22px; }
  .card-head { align-items: flex-start; display: flex; gap: 12px; justify-content: space-between; margin-bottom: 16px; }
  .card-head p { color: var(--muted); font-size: 14px; margin: 3px 0 0; }

  .kpis { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px; }
  .kpi { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; }
  .kpi-top { align-items: center; display: flex; justify-content: space-between; margin-bottom: 8px; }
  .kpi-label { color: var(--muted); font-size: 14px; font-weight: 600; }
  .kpi-icon { align-items: center; background: var(--copper-soft); border-radius: 10px; color: #8c4029; display: flex; height: 36px; justify-content: center; width: 36px; }
  .kpi-value { display: block; font: 700 30px/1.15 'Vollkorn', serif; font-variant-numeric: tabular-nums; }
  .kpi-detail { color: var(--muted); font-size: 13px; margin: 4px 0 0; }

  .chip { align-items: center; border: 1px solid transparent; border-radius: 999px; display: inline-flex; font-size: 12px; font-weight: 700; gap: 6px; padding: 3px 10px; white-space: nowrap; }
  .chip::before { background: currentColor; border-radius: 50%; content: ''; height: 7px; width: 7px; }
  .chip[data-tone='active'] { background: var(--green-bg); border-color: #a9dcc0; color: var(--green); }
  .chip[data-tone='provisioning'] { background: var(--amber-bg); border-color: #f1d48f; color: var(--amber); }
  .chip[data-tone='suspended'], .chip[data-tone='blocked'] { background: var(--red-bg); border-color: #f2bdb8; color: var(--red); }
  .chip[data-tone='deleting'], .chip[data-tone='deleted'], .chip[data-tone='inactive'], .chip[data-tone='invited'] { background: #f1f0ee; border-color: #d9d4cd; color: #4f4a44; }

  .field label, .label { color: var(--ink); display: block; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .input, select.input, textarea.input { background: #fff; border: 1.5px solid var(--line); border-radius: 12px; color: var(--text); font: 15px 'Plus Jakarta Sans', sans-serif;
    min-height: 44px; padding: 0 12px; transition: border-color .2s, box-shadow .2s; width: 100%; }
  textarea.input { min-height: 90px; padding: 10px 12px; resize: vertical; }
  .input:focus { border-color: #c4703f; box-shadow: 0 0 0 4px rgba(196,112,63,.15); outline: none; }
  .hint { color: var(--muted-2); font-size: 13px; margin: 6px 0 0; }
  .err { color: var(--red); font-size: 13px; font-weight: 600; margin: 6px 0 0; }

  .search { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 12px; display: flex; gap: 8px; min-height: 44px; padding: 0 12px; }
  .search:focus-within { border-color: #c4703f; box-shadow: 0 0 0 4px rgba(196,112,63,.15); }
  .search input { background: none; border: 0; flex: 1; font: 15px 'Plus Jakarta Sans', sans-serif; min-width: 0; outline: none; }
  .search .material-symbols-outlined { color: var(--muted-2); }

  .table-wrap { overflow-x: auto; }
  table.data { border-collapse: collapse; min-width: 720px; width: 100%; }
  .data th { border-bottom: 1px solid var(--line); color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: .06em; padding: 10px 12px; text-align: left; text-transform: uppercase; white-space: nowrap; }
  .data td { border-bottom: 1px solid #f0ebe3; padding: 12px; vertical-align: middle; }
  .data tbody tr { transition: background .15s; }
  .data tbody tr:hover { background: #fcf9f4; }
  .data tr.clickable { cursor: pointer; }
  .num { font-variant-numeric: tabular-nums; text-align: right; }

  .ent { align-items: center; display: flex; gap: 12px; min-width: 0; }
  .avatar { align-items: center; background: var(--copper-soft); border-radius: 12px; color: #74361f; display: flex; flex: none; font-size: 14px; font-weight: 800;
    height: 40px; justify-content: center; overflow: hidden; width: 40px; }
  .avatar img { height: 100%; object-fit: cover; width: 100%; }
  .ent strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ent small { color: var(--muted); display: block; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .alert { align-items: flex-start; border-radius: 12px; display: flex; font-size: 14px; gap: 10px; margin-bottom: 16px; padding: 12px 14px; }
  .alert.error { background: var(--red-bg); border: 1px solid #f2bdb8; color: var(--red); }
  .alert.ok { background: var(--green-bg); border: 1px solid #a9dcc0; color: var(--green); }
  .alert.info { background: var(--paper); border: 1px solid var(--line); color: var(--ink); }
  .alert .grow { flex: 1; }
  .alert button { background: none; border: 0; color: inherit; cursor: pointer; padding: 0; }

  .empty { align-items: center; border: 2px dashed var(--line); border-radius: 16px; color: var(--muted); display: flex; flex-direction: column; gap: 6px; padding: 40px 16px; text-align: center; }
  .empty .material-symbols-outlined { color: #a08d7e; font-size: 34px; }
  .empty strong { color: var(--ink); font-size: 16px; }
  .empty p { margin: 0; }

  .sk { animation: pa-pulse 1.4s ease-in-out infinite; background: #f1ece4; border-radius: 12px; display: block; }
  @keyframes pa-pulse { 50% { opacity: .55; } }
  @media (prefers-reduced-motion: reduce) { .sk { animation: none; } .btn { transition: none; } }
`;
