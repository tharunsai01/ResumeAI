import { useCallback, useEffect, useRef, useState, type DependencyList, type RefObject } from 'react';
import { toApiError, type ApiErrorShape } from '@/services/api';

/** Load data with loading / error / reload state. Ignores responses from stale calls. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList = [], opts: { enabled?: boolean } = {}) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiErrorShape | null>(null);
  const [loading, setLoading] = useState(opts.enabled !== false);
  const callId = useRef(0);

  const run = useCallback(async (silent = false) => {
    const id = ++callId.current;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (id === callId.current) setData(result);
    } catch (err) {
      if (id === callId.current) setError(toApiError(err));
    } finally {
      if (id === callId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (opts.enabled === false) return;
    void run();
  }, [run, opts.enabled]);

  return { data, setData, error, loading, reload: run };
}

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Marks <html data-hidden> while the tab is hidden so CSS can pause decorative animation. */
export function useDocumentVisibility() {
  const [visible, setVisible] = useState(typeof document === 'undefined' ? true : !document.hidden);
  useEffect(() => {
    const onChange = () => {
      setVisible(!document.hidden);
      document.documentElement.dataset.hidden = String(document.hidden);
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

/** True when the device has a fine pointer (mouse). Cursor effects are skipped on touch. */
export function useFinePointer() {
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const on = () => setFine(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fine;
}

/** Writes the pointer position into --mx / --my on the element (for spotlight borders). */
export function useSpotlight<T extends HTMLElement>(ref: RefObject<T | null>) {
  const fine = useFinePointer();
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
    };
  }, [ref, fine]);
}

/** Low-power heuristic: few cores or data-saver means fewer decorative effects. */
export function useLowPower() {
  const [low] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency ?? 8;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    return cores <= 4 || !!saveData;
  });
  return low;
}

/** Poll while a condition holds (e.g. resume still processing). */
export function usePolling(callback: () => void | Promise<void>, active: boolean, interval = 1000) {
  const saved = useRef(callback);
  saved.current = callback;
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped) return;
      if (!document.hidden) await saved.current();
      timer = setTimeout(tick, interval);
    };
    timer = setTimeout(tick, interval);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [active, interval]);
}
