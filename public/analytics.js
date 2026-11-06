const events = new Set([
  'page_view',
  'setup_guide_opened',
  'source_opened',
  'release_opened',
  'demo_played',
  'install_command_copied',
]);
const key = 'agent-hub-website-analytics';
const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

export function initializeAnalytics(
  root = document.querySelector('[data-website-analytics]'),
) {
  if (!root || location.origin !== root.dataset.origin) return;
  const toggle = root.querySelector('[data-analytics-enabled]');
  const status = root.querySelector('[data-analytics-status]');
  const blocked = () =>
    navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  let settings;
  let unavailable = false;
  const pending = new Set();
  const recent = new Map();
  const source = (() => {
    if (!document.referrer) return 'direct';
    try {
      const host = new URL(document.referrer).hostname;
      if (host === location.hostname) return 'direct';
      if (host === 'github.com' || host.endsWith('.github.com'))
        return 'github';
      if (host === 'news.ycombinator.com') return 'hn';
      if (host === 'producthunt.com' || host.endsWith('.producthunt.com'))
        return 'product-hunt';
      if (host === 'reddit.com' || host.endsWith('.reddit.com'))
        return 'reddit';
      if (
        /^(www\.)?(google\.(com|ru|de|fr)|google\.co\.uk|bing\.com|duckduckgo\.com|yandex\.(ru|com|by|kz))$/.test(
          host,
        )
      )
        return 'search';
    } catch {
      /* Only a coarse reviewed category leaves this page. */
    }
    return 'other';
  })();
  function read() {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    if (raw.length > 512) throw new Error('Invalid preference.');
    const saved = JSON.parse(raw);
    if (
      saved.version !== 1 ||
      typeof saved.enabled !== 'boolean' ||
      Object.keys(saved).some(
        (field) => !['version', 'enabled', 'id'].includes(field),
      ) ||
      (saved.enabled && !uuid.test(saved.id))
    )
      throw new Error('Invalid preference.');
    return saved;
  }
  function refresh() {
    toggle.checked = !blocked() && !unavailable && settings?.enabled === true;
    toggle.disabled = blocked() || unavailable;
    status.textContent =
      blocked() || unavailable
        ? status.dataset.blocked
        : settings?.enabled
          ? status.dataset.on
          : status.dataset.off;
  }
  function cancel() {
    for (const request of pending) request.abort();
    pending.clear();
  }
  function track(event) {
    if (!events.has(event) || blocked() || unavailable) return;
    try {
      settings = read();
    } catch {
      unavailable = true;
      refresh();
      return;
    }
    if (!settings?.enabled) return;
    const now = Date.now();
    if (now - (recent.get(event) ?? 0) < 1000) return;
    recent.set(event, now);
    const controller = new AbortController();
    pending.add(controller);
    const timeout = setTimeout(() => controller.abort(), 1000);
    void fetch(root.dataset.endpoint, {
      method: 'POST',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: true,
        surface: 'website',
        event,
        distinct_id: settings.id,
        language: document.documentElement.lang === 'ru' ? 'ru' : 'en',
        page: root.dataset.page,
        source,
      }),
    })
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(timeout);
        pending.delete(controller);
      });
  }
  try {
    if (!blocked()) {
      settings = read();
      if (!settings) {
        settings = { version: 1, enabled: true, id: crypto.randomUUID() };
        localStorage.setItem(key, JSON.stringify(settings));
      }
    }
  } catch {
    unavailable = true;
  }
  refresh();
  track('page_view');
  toggle.addEventListener('change', () => {
    cancel();
    settings = toggle.checked
      ? { version: 1, enabled: true, id: crypto.randomUUID() }
      : { version: 1, enabled: false };
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {
      unavailable = true;
    }
    refresh();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    cancel();
    try {
      settings = read();
    } catch {
      unavailable = true;
    }
    refresh();
  });
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const url = new URL(anchor.href, location.href);
    if (
      url.origin === location.origin &&
      /^\/(ru\/)?docs\/quickstart\/$/.test(url.pathname)
    )
      track('setup_guide_opened');
    if (
      url.hostname === 'github.com' &&
      url.pathname === '/get-agent-hub/agent-hub'
    )
      track('source_opened');
    if (
      url.hostname === 'github.com' &&
      url.pathname.startsWith('/get-agent-hub/agent-hub/releases')
    )
      track('release_opened');
  });
  document
    .querySelector('video')
    ?.addEventListener('play', () => track('demo_played'), { once: true });
  document.addEventListener('ahub-install-command-copied', () =>
    track('install_command_copied'),
  );
  return { track };
}

initializeAnalytics();
