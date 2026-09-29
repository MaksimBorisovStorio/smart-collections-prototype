/* Product page — Figma 1038:12862. The frame is a single flattened @3x app
   screenshot, so values are measured from it. The hero photo is cropped from
   it with the back button and "1 / 5" counter baked in; the live back button
   is a transparent hit area laid exactly over the baked one (in % of the hero,
   so it tracks the image at any width). */
Router.register('pdp', {
  render() {
    const o = AppState.chosenOrientation;
    const p = Books.product(AppState.chosenSize);
    const n = Selection.active ? AppState.selectedPhotos.length : 0;
    const cta = n ? `Create with ${n} photo${n === 1 ? '' : 's'}` : 'Create';

    return `
      <div class="pdp">
        <div class="pdp__scroll">
          <div class="pdp__hero">
            <img class="pdp__hero-img" src="${p.hero}" alt="">
            <button class="pdp__back" id="pdp-back" aria-label="Back"></button>
          </div>

          <div class="pdp__info">
            <h1 class="pdp__title">${Books.nameOf(p, o)}</h1>

            <div class="pdp__price-row">
              <p class="pdp__price">From <b>${p.price}</b></p>
              <span class="pdp__promo"><img src="assets/icons/icon-tag.svg" alt="">50% off from £35</span>
            </div>

            <p class="pdp__desc">Choose our popular photo book format – perfect for any occasion</p>

            <ul class="pdp__features">
              <li class="pdp__feature"><img src="assets/icons/icon-star.svg" alt="">Size: ${p.size}</li>
              <li class="pdp__feature"><img src="assets/icons/icon-star.svg" alt="">${p.pages}</li>
            </ul>

            <div class="pdp__delivery">
              <img class="pdp__delivery-icon" src="assets/icons/icon-delivery.svg" alt="">
              <div>
                <p class="pdp__delivery-text">We're experts in delivering high quality photo products</p>
                <button class="pdp__link">Delivery Information</button>
              </div>
            </div>

            <p class="pdp__usp"><img src="assets/icons/icon-star.svg" alt="">Easy to create</p>
          </div>
        </div>

        <!-- Pinned CTA with hairline, as in the design. -->
        <div class="pdp__cta">
          <button class="pdp__create" id="pdp-create">${cta}</button>
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#pdp-back').addEventListener('click', () => Router.back());
    el.querySelector('#pdp-create').addEventListener('click', () => Router.navigate('#/book-start'));
  },

  unmount() {}
});
