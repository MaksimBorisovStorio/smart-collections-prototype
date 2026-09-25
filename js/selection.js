/* Photo-book selection session.
   Lives outside the screens so it survives navigation: the user can start
   selecting in one collection, go back to Smart Collections, open another and
   keep adding. The floating bar sits in #app (not in a .screen), so it stays
   put while screens slide underneath it.
   Photo ids are "<collectionId>:<day>-<index>", unique across collections. */
const Selection = (() => {
  // Screens the bar is shown on while a session is active.
  const BAR_ROUTES = ['collection', 'smart-collections'];

  let active = false;
  const ids = new Set();
  const listeners = new Set();
  let bar, text, next, dialog;

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
    next.addEventListener('click', () => Router.navigate('#/book-orientation'));

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
    bar.classList.toggle('sel-bar--visible', active && BAR_ROUTES.includes(route()));
    bar.classList.toggle('sel-bar--has-selection', n > 0);
    text.textContent = n === 0 ? 'Start selecting photos' : `${n} photo${n === 1 ? '' : 's'} selected`;
    AppState.selectedPhotos = [...ids];
    listeners.forEach(fn => fn());
  }

  function start() { active = true; render(); }
  function cancel() { active = false; ids.clear(); render(); }

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
    start, cancel, set, confirmLeave, onChange
  };
})();

window.Selection = Selection;
