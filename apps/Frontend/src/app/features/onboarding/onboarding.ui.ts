/**
 * Shared look of the sign-up wizard steps — same language as the landing and login
 * (espresso + copper, Vollkorn headings, 16px inputs, visible focus). Class names match the step templates.
 */
export const ONB_STYLES = `
  :host { display: block; --ink: #2a1b12; --copper: #b85a2b; --copper-2: #e09a68; --copper-soft: #fbeee4; --paper: #f5efe5;
    --line: #e6dccc; --text: #1c1c16; --muted: #5e5149; --muted-2: #6f6760; --green: #146c43; --red: #8c1d12; }
  .material-symbols-outlined { font-size: 20px; line-height: 1; }
  .step-card { background: #fff; border: 1px solid var(--line); border-radius: 24px; box-shadow: 0 24px 60px rgba(42,27,18,.06); padding: clamp(22px, 4vw, 40px); }
  .step-header { margin-bottom: 28px; }
  .step-badge { align-items: center; background: var(--copper-soft); border-radius: 999px; color: #74361f; display: inline-flex; font-size: 13px; font-weight: 700; gap: 6px; padding: 6px 12px; }
  .step-badge .material-symbols-outlined { font-size: 18px; }
  .step-header h2 { color: var(--ink); font: 700 clamp(26px, 3vw, 34px)/1.12 'Vollkorn', serif; letter-spacing: -.01em; margin: 14px 0 8px; }
  .step-header p { color: var(--muted); font-size: 16px; margin: 0; max-width: 60ch; }
  .step-form { display: flex; flex-direction: column; gap: 22px; }
  .form-grid, .form-row { display: grid; gap: 18px; grid-template-columns: 1fr 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .form-group > label, .field-label { align-items: center; color: var(--ink); display: flex; font-size: 14px; font-weight: 700; gap: 6px; justify-content: space-between; }
  .required { color: var(--copper); font-size: 12px; font-weight: 700; }
  .optional { color: var(--muted-2); font-size: 12px; font-weight: 600; }
  .hint { color: var(--muted-2); font-size: 13px; line-height: 1.45; }
  .input-wrap { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 14px; display: flex; min-height: 50px; overflow: hidden; position: relative; transition: border-color .2s, box-shadow .2s; }
  .input-wrap:focus-within { border-color: #c4703f; box-shadow: 0 0 0 4px rgba(196,112,63,.15); }
  .input-wrap > .material-symbols-outlined { color: #8a7a6f; flex: none; padding-left: 14px; pointer-events: none; }
  .input-wrap input, .input-wrap select { appearance: none; background: transparent; border: 0; color: var(--text); flex: 1; font: 16px 'Plus Jakarta Sans', sans-serif; min-height: 48px; min-width: 0; outline: none; padding: 0 14px; width: 100%; }
  .input-wrap input[readonly] { color: var(--muted); }
  textarea { background: #fff; border: 1.5px solid var(--line); border-radius: 14px; color: var(--text); font: 16px/1.5 'Plus Jakarta Sans', sans-serif; padding: 12px 14px; resize: vertical; width: 100%; }
  textarea:focus { border-color: #c4703f; box-shadow: 0 0 0 4px rgba(196,112,63,.15); outline: none; }
  .prefix, .slug-prefix { align-self: stretch; align-items: center; background: var(--paper); border-right: 1.5px solid var(--line); color: var(--muted); display: flex; flex: none; font-size: 14px; font-weight: 600; padding: 0 12px; white-space: nowrap; }
  .error-message { align-items: center; background: #fdecea; border: 1px solid #f2bdb8; border-radius: 12px; color: var(--red); display: flex; font-size: 14px; gap: 8px; padding: 12px 14px; }
  .btn { align-items: center; border: 0; border-radius: 14px; cursor: pointer; display: inline-flex; font: 700 16px 'Plus Jakarta Sans', sans-serif; gap: 8px; justify-content: center; min-height: 52px; padding: 0 22px; text-decoration: none; transition: transform .2s, box-shadow .2s, background .2s; }
  .btn:disabled { cursor: not-allowed; opacity: .55; }
  .btn-primary { background: linear-gradient(135deg, var(--copper-2), #c4703f); box-shadow: 0 10px 24px rgba(196,112,63,.3); color: #17100c; }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 14px 30px rgba(196,112,63,.4); transform: translateY(-1px); }
  .btn-secondary { background: #fff; border: 1.5px solid var(--line); color: var(--ink); }
  .btn-secondary:hover:not(:disabled) { border-color: #c4703f; }
  input[type='checkbox'] { accent-color: #b85a2b; height: 20px; width: 20px; }
  a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible { outline: 3px solid var(--copper-2); outline-offset: 2px; }
  @media (max-width: 720px) { .form-grid, .form-row { grid-template-columns: 1fr; } }
  @media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
`;
