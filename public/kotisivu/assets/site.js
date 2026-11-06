/* Progressive navigation and topic exploration. No storage, tracking or learner events. */
document.documentElement.classList.add('js');
const menuButton = document.querySelector('[data-menu-toggle], .nav-toggle');
const menu = menuButton && document.getElementById(menuButton.getAttribute('aria-controls'));
const siteHeader = document.querySelector('.site-header, .saaristo-header');
if (siteHeader) {
  // The lesson toolbar and anchor navigation share the actual occupied height.
  // The narrow-screen dropdown is positioned below the header, so opening it
  // does not change this offset or move the lesson content.
  const measureHeader = () => document.documentElement.style.setProperty('--site-header-height', `${Math.ceil(siteHeader.getBoundingClientRect().height)}px`);
  measureHeader();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureHeader).observe(siteHeader);
  else window.addEventListener('resize', measureHeader);
}
if (menuButton && menu) {
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('pointerdown', (event) => {
    if (siteHeader && !siteHeader.contains(event.target)) setMenu(false);
  });
  siteHeader?.addEventListener('focusout', () => {
    // Tab continues into the page normally; the menu must not cover that focus.
    setTimeout(() => { if (!siteHeader.contains(document.activeElement)) setMenu(false); }, 0);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false); menuButton.focus();
    }
  });
  matchMedia('(min-width: 961px)').addEventListener('change', () => setMenu(false));
}
const topics = [...document.querySelectorAll('[data-topic-panel]')];
const choices = [...document.querySelectorAll('[data-topic-link]')];
function selectTopic(id) {
  if (!topics.some((panel) => panel.id === id)) return false;
  for (const panel of topics) panel.hidden = panel.id !== id;
  for (const choice of choices) {
    if (choice.dataset.topicLink === id) choice.setAttribute('aria-current', 'true');
    else choice.removeAttribute('aria-current');
  }
  return true;
}
if (topics.length) {
  selectTopic(location.hash.slice(1)) || selectTopic(topics[0].id);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) selectTopic(link.hash.slice(1));
  });
  window.addEventListener('hashchange', () => selectTopic(location.hash.slice(1)));
}
for (const printButton of document.querySelectorAll('[data-print]')) {
  printButton.addEventListener('click', () => window.print());
}
