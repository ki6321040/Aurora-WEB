(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    const authScreen = document.getElementById('authScreen');
    const appMain = document.getElementById('appMain');
    const guestBtn = document.getElementById('guestBtn');
    const authMessage = document.getElementById('authMessage');

    function setMessage(text, color) {
      if (!authMessage) return;
      authMessage.textContent = text;
      authMessage.style.color = color || '#9ca3af';
    }

    function showAuthScreen() {
      if (appMain) appMain.classList.add('hidden');
      if (authScreen) authScreen.classList.remove('hidden');
    }

    function hideAuthScreen() {
      if (appMain) appMain.classList.remove('hidden');
      if (authScreen) authScreen.classList.add('hidden');
    }

    function switchAuthTab(mode) {
      if (!authScreen) return;
      const tabs = authScreen.querySelectorAll('.auth-tab');
      const forms = authScreen.querySelectorAll('.auth-form');
      setMessage('');

      tabs.forEach(function (t) { t.classList.remove('active'); });
      forms.forEach(function (f) { f.classList.add('hidden'); });

      if (mode === 'login') {
        if (tabs[0]) tabs[0].classList.add('active');
        const lf = document.getElementById('loginForm');
        if (lf) lf.classList.remove('hidden');
      } else {
        if (tabs[1]) tabs[1].classList.add('active');
        const rf = document.getElementById('registerForm');
        if (rf) rf.classList.remove('hidden');
      }
    }

    document.querySelectorAll('.auth-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchAuthTab(tab.dataset.tab);
      });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        setMessage('Авторизация временно недоступна. Войдите как гость.', '#fbbf24');
      });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        setMessage('Регистрация временно недоступна. Войдите как гость.', '#fbbf24');
      });
    }

    if (guestBtn) {
      guestBtn.addEventListener('click', function () {
        localStorage.setItem('aurora_guest', '1');
        hideAuthScreen();
      });
    }

    if (localStorage.getItem('aurora_guest') === '1') {
      hideAuthScreen();
    } else {
      showAuthScreen();
    }
  });
})();
