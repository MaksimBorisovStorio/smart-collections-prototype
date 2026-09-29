/* Uploading your creation — Figma 1038:12848 (375 frame, clean values).
   Fakes the upload: the bar fills from 1% to 100%, then the screen replaces
   itself with the editor so Back from the editor skips the loader. */
Router.register('uploading', {
  DURATION: 3500,

  render() {
    return `
      <div class="upl">
        <header class="upl__nav">
          <button class="upl__back" id="upl-back" aria-label="Back">
            <img src="assets/icons/arrow-back-upload.svg" alt="">
          </button>
        </header>

        <div class="upl__body">
          <div class="upl__head">
            <h1 class="upl__title">Uploading your<br>creation</h1>
            <p class="upl__text">It will take a moment. Please, stay on this screen</p>
          </div>
          <div class="upl__progress">
            <div class="upl__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="1">
              <div class="upl__fill" id="upl-fill"></div>
            </div>
            <div class="upl__status">
              <p>Uploading Photos...</p>
              <p id="upl-pct">1%</p>
            </div>
          </div>
        </div>

        <img class="upl__art" src="assets/photos/upload-animation.gif" alt="">
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#upl-back').addEventListener('click', () => Router.back());

    const fill = el.querySelector('#upl-fill');
    const pct = el.querySelector('#upl-pct');
    const bar = el.querySelector('.upl__bar');
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      // Ease-out so it races ahead first and slows near the end, like a real upload.
      const t = Math.min(1, (now - start) / this.DURATION);
      const p = Math.max(1, Math.round(100 * (1 - Math.pow(1 - t, 2))));
      fill.style.width = `${p}%`;
      pct.textContent = `${p}%`;
      bar.setAttribute('aria-valuenow', p);
      if (t < 1) this._timer = setTimeout(tick, 40);
      else this._done = setTimeout(() => window.location.replace('#/editor'), 400);
    };
    tick();
  },

  unmount() {
    clearTimeout(this._timer);
    clearTimeout(this._done);
  }
});
