/* Six stacked backdrop-filter layers. Each starts lower than the last, so the
   blur ramps from nothing at the overlay's top edge to full at the bottom —
   the progressive blur the design uses, instead of one hard-edged slab. */
const progressiveBlur = () =>
  '<div class="pblur" aria-hidden="true">' + '<span></span>'.repeat(6) + '</div>';

/* Only collections flagged `interactive` can be opened. The rest render as a
   plain <div> rather than a disabled <button>, so they carry no tap target,
   no pointer cursor and nothing for the keyboard to focus. */
const tag = c => (c.interactive ? 'button' : 'div');
const openAttr = c => (c.interactive ? ' data-open' : '');

Router.register('smart-collections', {
  _activeYear: 2026,

  // Large landscape tile — "Travels". Centred title, 170px blurred overlay.
  _largeTile(c) {
    return `
      <${tag(c)} class="sc-tile sc-tile--large" data-id="${c.id}"${openAttr(c)}>
        <img class="sc-tile__img" src="${c.cover}" alt="">
        <div class="sc-tile__overlay sc-tile__overlay--large">
          ${progressiveBlur()}
          <p class="sc-tile__title">${c.title}</p>
          <div class="sc-tile__meta sc-tile__meta--center">
            <p class="sc-tile__sub sc-tile__sub--muted">${c.dates}</p>
          </div>
        </div>
      </${tag(c)}>`;
  },

  // Square tile — "Short trips and occasions". Left-aligned name + date.
  _squareTile(c) {
    return `
      <${tag(c)} class="sc-tile sc-tile--square" data-id="${c.id}"${openAttr(c)}>
        <img class="sc-tile__img" src="${c.cover}" alt="">
        <div class="sc-tile__overlay">
          ${progressiveBlur()}
          <p class="sc-tile__name">${c.title}</p>
          <div class="sc-tile__meta">
            <p class="sc-tile__sub">${c.dates}</p>
          </div>
        </div>
      </${tag(c)}>`;
  },

  // Full-width tile — "All Smart Collections". Name + dates, no blur.
  // `anchorYear` marks the first tile of a year group as a jump target.
  _fullTile(c, anchorYear) {
    return `
      <${tag(c)} class="sc-tile sc-tile--full" data-id="${c.id}"${openAttr(c)}${anchorYear ? ` data-anchor="${anchorYear}"` : ''}>
        <img class="sc-tile__img" src="${c.cover}" alt="">
        <div class="sc-tile__overlay">
          <p class="sc-tile__name">${c.title}</p>
          <div class="sc-tile__meta">
            <p class="sc-tile__sub">${c.dates}</p>
          </div>
        </div>
      </${tag(c)}>`;
  },

  // Every collection, newest year first. The year pills jump within this list
  // rather than filtering it, so nothing is ever hidden.
  _allTiles() {
    return Collections.years
      .flatMap(y => Collections.filter(c => c.year === y)
        .map((c, i) => this._fullTile(c, i === 0 ? y : null)))
      .join('');
  },

  render() {
    const years = Collections.years
      .map(y => `
        <button class="sc-year${y === this._activeYear ? ' sc-year--active' : ''}" data-year="${y}">${y}</button>`)
      .join('');

    return `
      <div class="sc">

        <!-- Pinned nav bar. No status bar — the device draws it. The inline title
             and hairline only appear once the large title has scrolled away. -->
        <header class="sc__nav" id="sc-nav">
          <button class="sc__back" id="sc-back" aria-label="Back">
            <img src="assets/icons/arrow-back.svg" alt="">
          </button>
          <span class="sc__nav-title">Smart Collections</span>
        </header>

        <div class="sc__scroll" id="sc-scroll">
          <!-- Large title scrolls with the content, iOS-style -->
          <div class="sc__subheader">
            <h1 class="sc__title" id="sc-title">Smart Collections</h1>
          </div>

          <div class="sc__content">

            <!-- Travels -->
            <section class="sc-section">
              <div class="sc-section__header">
                <p class="sc-section__title">Travels</p>
              </div>
              <div class="sc-row sc-row--large">
                ${Collections.byGroup('travels').map(this._largeTile).join('')}
              </div>
            </section>

            <!-- Short trips and occasions -->
            <section class="sc-section">
              <div class="sc-section__header sc-section__header--spaced">
                <p class="sc-section__title">Short trips and occasions</p>
              </div>
              <div class="sc-row sc-row--square">
                ${Collections.byGroup('short').map(this._squareTile).join('')}
              </div>
            </section>

            <!-- All Smart Collections -->
            <div class="sc-section__header sc-section__header--spaced">
              <p class="sc-section__title">All Smart Collections</p>
            </div>
            <div class="sc-years" id="sc-years">${years}</div>
            <div class="sc-all" id="sc-all">${this._allTiles()}</div>

          </div>
        </div>
      </div>
    `;
  },

  mount(el) {
    // Leaving for Home ends a photo-book selection, so ask first.
    el.querySelector('#sc-back').addEventListener('click', () => {
      Selection.confirmLeave().then(leave => { if (leave) Router.back(); });
    });

    const scroll = el.querySelector('#sc-scroll');
    const nav = el.querySelector('#sc-nav');
    const title = el.querySelector('#sc-title');
    const years = el.querySelector('#sc-years');
    const all = el.querySelector('#sc-all');
    const pills = [...years.querySelectorAll('.sc-year')];
    const anchors = [...all.querySelectorAll('[data-anchor]')];
    const COLLAPSE = 56; // the large-title row height — the distance it travels
    const GAP = 13;      // the list's own rhythm, reused as the jump landing gap
    let frame = null;
    // Set while a tapped jump is in flight. The tail years sit too close to the
    // end of the scroll range to reach the top, so without this the spy would
    // snap the highlight off the year the user just tapped.
    let lockedYear = null;

    const setActive = year => {
      this._activeYear = year;
      pills.forEach(p => p.classList.toggle('sc-year--active', Number(p.dataset.year) === year));
      // Keep the active pill in view — the row scrolls, 2021 starts off-screen.
      const pill = pills.find(p => Number(p.dataset.year) === year);
      if (!pill) return;
      const lead = pill.offsetLeft - 16;
      const trail = pill.offsetLeft + pill.offsetWidth + 16 - years.clientWidth;
      if (lead < years.scrollLeft) years.scrollLeft = lead;
      else if (trail > years.scrollLeft) years.scrollLeft = trail;
    };

    const sync = () => {
      frame = null;

      // iOS large-title collapse: the large title fades as it scrolls up under
      // the nav bar, and the nav's inline title + hairline cross-fade in.
      const p = Math.min(1, Math.max(0, scroll.scrollTop / COLLAPSE));
      title.style.opacity = String(1 - p);
      nav.classList.toggle('sc__nav--collapsed', p > 0.5);

      // Scroll-spy: highlight the year group currently at the top of the list,
      // so the pills stay truthful when the user scrolls instead of tapping.
      if (lockedYear !== null) return;
      const limit = years.getBoundingClientRect().bottom + GAP + 1;
      let year = Number(anchors[0].dataset.anchor);
      for (const a of anchors) {
        if (a.getBoundingClientRect().top <= limit) year = Number(a.dataset.anchor);
      }
      if (year !== this._activeYear) setActive(year);
    };

    // The user taking over the scroll hands the highlight back to the spy.
    const release = () => { lockedYear = null; };

    this._onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(sync);
    };
    scroll.addEventListener('scroll', this._onScroll, { passive: true });
    scroll.addEventListener('touchstart', release, { passive: true });
    scroll.addEventListener('wheel', release, { passive: true });
    this._cancelScroll = () => {
      scroll.removeEventListener('scroll', this._onScroll);
      scroll.removeEventListener('touchstart', release);
      scroll.removeEventListener('wheel', release);
      if (frame !== null) cancelAnimationFrame(frame);
    };
    sync();

    // Pills act as anchor links: jump to that year's first tile and land it just
    // below the sticky pill row rather than underneath it.
    years.addEventListener('click', e => {
      const pill = e.target.closest('.sc-year');
      if (!pill) return;
      const target = anchors.find(a => a.dataset.anchor === pill.dataset.year);
      if (!target) return;
      const year = Number(pill.dataset.year);
      const delta = target.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
      lockedYear = year;
      scroll.scrollTo({ top: scroll.scrollTop + delta - years.offsetHeight - GAP, behavior: 'smooth' });
      setActive(year);
    });

    // One listener for every openable tile, whichever section it sits in.
    // Display-only tiles have no [data-open], so taps on them do nothing.
    el.addEventListener('click', e => {
      const tile = e.target.closest('.sc-tile[data-open]');
      if (!tile) return;
      AppState.currentCollection = Collections.byId(tile.dataset.id);
      Router.navigate('#/collection/' + tile.dataset.id);
    });
  },

  unmount() {
    if (this._cancelScroll) this._cancelScroll();
    this._cancelScroll = null;
  }
});
