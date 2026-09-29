/* Book options — Figma 1038:12844. The frame is a flattened @3x app screenshot
   (Landscape only), so layout values are measured from it and the product
   photos are cropped from it. Square / Portrait have no design yet and fall
   back to the Landscape products with the name swapped. */
Router.register('book-options', {
  render() {
    const o = AppState.chosenOrientation;
    const label = Books.label(o);
    const cards = Books.products.map(p => `
      <button class="product-card bo__card bopt__card" data-product="${p.id}">
        <img class="product-card__img bopt__img" src="${p.img}" alt="">
        <span class="product-card__body">
          <span class="product-card__name">${Books.nameOf(p, o)}</span>
          <span class="bopt__price">From <b>${p.price}</b></span>
        </span>
      </button>`).join('');

    return `
      <div class="bo">
        <!-- Same pinned nav as Choose photo book. -->
        <header class="bo__nav">
          <button class="bo__back" id="bopt-back" aria-label="Back">
            <img src="assets/icons/arrow-back.svg" alt="">
          </button>
          <p class="bo__title">Photo Books - ${label}</p>
        </header>

        <div class="bo__scroll">
          <div class="bopt__list">${cards}</div>
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#bopt-back').addEventListener('click', () => Router.back());
    el.querySelectorAll('[data-product]').forEach(card => card.addEventListener('click', () => {
      AppState.chosenSize = card.dataset.product;
      Router.navigate('#/pdp');
    }));
  },

  unmount() {}
});
