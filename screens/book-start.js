/* How would you like to start your book? — Figma 1739:17075 (375 frame, clean
   values; the status bar is left out, so y = design y − 44). Sits between the
   product page and Uploading. The choice is kept in AppState.autofill. */
Router.register('book-start', {
  _bullets(lines) {
    return lines.map(l => `<li><img src="assets/icons/start/check.svg" alt="">${l}</li>`).join('');
  },

  render() {
    return `
      <div class="bs">
        <div class="bs__scroll">
          <img class="bs__art" src="assets/photos/start-illustration.svg" alt="">
          <h1 class="bs__title">How would you like to start your book?</h1>

          <div class="bs__options" role="radiogroup">
            <button class="bs-card bs-card--auto" role="radio" data-autofill="true">
              <img class="bs-card__radio" alt="">
              <span class="bs-card__title">Autofill my book</span>
              <span class="bs-card__badge">Faster</span>
              <ul class="bs-card__list">${this._bullets(['Selects your best photos', 'Places them chronologically', 'Easy to edit and customise'])}</ul>
            </button>
            <button class="bs-card bs-card--manual" role="radio" data-autofill="false">
              <img class="bs-card__radio" alt="">
              <span class="bs-card__title">I will place photos myself</span>
              <ul class="bs-card__list">${this._bullets(['Start with an empty book', 'Arrange your photos manually'])}</ul>
            </button>
          </div>
        </div>

        <button class="bs__back" id="bs-back" aria-label="Back">
          <img src="assets/icons/start/back-circle.svg" alt="">
        </button>

        <div class="bs__cta">
          <button class="bs__continue" id="bs-continue">Continue</button>
        </div>
      </div>
    `;
  },

  mount(el) {
    const cards = [...el.querySelectorAll('.bs-card')];
    const select = auto => {
      AppState.autofill = auto;
      cards.forEach(c => {
        const on = (c.dataset.autofill === 'true') === auto;
        c.classList.toggle('bs-card--selected', on);
        c.setAttribute('aria-checked', on);
        c.querySelector('.bs-card__radio').src = `assets/icons/start/radio-${on ? 'on' : 'off'}.svg`;
      });
    };
    // Autofill is preselected, as in the design.
    select(AppState.autofill !== false);

    cards.forEach(c => c.addEventListener('click', () => select(c.dataset.autofill === 'true')));
    el.querySelector('#bs-back').addEventListener('click', () => Router.back());
    el.querySelector('#bs-continue').addEventListener('click', () => Router.navigate('#/uploading'));
  },

  unmount() {}
});
