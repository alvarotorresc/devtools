import { onMount } from 'svelte';
import { getRemember, loadInput, saveInput, setRemember } from '../lib/prefs';

// Bigger inputs are not remembered: a multi-MB synchronous write would block typing and
// usually exceeds the storage quota, leaving an older value to reappear on reload.
export const MAX_REMEMBERED = 100_000;

export function persistedInput(toolId: string, initial: string, rememberDefault = true) {
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

  $effect(() => {
    const v = value;
    if (!ready || !remember || v.length > MAX_REMEMBERED) return;
    clearTimeout(timer);
    timer = setTimeout(() => saveInput(toolId, v), 300);
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
      if (r && value.length <= MAX_REMEMBERED) saveInput(toolId, value);
    },
  };
}
