import { poseUrl } from './sprite';

/** Observe D2's departure class. This helper owns no departure clock, answer,
 * page selection or advancement: removing that class cancels the picture too. */
export function bookTravelPresentation(root: HTMLElement, host: HTMLElement, restoreWorld: () => void) {
  let picture: HTMLDivElement | undefined;
  let active = false;
  const portraits = (['loikka', 'aava'] as const).map(actor => {
    const image = new Image(); image.src = poseUrl(actor, actor === 'aava' ? 'flap_02' : 'leap'); image.alt = ''; image.className = actor;
    return image;
  });
  const clear = () => {
    picture?.remove(); picture = undefined;
    if (active) { active = false; delete root.dataset.travel; restoreWorld(); }
  };
  const showPicture = () => {
    if (picture) return;
    root.dataset.travel = 'picture';
    picture = document.createElement('div'); picture.className = 'book-travel-picture'; picture.setAttribute('aria-hidden', 'true');
    picture.append(...portraits);
    host.append(picture);
  };
  const observer = new MutationObserver(() => {
    if (active && !root.querySelector('.book-desk.book-leaving')) clear();
    else if (active && root.dataset.fallback === 'true') showPicture();
  });
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-fallback'] });
  return {
    begin(playWorld: () => boolean) {
      clear(); active = true;
      root.dataset.travel = playWorld() ? 'world' : 'picture';
      if (root.dataset.travel === 'picture') showPicture();
    },
    clear,
    dispose() { observer.disconnect(); clear(); },
  };
}
