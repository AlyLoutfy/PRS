// What the visitor has collected for an enquiry: a topic and a list of items (curriculum topics, a course
// format, the upcoming event). Kept in sessionStorage so it survives the way from any page to the form.
export interface LeadTag { id: string; label: string }
export interface LeadState { topic?: string; tags: LeadTag[] }

const KEY = 'prs-lead';
const listeners = new Set<(state: LeadState) => void>();

function read(): LeadState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LeadState>;
      const tags = Array.isArray(parsed.tags)
        ? parsed.tags.filter((t): t is LeadTag => !!t && typeof t.id === 'string' && typeof t.label === 'string').slice(0, 30)
        : [];
      return { topic: typeof parsed.topic === 'string' ? parsed.topic : undefined, tags };
    }
  } catch { /* storage unavailable: keep the selection in memory */ }
  return { tags: [] };
}

let state = read();

function commit() {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
  listeners.forEach((fn) => fn(state));
}

export const lead = {
  get: (): LeadState => state,
  has: (id: string) => state.tags.some((t) => t.id === id),
  add(tag: LeadTag, topic?: string) {
    if (!this.has(tag.id)) state = { ...state, tags: [...state.tags, tag] };
    if (topic) state = { ...state, topic };
    commit();
  },
  remove(id: string) {
    state = { ...state, tags: state.tags.filter((t) => t.id !== id) };
    commit();
  },
  toggle(tag: LeadTag, topic?: string): boolean {
    const on = !this.has(tag.id);
    on ? this.add(tag, topic) : this.remove(tag.id);
    return on;
  },
  setTopic(topic: string) {
    state = { ...state, topic };
    commit();
  },
  /** remove every item, or only those whose id starts with `prefix` */
  clear(prefix?: string) {
    state = { ...state, tags: prefix ? state.tags.filter((t) => !t.id.startsWith(prefix)) : [] };
    commit();
  },
  reset() {
    state = { tags: [] };
    commit();
  },
  subscribe(fn: (state: LeadState) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
