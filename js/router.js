const Router = (() => {
  const screens = {};
  let currentScreen = null;
  let isNavigatingBack = false;

  function register(route, module) {
    screens[route] = module;
  }

  function getRouteAndParams(hash) {
    const path = (hash || '').replace(/^#\/?/, '').split('/');
    const route = path[0] || 'home';
    const params = path.slice(1);
    return { route, params };
  }

  function navigate(hash) {
    isNavigatingBack = false;
    window.location.hash = hash;
  }

  function back() {
    isNavigatingBack = true;
    history.back();
  }

  function handleRoute() {
    const { route, params } = getRouteAndParams(window.location.hash);
    const module = screens[route];
    if (!module) return;

    const container = document.getElementById('app');

    if (currentScreen) {
      currentScreen.unmount && currentScreen.unmount();
      const old = container.querySelector('.screen--active');
      if (old) {
        old.classList.remove('screen--active');
        old.classList.add('screen--exit-right');
        old.addEventListener('transitionend', () => old.remove(), { once: true });
      }
    }

    const el = document.createElement('div');
    el.className = 'screen' + (isNavigatingBack ? ' screen--active' : ' screen--enter-right');
    el.innerHTML = module.render(params);
    container.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('screen--enter-right');
        el.classList.add('screen--active');
      });
    });

    currentScreen = module;
    module.mount && module.mount(el, params);
    isNavigatingBack = false;
  }

  window.addEventListener('hashchange', handleRoute);

  return { register, navigate, back, handleRoute };
})();

window.Router = Router;
