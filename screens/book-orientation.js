/* Choose photo book — Figma 1618:63200. Reuses the Home product cards; each
   card picks an orientation and moves on to the book options step. */
Router.register('book-orientation', {
  _books: [
    { id: 'landscape', name: 'Photo Books - Landscape', img: 'assets/photos/product-landscape.png', from: '€14.99' },
    { id: 'square',    name: 'Photo Books - Square',    img: 'assets/photos/product-square.png',    from: '€14.99' },
    { id: 'portrait',  name: 'Photo Books - Portrait',  img: 'assets/photos/product-portrait.png',  discount: 'Up to 60% Off' }
  ],

  _card(b) {
    const price = b.discount
      ? `<span class="product-card__discount">${b.discount}</span>`
      : `<span class="product-card__price">From <b>${b.from}</b></span>`;
    return `
      <button class="product-card bo__card" data-orientation="${b.id}">
        <img class="product-card__img" src="${b.img}" alt="">
        <span class="product-card__body">
          <span class="product-card__name">${b.name}</span>
          ${price}
        </span>
      </button>`;
  },

  render() {
    return `
      <div class="bo">
        <!-- Pinned nav: back + centred title. No status bar — the device draws it. -->
        <header class="bo__nav">
          <button class="bo__back" id="bo-back" aria-label="Back">
            <img src="assets/icons/arrow-back.svg" alt="">
          </button>
          <p class="bo__title">Choose photo book</p>
        </header>

        <div class="bo__scroll">
          <div class="home__products">
            ${this._books.map(this._card).join('')}
          </div>
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#bo-back').addEventListener('click', () => Router.back());
    el.querySelectorAll('[data-orientation]').forEach(card => card.addEventListener('click', () => {
      AppState.chosenOrientation = card.dataset.orientation;
      Router.navigate('#/book-options');
    }));
  },

  unmount() {}
});
