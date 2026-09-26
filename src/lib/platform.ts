interface NavigatorLike {
  platform?: string;
  userAgentData?: { platform?: string };
}

/** Apple keyboards use ⌘ where everyone else uses Ctrl. False on the server. */
export function isMac(nav: NavigatorLike | undefined = globalThis.navigator): boolean {
  if (!nav) return false;
  const platform = nav.userAgentData?.platform || nav.platform || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}
