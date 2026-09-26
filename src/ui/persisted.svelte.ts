import { onMount } from 'svelte';
import { clearInput, getRemember, loadInput, saveInput, setRemember } from '../lib/prefs';

// Bigger inputs are not remembered: a multi-MB synchronous write would block typing and
// usually exceeds the storage quota, leaving an older value to reappear on reload.
export const MAX_REMEMBERED = 100_000;

// `shouldSave` lets a tool refuse to store some values (e.g. URLs with passwords). A refused
// value also clears what was stored, so a half-typed secret saved earlier does not linger.
export function persistedInput(
  toolId: string,
  initial: string,
  rememberDefault = true,
  shouldSave: (v: string) => boolean = () => true,
) {
  let value = $state(initial);
  let remember = $state(rememberDefault);
  let ready = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    remember = getRemember(toolId, rememberDefault);
    if (remember) {
      const saved = loadInput(toolId);
      if (saved !== null) value = saved;
    }
    ready = true;
    return () => clearTimeout(timer);
  });

  function store(v: string) {
    if (shouldSave(v)) saveInput(toolId, v);
    else clearInput(toolId);
  }

  $effect(() => {
    const v = value;
    clearTimeout(timer);
    if (!ready || !remember || v.length > MAX_REMEMBERED) return;
    timer = setTimeout(() => store(v), 300);
  });

  return {
    get value() {
      return value;
    },
    set value(v: string) {
      value = v;
    },
    get remember() {
      return remember;
    },
    set remember(r: boolean) {
      remember = r;
      setRemember(toolId, r);
      if (!r) {
        clearTimeout(timer);
      } else if (value.length <= MAX_REMEMBERED) {
        store(value);
      }
    },
  };
}
