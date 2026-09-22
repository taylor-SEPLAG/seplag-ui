type HideFn = () => void;

let activeHide: HideFn | null = null;

export function registerOpenFlyout(hide: HideFn) {
  if (activeHide && activeHide !== hide) {
    activeHide();
  }
  activeHide = hide;
}

export function unregisterFlyout(hide: HideFn) {
  if (activeHide === hide) {
    activeHide = null;
  }
}
