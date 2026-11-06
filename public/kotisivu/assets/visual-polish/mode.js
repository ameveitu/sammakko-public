/* Sammakko visual polish (VP02): review-only mode switch, read once from the URL.
   ?vp=off = original look, ?vp=static = painted layers without motion, ?vp=on or no value = candidate.
   Nothing is stored; hash routes are untouched. Without JS the static painted look applies. */
(function () {
  try {
    var m = new URLSearchParams(location.search).get('vp');
    document.documentElement.setAttribute('data-vp', m === 'off' || m === 'static' ? m : 'on');
  } catch (e) { /* keep the CSS default (static) */ }
})();
