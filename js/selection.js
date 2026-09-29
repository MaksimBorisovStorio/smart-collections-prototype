/* Photo-book selection session.
   Lives outside the screens so it survives navigation: the user can start
   selecting in one collection, go back to Smart Collections, open another and
   keep adding. The floating bar sits in #app (not in a .screen), so it stays
   put while screens slide underneath it.
   Photo ids are "<collectionId>:<day>-<index>", unique across collections. */
const Selection = (() => {
  // Screens the bar is shown on while a session is active. On the book-choice
  // screens it's an info pill only: the count, no Cancel / Continue.
  const BAR_ROUTES = ['collection', 'smart-collections'];
  const INFO_ROUTES = ['book-orientation', 'book-options'];

  let active = false;
  // What the selection is for: 'book' once the user picked "Create a photo
  // book", null when select mode was started by tapping a photo. Continue asks
  // via the sheet while it's still null.
  let intent = null;
  const ids = new Set();
  const listeners = new Set();
  let bar, text, next, dialog, sheet, backdrop;

  function route() {
    return (window.location.hash.replace(/^#\/?/, '').split('/')[0]) || 'home';
  }

  function build() {
    const app = document.getElementById('app');

    bar = document.createElement('div');
    bar.className = 'sel-bar';
    bar.innerHTML = `
      <button class="sel-bar__cancel" id="sel-cancel">Cancel</button>
      <p class="sel-bar__text" id="sel-text">Start selecting photos</p>
      <button class="sel-bar__next" id="sel-next">Continue</button>`;
    app.appendChild(bar);
    text = bar.querySelector('#sel-text');
    next = bar.querySelector('#sel-next');
    bar.querySelector('#sel-cancel').addEventListener('click', cancel);
    next.addEventListener('click', () => {
      if (intent === 'book') return Router.navigate('#/book-orientation');
      chooseIntent().then(choice => {
        if (choice !== 'book') return;
        intent = 'book';
        Router.navigate('#/book-orientation');
      });
    });

    // "Create" options sheet, shared by the album's Create button and Continue.
    backdrop = document.createElement('div');
    backdrop.className = 'sheet-backdrop sel-sheet-backdrop';
    sheet = document.createElement('div');
    sheet.className = 'sheet sel-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Create');
    sheet.innerHTML = `
      <div class="sheet__handle"></div>
      <div class="sheet__options">
        <button class="sheet-option" data-choice="book">
          <span class="sheet-option__text"><span class="sheet-option__name">Create a photo book</span></span>
          <span class="sheet-option__arrow">›</span>
        </button>
        <button class="sheet-option" data-choice="upload">
          <span class="sheet-option__text"><span class="sheet-option__name">Upload to my photos</span></span>
          <span class="sheet-option__arrow">›</span>
        </button>
      </div>`;
    app.appendChild(backdrop);
    app.appendChild(sheet);

    // iOS-style alert for leaving the flow.
    dialog = document.createElement('div');
    dialog.className = 'sel-alert';
    dialog.innerHTML = `
      <div class="sel-alert__box" role="alertdialog" aria-labelledby="sel-alert-title">
        <p class="sel-alert__title" id="sel-alert-title">Are you sure you want to leave?</p>
        <p class="sel-alert__msg">All your selection will be canceled.</p>
        <div class="sel-alert__actions">
          <button class="sel-alert__btn" data-choice="stay">Stay</button>
          <button class="sel-alert__btn sel-alert__btn--destructive" data-choice="leave">Leave</button>
        </div>
      </div>`;
    app.appendChild(dialog);

    window.addEventListener('hashchange', render);
    render();
  }

  function render() {
    const n = ids.size;
    const r = route();
    const info = INFO_ROUTES.includes(r);
    bar.classList.toggle('sel-bar--visible', active && (info || BAR_ROUTES.includes(r)));
    bar.classList.toggle('sel-bar--info', info);
    bar.classList.toggle('sel-bar--has-selection', n > 0);
    text.textContent = n === 0 ? 'Start selecting photos' : `${n} photo${n === 1 ? '' : 's'} selected`;
    AppState.selectedPhotos = [...ids];
    listeners.forEach(fn => fn());
  }

  function start(why = null) { active = true; intent = why; render(); }
  function cancel() { active = false; intent = null; ids.clear(); render(); }

  // Opens the Create sheet. Resolves 'book', 'upload', or null if dismissed.
  // Upload is a prototype dead end: it just closes the sheet.
  function chooseIntent() {
    const toggle = open => {
      sheet.classList.toggle('sheet--active', open);
      backdrop.classList.toggle('sheet-backdrop--active', open);
    };
    toggle(true);
    return new Promise(resolve => {
      const done = choice => {
        sheet.removeEventListener('click', onSheet);
        backdrop.removeEventListener('click', onBackdrop);
        toggle(false);
        resolve(choice);
      };
      const onSheet = e => { const b = e.target.closest('[data-choice]'); if (b) done(b.dataset.choice); };
      const onBackdrop = () => done(null);
      sheet.addEventListener('click', onSheet);
      backdrop.addEventListener('click', onBackdrop);
    });
  }

  function set(list, on) {
    list.forEach(id => (on ? ids.add(id) : ids.delete(id)));
    render();
  }

  // Resolves true when the user confirms leaving (selection is then canceled).
  function confirmLeave() {
    if (!active) return Promise.resolve(true);
    dialog.classList.add('sel-alert--visible');
    return new Promise(resolve => {
      dialog.addEventListener('click', function onClick(e) {
        const btn = e.target.closest('[data-choice]');
        if (!btn) return;
        dialog.removeEventListener('click', onClick);
        dialog.classList.remove('sel-alert--visible');
        const leave = btn.dataset.choice === 'leave';
        if (leave) cancel();
        resolve(leave);
      });
    });
  }

  // Subscribe to changes; returns an unsubscribe function.
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  window.addEventListener('DOMContentLoaded', build);

  return {
    get active() { return active; },
    has: id => ids.has(id),
    start, cancel, set, chooseIntent, confirmLeave, onChange
  };
})();

window.Selection = Selection;
