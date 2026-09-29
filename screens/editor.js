/* Edit design — book overview, Figma 1137:11916 (375 frame, clean values).
   With Autofill, the photos selected in the albums fill the book oldest first:
   cover, then page 1, 2, 3… one per page. The book grows past 24 pages to fit
   them (even page counts, up to the product's 120). Otherwise slots fall back
   to EditorPhotos (js/data.js) and then to grey placeholders. */
Router.register('editor', {
  MIN_PAGES: 24,
  MAX_PAGES: 120,

  // A photo slot: the image when one is configured, otherwise a placeholder.
  _slot(src, cls) {
    return src
      ? `<img class="${cls} ed-slot" src="${src}" alt="">`
      : `<div class="${cls} ed-slot ed-slot--empty"></div>`;
  },

  // Empty page with the "add photo" affordance.
  _emptyPage() {
    return `<div class="ed-page"><img class="ed-page__add" src="assets/icons/editor/addphoto.svg" alt=""></div>`;
  },

  // Page n: its photo when autofilled, otherwise the empty "add photo" page.
  _page(src) {
    return src ? `<div class="ed-page">${this._slot(src, 'ed-page__img')}</div>` : this._emptyPage();
  },

  _spread(left, right, labels) {
    return `
      <div class="ed-spread">
        <div class="ed-sheet">
          ${left}${right}
          <div class="ed-fold"></div>
        </div>
        <div class="ed-labels"><span>${labels[0]}</span><span>${labels[1]}</span></div>
      </div>`;
  },

  render() {
    // photos[0] is the cover, photos[n] is page n.
    const photos = AppState.autofill ? Collections.chronological(AppState.selectedPhotos) : [];
    const needed = Math.ceil((photos.length - 1) / 2) * 2;
    const pages = Math.min(this.MAX_PAGES, Math.max(this.MIN_PAGES, needed));

    const cover = `
      <div class="ed-spread">
        <div class="ed-sheet">
        <div class="ed-cover__back"></div>
        <div class="ed-cover__spine">
          <p class="ed-cover__spine-title">your book title</p>
        </div>
        <div class="ed-cover__front">
          ${this._slot(photos[0] || EditorPhotos.cover, 'ed-cover__img')}
          <p class="ed-cover__title">your book title</p>
        </div>
        </div>
        <div class="ed-labels ed-labels--center"><span>Cover</span></div>
      </div>`;

    const insideCover = this._spread(
      '<div class="ed-page"></div>',
      `<div class="ed-page">${this._slot(photos[1] || EditorPhotos.insideCover, 'ed-page__img')}</div>`,
      ['Inside cover', '1']
    );

    let spreads = '';
    for (let n = 2; n < pages; n += 2) {
      spreads += this._spread(this._page(photos[n]), this._page(photos[n + 1]), [n, n + 1]);
    }
    spreads += this._spread(this._page(photos[pages]), '<div class="ed-page"></div>', [pages, 'Inside cover']);

    return `
      <div class="ed">
        <div class="ed__scroll">
          ${cover}${insideCover}${spreads}
        </div>

        <header class="ed__header">
          <div class="ed__left">
            <button class="ed__menu" aria-label="Menu"><img src="assets/icons/editor/menu.svg" alt=""></button>
            <p class="ed__title">Edit design</p>
          </div>
          <div class="ed__right">
            <img class="ed__saving" src="assets/icons/editor/saving.svg" alt="Saved">
            <button class="ed__done" id="ed-done">Done</button>
          </div>
        </header>

        <!-- Undo / redo pill; disabled until there is something to undo. -->
        <div class="ed__history">
          <button class="ed__hist ed__hist--undo" disabled aria-label="Undo"><img src="assets/icons/editor/undo.svg" alt=""></button>
          <button class="ed__hist ed__hist--redo" disabled aria-label="Redo"><img src="assets/icons/editor/redo.svg" alt=""></button>
        </div>
      </div>
    `;
  },

  // Done ends the test run: a full reload to Home clears selection and state
  // (nothing is persisted), so the next participant starts fresh.
  mount(el) {
    el.querySelector('#ed-done').addEventListener('click', () => window.location.replace(window.location.pathname));
  },

  unmount() {}
});
