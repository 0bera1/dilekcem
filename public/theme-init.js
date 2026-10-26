// Runs before first paint so the stored theme never flashes. Storage may be blocked; ignore errors.
;(function () {
  try {
    var t = window.localStorage.getItem('dilekcem:theme')
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t)
  } catch (e) {
    /* storage unavailable: follow the system preference */
  }
})()
