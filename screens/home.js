Router.register('home', {
  _carouselTimer: null,

  render() {
    return `
      <div class="home">

        <div class="home__scroll">

        <!-- Header with logo -->
        <header class="home__header">
          <img class="home__logo" src="assets/logo.svg" alt="Photobox">
        </header>

        <!-- Promo banner (full bleed, teal) -->
        <div class="home__promo-banner">
          <p class="promo__title">25% off selected photo books, wall decorations and photo gifts</p>
          <p class="promo__code">Using code <strong>SALE50</strong> ends 12/06/2026</p>
        </div>

        <!-- Smart Collections banner -->
        <div class="home__sc-wrapper">
          <button class="home__sc-banner" id="sc-banner">
            <div class="sc-banner__top">
              <div class="sc-banner__text">
                <span class="sc-banner__title">Smart Collections</span>
                <span class="sc-banner__sub">Your photos, already sorted into albums</span>
              </div>
              <div class="sc-banner__arrow">
                <img src="assets/icons/arrow-next.svg" alt="">
              </div>
            </div>
            <div class="sc-banner__carousel">
              <div class="carousel__track" id="carousel-track">
                <!-- Leading duplicate: keeps the banner's left edge covered at every
                     phase of the loop, so nothing ever flickers to bare purple -->
                <img src="assets/photos/photo-6.png" alt="">
                <img src="assets/photos/photo-1.png" alt="">
                <img src="assets/photos/photo-2.png" alt="">
                <img src="assets/photos/photo-3.png" alt="">
                <img src="assets/photos/photo-4.png" alt="">
                <img src="assets/photos/photo-5.png" alt="">
                <img src="assets/photos/photo-6.png" alt="">
                <!-- Duplicated for infinite loop -->
                <img src="assets/photos/photo-1.png" alt="">
                <img src="assets/photos/photo-2.png" alt="">
                <img src="assets/photos/photo-3.png" alt="">
                <img src="assets/photos/photo-4.png" alt="">
                <img src="assets/photos/photo-5.png" alt="">
                <img src="assets/photos/photo-6.png" alt="">
              </div>
            </div>
          </button>
        </div>

        <!-- Shop by product -->
        <div class="home__shop">
          <p class="section-title">Shop by product</p>
        </div>

        <div class="home__products">
          <div class="product-card">
            <img class="product-card__img" src="assets/photos/product-landscape.png" alt="Photo Books - Landscape">
            <div class="product-card__body">
              <p class="product-card__name">Photo Books - Landscape</p>
              <p class="product-card__discount">Up to 60% Off</p>
            </div>
          </div>
          <div class="product-card">
            <img class="product-card__img" src="assets/photos/product-square.png" alt="Photo Books - Square">
            <div class="product-card__body">
              <p class="product-card__name">Photo Books - Square</p>
              <p class="product-card__discount">Up to 60% Off</p>
            </div>
          </div>
          <div class="product-card">
            <img class="product-card__img" src="assets/photos/product-portrait.png" alt="Photo Books - Portrait">
            <div class="product-card__body">
              <p class="product-card__name">Photo Books - Portrait</p>
              <p class="product-card__discount">Up to 60% Off</p>
            </div>
          </div>
        </div>

        </div><!-- /home__scroll -->

        <!-- Tab bar -->
        <nav class="tab-bar">
          <div class="tab-bar__items">
            <button class="tab-bar__item tab-bar__item--active">
              <div class="tab-bar__active-bar"></div>
              <div class="tab-icon"><img src="assets/icons/tab-home-active.svg" alt=""></div>
              <span class="tab-label">Home</span>
            </button>
            <button class="tab-bar__item">
              <div class="tab-icon"><img src="assets/icons/tab-projects.svg" alt=""></div>
              <span class="tab-label">Projects</span>
            </button>
            <button class="tab-bar__item">
              <div class="tab-icon"><img src="assets/icons/tab-myphotos.svg" alt=""></div>
              <span class="tab-label">My Photos</span>
            </button>
            <button class="tab-bar__item">
              <div class="tab-icon"><img src="assets/icons/tab-basket.svg" alt=""></div>
              <span class="tab-label">Basket</span>
            </button>
            <button class="tab-bar__item">
              <div class="tab-icon"><img src="assets/icons/tab-account.svg" alt=""></div>
              <span class="tab-label">Account</span>
            </button>
          </div>
          <div class="tab-bar__home-indicator">
            <div class="tab-bar__home-bar"></div>
          </div>
        </nav>

      </div>
    `;
  },

  mount(el) {
    el.querySelector('#sc-banner').addEventListener('click', () => {
      Router.navigate('#/smart-collections');
    });
  },

  unmount() {}
});
