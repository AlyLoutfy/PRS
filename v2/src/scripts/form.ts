// Enquiry form: validation, draft keeping, sending and the result states.
//
// Sending — one place to change when the backend arrives:
//   • PUBLIC_LEAD_ENDPOINT set at build time → the payload below is POSTed as JSON to that URL. Any
//     2xx answer counts as success; everything else (and network errors) shows the retry message.
//   • not set → the visitor's e-mail app is opened with the enquiry prefilled (mailto:), and the result
//     panel says so truthfully ("send it from there").
import gsap from 'gsap';
import { lead, type LeadState } from './lead-store';

interface Strings {
  email: string;
  topics: Record<string, string>;
  remove: string;
  submit: string;
  sending: string;
  errors: { summary: string; name: string; email: string; message: string; consent: string };
  success: { title: string; titlePlain: string; text: string; again: string };
  mail: { title: string; text: string; notOpened: string; copy: string; copied: string; open: string; edit: string };
  failure: { title: string; text: string; mail: string };
  mailSubject: string;
  mailFields: { topic: string; selection: string; name: string; company: string; email: string; phone: string };
}

export interface LeadPayload {
  topic: string;
  topicLabel: string;
  selection: string[];
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  consent: true;
  language: string;
  page: string;
  submittedAt: string;
}

type FieldName = 'name' | 'email' | 'message';
const DRAFT_KEY = 'prs-lead-draft';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const svg = (viewBox: string, inner: string, cls?: string) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', viewBox);
  node.setAttribute('aria-hidden', 'true');
  if (cls) node.setAttribute('class', cls);
  node.innerHTML = inner; // static markup only, never visitor input
  return node;
};
const ARROW = '<path d="M1 7h11M8 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.3" />';

export function initLeadForm(form: HTMLFormElement, opts: { reduced: boolean }) {
  const strings = JSON.parse(form.querySelector('[data-lead-strings]')?.textContent || '{}') as Strings;
  const endpoint = form.dataset.endpoint || '';
  const lang = form.dataset.lang || document.documentElement.lang || 'de';
  const result = form.parentElement!.querySelector<HTMLElement>('[data-lead-result]')!;
  const statusEl = form.querySelector<HTMLElement>('[data-lead-status]')!;
  const alertEl = form.querySelector<HTMLElement>('[data-lead-alert]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-lead-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-lead-submit-label]')!;
  const tagsWrap = form.querySelector<HTMLElement>('[data-lead-tags]')!;
  const tagsList = form.querySelector<HTMLElement>('[data-lead-tags-list]')!;
  const input = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
  const consent = input('consent') as HTMLInputElement;
  const honeypot = input('website') as HTMLInputElement;
  const wrapOf = (name: string) => form.querySelector<HTMLElement>(`[data-field="${name}"]`)!;
  const topicInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="topic"]'));
  const lightTone = !form.closest('.section--ink');
  let busy = false;

  /* ---------------------------------------------------------------- selection (tags) */
  const renderTags = (state: LeadState) => {
    tagsList.textContent = '';
    state.tags.forEach((tag) => {
      const li = el('li', 'lead-tag');
      li.append(el('span', undefined, tag.label));
      const btn = el('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `${strings.remove}: ${tag.label}`);
      btn.append(svg('0 0 12 12', '<path d="M2 2l8 8M10 2 2 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />'));
      btn.addEventListener('click', () => lead.remove(tag.id));
      li.append(btn);
      tagsList.append(li);
    });
    tagsWrap.hidden = state.tags.length === 0;
    if (state.topic) topicInputs.forEach((r) => { if (r.value === state.topic) r.checked = true; });
    // With a selection the message becomes optional: the selection is the request.
    if (wrapOf('message').classList.contains('is-invalid')) validate('message');
  };

  /* ---------------------------------------------------------------- validation */
  const checks: Record<FieldName, (value: string) => string> = {
    name: (v) => (v.trim().length >= 2 ? '' : strings.errors.name),
    email: (v) => (EMAIL_RE.test(v.trim()) ? '' : strings.errors.email),
    message: (v) => (v.trim().length >= 3 || lead.get().tags.length > 0 ? '' : strings.errors.message),
  };
  const setError = (name: string, message: string) => {
    const wrap = wrapOf(name);
    const control = input(name);
    const error = wrap.querySelector<HTMLElement>('.field__error')!;
    wrap.classList.toggle('is-invalid', !!message);
    if (message) {
      wrap.classList.remove('is-valid');
      control.setAttribute('aria-invalid', 'true');
      error.textContent = message;
      error.hidden = false;
    } else {
      control.removeAttribute('aria-invalid');
      error.hidden = true;
      error.textContent = '';
    }
  };
  function validate(name: FieldName): boolean {
    const message = checks[name](input(name).value);
    setError(name, message);
    wrapOf(name).classList.toggle('is-valid', !message && input(name).value.trim().length > 0);
    return !message;
  }
  const validateConsent = (): boolean => {
    setError('consent', consent.checked ? '' : strings.errors.consent);
    return consent.checked;
  };

  (['name', 'email', 'message'] as FieldName[]).forEach((name) => {
    const control = input(name);
    control.addEventListener('blur', () => {
      if (control.value.trim() || wrapOf(name).classList.contains('is-invalid')) validate(name);
    });
    control.addEventListener('input', () => {
      if (wrapOf(name).classList.contains('is-invalid')) validate(name);
      else if (name !== 'message') wrapOf(name).classList.remove('is-valid');
    });
  });
  consent.addEventListener('change', () => { if (consent.checked) setError('consent', ''); });

  /* ---------------------------------------------------------------- draft */
  const draftFields = ['name', 'email', 'company', 'phone', 'message'];
  let draftTimer = 0;
  const saveDraft = () => {
    clearTimeout(draftTimer);
    draftTimer = window.setTimeout(() => {
      const draft: Record<string, string> = {};
      draftFields.forEach((n) => { draft[n] = input(n).value; });
      try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* private mode */ }
    }, 250);
  };
  const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null') as Record<string, string> | null;
    if (draft) draftFields.forEach((n) => { if (typeof draft[n] === 'string' && !input(n).value) input(n).value = draft[n]; });
  } catch { /* ignore */ }
  form.addEventListener('input', saveDraft);

  /* ---------------------------------------------------------------- topic */
  const queryTopic = new URLSearchParams(location.search).get('topic');
  if (queryTopic && strings.topics[queryTopic]) lead.setTopic(queryTopic);
  topicInputs.forEach((r) => r.addEventListener('change', () => { if (r.checked) lead.setTopic(r.value); }));
  lead.subscribe(renderTags);
  renderTags(lead.get());

  // Textarea grows with its content where the browser cannot do it natively.
  const message = input('message') as HTMLTextAreaElement;
  if (!CSS.supports('field-sizing', 'content')) {
    const grow = () => { message.style.height = 'auto'; message.style.height = `${Math.min(message.scrollHeight + 2, innerHeight * 0.6)}px`; };
    message.addEventListener('input', grow);
    if (message.value) grow();
  }

  /* ---------------------------------------------------------------- payload */
  const collect = (): LeadPayload => {
    const topic = topicInputs.find((r) => r.checked)?.value ?? 'general';
    return {
      topic,
      topicLabel: strings.topics[topic] ?? topic,
      selection: lead.get().tags.map((t) => t.label),
      name: input('name').value.trim(),
      email: input('email').value.trim(),
      company: input('company').value.trim(),
      phone: input('phone').value.trim(),
      message: input('message').value.trim(),
      consent: true,
      language: lang,
      page: location.pathname,
      submittedAt: new Date().toISOString(),
    };
  };
  const mailText = (p: LeadPayload) => {
    const f = strings.mailFields;
    const lines = [
      p.message,
      p.message ? '' : null,
      '—',
      `${f.topic}: ${p.topicLabel}`,
      p.selection.length ? `${f.selection}: ${p.selection.join('; ')}` : null,
      `${f.name}: ${p.name}`,
      p.company ? `${f.company}: ${p.company}` : null,
      `${f.email}: ${p.email}`,
      p.phone ? `${f.phone}: ${p.phone}` : null,
    ];
    return lines.filter((l): l is string => l !== null).join('\n');
  };
  const mailHref = (p: LeadPayload) =>
    `mailto:${strings.email}?subject=${encodeURIComponent(`${strings.mailSubject}: ${p.topicLabel}`)}&body=${encodeURIComponent(mailText(p))}`;

  /* ---------------------------------------------------------------- result panels */
  const button = (label: string, variant: string, onClick: () => void, arrow = false) => {
    const btn = el('button', `pill ${variant}`);
    btn.type = 'button';
    btn.append(el('span', undefined, label));
    if (arrow) btn.append(svg('0 0 14 14', ARROW, 'pill__arrow'));
    btn.addEventListener('click', onClick);
    return btn;
  };
  const primary = lightTone ? 'pill--ink' : 'pill--white';
  const secondary = lightTone ? '' : 'pill--light';

  const showResult = (kind: 'success' | 'mail', payload: LeadPayload) => {
    result.textContent = '';
    const icon =
      kind === 'success'
        ? svg('0 0 64 64', '<circle cx="32" cy="32" r="30" /><path d="M20 33.5 28.5 42 45 24" />', 'lead-result__icon')
        : svg('0 0 64 64', '<path d="M8 17h48v30H8z" /><path d="M8 19l24 17 24-17" />', 'lead-result__icon');
    const first = payload.name.split(/\s+/)[0] ?? '';
    const title = el(
      'h3',
      'lead-result__title',
      kind === 'success' ? (first ? strings.success.title.replace('{name}', first) : strings.success.titlePlain) : strings.mail.title,
    );
    const text = el('p', 'lead-result__text', kind === 'success' ? strings.success.text : strings.mail.text);
    const row = el('div', 'pill-row');
    result.append(icon, title, text);

    const backToForm = (reset: boolean) => {
      if (reset) {
        form.reset();
        clearDraft();
        lead.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach((n) => n.classList.remove('is-valid', 'is-invalid'));
      }
      result.hidden = true;
      form.hidden = false;
      gsap.fromTo(form, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: opts.reduced ? 0 : 0.6, ease: 'expo.out', clearProps: 'opacity,transform' });
      input('name').focus({ preventScroll: true });
    };

    if (kind === 'success') {
      row.append(button(strings.success.again, secondary, () => backToForm(true)));
    } else {
      const help = el('p', 'lead-result__help');
      const link = el('a', undefined, strings.email);
      link.href = `mailto:${strings.email}`;
      help.append(`${strings.mail.notOpened} `, link, '.');
      result.append(help);
      const copy = button(strings.mail.copy, primary, async () => {
        const label = copy.querySelector('span')!;
        try {
          await navigator.clipboard.writeText(mailText(payload));
          label.textContent = strings.mail.copied;
          setTimeout(() => { label.textContent = strings.mail.copy; }, 2400);
        } catch {
          // Clipboard blocked: fall back to opening the e-mail again.
          location.href = mailHref(payload);
        }
      });
      row.append(
        copy,
        button(strings.mail.open, secondary, () => { location.href = mailHref(payload); }),
        button(strings.mail.edit, secondary, () => backToForm(false)),
      );
    }
    result.append(row);

    const swap = () => {
      form.hidden = true;
      result.hidden = false;
      result.focus({ preventScroll: true });
      const top = result.getBoundingClientRect().top;
      if (top < 90 || top > innerHeight * 0.7) result.scrollIntoView({ block: 'center', behavior: opts.reduced ? 'auto' : 'smooth' });
      if (opts.reduced) return;
      const strokes = Array.from(icon.querySelectorAll<SVGGeometryElement>('circle, path'));
      strokes.forEach((s) => { const len = s.getTotalLength(); s.style.strokeDasharray = `${len}`; s.style.strokeDashoffset = `${len}`; });
      gsap.timeline()
        .to(strokes, { strokeDashoffset: 0, duration: 0.9, ease: 'expo.inOut', stagger: 0.18 })
        .from([title, text, ...Array.from(result.querySelectorAll('.lead-result__help, .pill-row'))], { opacity: 0, y: 16, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.15);
    };
    if (opts.reduced) swap();
    else gsap.to(form, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in', onComplete: () => { gsap.set(form, { clearProps: 'opacity,transform' }); swap(); } });
  };

  const showFailure = (payload: LeadPayload) => {
    alertEl.textContent = '';
    alertEl.className = 'lead-alert';
    alertEl.setAttribute('role', 'alert');
    const link = el('a', `pill pill--sm ${secondary}`);
    link.href = mailHref(payload);
    link.append(el('span', undefined, strings.failure.mail), svg('0 0 14 14', ARROW, 'pill__arrow'));
    alertEl.append(el('b', undefined, strings.failure.title), el('span', undefined, strings.failure.text), link);
    alertEl.hidden = false;
  };

  const setBusy = (on: boolean) => {
    busy = on;
    submitBtn.classList.toggle('is-loading', on);
    submitBtn.setAttribute('aria-busy', String(on));
    submitLabel.textContent = on ? strings.sending : strings.submit;
  };

  /* ---------------------------------------------------------------- submit */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    alertEl.hidden = true;
    const results = (['name', 'email', 'message'] as FieldName[]).map((n) => validate(n));
    const consentOk = validateConsent();
    if (results.includes(false) || !consentOk) {
      statusEl.textContent = strings.errors.summary;
      const firstBad = form.querySelector<HTMLElement>('.is-invalid .field__control, .consent.is-invalid input');
      firstBad?.focus();
      if (!opts.reduced) gsap.fromTo(form.querySelectorAll('.is-invalid'), { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)', clearProps: 'transform' });
      return;
    }
    statusEl.textContent = '';
    const payload = collect();

    // Bots fill the hidden field: accept silently, send nothing.
    if (honeypot.value) { showResult('success', payload); return; }

    if (!endpoint) {
      location.href = mailHref(payload);
      showResult('mail', payload);
      return;
    }

    setBusy(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBusy(false);
      clearDraft();
      showResult('success', payload);
      form.reset();
      lead.reset();
    } catch {
      setBusy(false);
      showFailure(payload);
    }
  });
}
