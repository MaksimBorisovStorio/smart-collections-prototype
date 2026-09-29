Router.register('collection', {
  // Fallback grouping for collections that have no `days` of their own yet.
  _fallbackDays: [{ date: '12 July 2026', count: 3 }, { date: '13 July 2026', count: 7 }],

  _collection(params) {
    return Collections.byId(params && params[0]) || AppState.currentCollection || Collections[0];
  },

  /* Date group header. Sticky, so the date stays visible while its own photos
     scroll past — exactly as the Figma frame has it. The Select pill only
     shows once the user has chosen "Create a photo book". */
  _dayHeader(day, di) {
    return `
      <div class="cd-day">
        <p class="cd-day__date">${day.date}</p>
        <button class="cd-select" data-day="${di}">
          <span class="cd-select__icon"><img src="assets/icons/icon-select.svg" alt=""></span>
          <span class="cd-select__label">Select</span>
        </button>
      </div>`;
  },

  // One tile per photo; a day without `photos` gets `count` grey placeholders.
  _tiles(day, di) {
    const photos = day.photos || Array(day.count).fill('');
    return photos.map((src, i) => `
      <button class="cd-tile" data-id="${di}-${i}" data-day="${di}" aria-pressed="false">${
        src ? `<img class="cd-tile__img" src="${src}" alt="" loading="lazy" decoding="async">` : ''
      }<span class="cd-tile__check"></span></button>`).join('');
  },

  render(params) {
    const c = this._collection(params);
    const days = c.days || this._fallbackDays;

    return `
      <div class="cd">

        <!-- Pinned nav: back, centred title + count, Select all.
             No status bar — the device draws it. -->
        <header class="cd__nav">
          <button class="cd__back" id="cd-back" aria-label="Back">
            <img src="assets/icons/arrow-back.svg" alt="">
          </button>
          <div class="cd__titles">
            <p class="cd__title">${c.title}</p>
            <p class="cd__count">${c.photos} photos</p>
          </div>
          <button class="cd__select-all" id="cd-select-all">Select all</button>
        </header>

        <div class="cd__scroll">
          <div class="cd-grid">
            ${days.map((d, di) => this._dayHeader(d, di) + this._tiles(d, di)).join('')}
          </div>

          <!-- What you can do with this album. The floating Create button lands
               in the slot at the bottom once you scroll this far. -->
          <section class="cd-promo">
            <p class="cd-promo__title">Turn this trip into something to keep</p>
            <p class="cd-promo__text">All ${c.photos} photos from ${c.title} are already sorted here for you.</p>
            <ul class="cd-promo__list">
              <li class="cd-promo__item">
                <span class="cd-promo__icon">📖</span>
                <span><span class="cd-promo__name">Create a photo book</span>
                  <span class="cd-promo__sub">Pick your favourite shots and we'll lay out the pages.</span></span>
              </li>
              <li class="cd-promo__item">
                <span class="cd-promo__icon">☁️</span>
                <span><span class="cd-promo__name">Upload to my photos</span>
                  <span class="cd-promo__sub">Keep the whole album safe in your Photobox library.</span></span>
              </li>
            </ul>
            <div class="cd-promo__slot" id="cd-slot"></div>
          </section>
        </div>

        <!-- Floating Create button; the shared selection bar (js/selection.js)
             takes its place in select mode. -->
        <button class="cd-fab" id="cd-create">Create</button>

      </div>
    `;
  },

  mount(el, params) {
    const $ = s => el.querySelector(s);
    const root = $('.cd');
    const cid = this._collection(params).id;
    const tiles = [...el.querySelectorAll('.cd-tile')];
    // Prefix with the collection so selections from different albums don't collide.
    const idOf = t => `${cid}:${t.dataset.id}`;
    const ofDay = day => tiles.filter(t => t.dataset.day === day);
    const allOn = list => list.every(t => Selection.has(idOf(t)));

    // Mirror the shared selection: select mode, ticks, Select / Select all labels.
    const sync = () => {
      root.classList.toggle('cd--selecting', Selection.active);
      tiles.forEach(t => {
        const on = Selection.has(idOf(t));
        t.classList.toggle('cd-tile--selected', on);
        t.setAttribute('aria-pressed', on);
      });
      el.querySelectorAll('.cd-select').forEach(btn => {
        btn.querySelector('.cd-select__label').textContent = allOn(ofDay(btn.dataset.day)) ? 'Deselect' : 'Select';
      });
      $('#cd-select-all').textContent = allOn(tiles) ? 'Deselect all' : 'Select all';
    };
    this._unsubscribe = Selection.onChange(() => { sync(); dock(); });

    /* Floating → docked Create button. It floats over the grid until the slot
       under the promo block scrolls up to it, then rides along with the slot.
       Over the last MORPH px before landing it widens from a pill to the
       slot's full width and drops its shadow, so the handover is continuous. */
    const MORPH = 80;
    const GAP = 24;
    const fab = $('#cd-create');
    const slot = $('#cd-slot');
    const scroller = $('.cd__scroll');
    const pillW = fab.offsetWidth;
    const dock = () => {
      if (Selection.active) return;
      const box = root.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      const floatTop = box.height - GAP - fab.offsetHeight;
      const slotTop = s.top - box.top;
      const p = Math.min(1, Math.max(0, 1 - (slotTop - floatTop) / MORPH));
      fab.style.width = `${pillW + (s.width - pillW) * p}px`;
      fab.style.top = `${Math.min(floatTop, slotTop)}px`;
      fab.style.setProperty('--fab-shadow', 1 - p);
      fab.classList.toggle('cd-fab--docked', slotTop <= floatTop);
    };
    scroller.addEventListener('scroll', dock, { passive: true });
    window.addEventListener('resize', dock);
    this._offResize = () => window.removeEventListener('resize', dock);
    sync();
    dock();

    const setMany = (list, on) => Selection.set(list.map(idOf), on);

    $('#cd-back').addEventListener('click', () => Router.back());
    // Create first: pick "Create a photo book", then select.
    $('#cd-create').addEventListener('click', () => {
      Selection.chooseIntent().then(choice => { if (choice === 'book') Selection.start('book'); });
    });

    // Photo first: tapping any photo starts select mode with it ticked;
    // Continue then asks what the photos are for.
    tiles.forEach(t => t.addEventListener('click', () => {
      if (!Selection.active) Selection.start();
      setMany([t], !Selection.has(idOf(t)));
    }));

    el.querySelectorAll('.cd-select').forEach(btn => btn.addEventListener('click', () => {
      const day = ofDay(btn.dataset.day);
      setMany(day, !allOn(day));
    }));

    $('#cd-select-all').addEventListener('click', () => setMany(tiles, !allOn(tiles)));
  },

  unmount() {
    if (this._unsubscribe) this._unsubscribe();
    if (this._offResize) this._offResize();
    this._unsubscribe = this._offResize = null;
  }
});
