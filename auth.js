(function () {
  'use strict';

  const SUPABASE_URL = 'https://txcceysqsvljptvdxwni.supabase.co/rest/v1/';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_u5dAfUcaLVfegeDdZkMZDg_nkCVirLh';

  let supabaseClient = null;
  let currentUser = null;

  function showAuthScreen() {
    const app = document.getElementById('appMain');
    const authScreen = document.getElementById('authScreen');
    if (app) app.classList.add('hidden');
    if (authScreen) authScreen.classList.remove('hidden');
  }

  function hideAuthScreen() {
    const app = document.getElementById('appMain');
    const authScreen = document.getElementById('authScreen');
    if (app) app.classList.remove('hidden');
    if (authScreen) authScreen.classList.add('hidden');
  }

  function setMessage(text, color) {
    const msgEl = document.getElementById('authMessage');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.color = color || '#9ca3af';
  }

  function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const userMenu = document.getElementById('userMenu');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');

    if (!authBtn) return;

    if (currentUser) {
      authBtn.classList.add('hidden');
      if (userMenu) userMenu.classList.remove('hidden');
      if (userEmailEl) userEmailEl.textContent = currentUser.email;
      if (userAvatarEl) userAvatarEl.textContent = currentUser.email.charAt(0).toUpperCase();
    } else {
      authBtn.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
    }
  }

  function switchAuthTab(mode) {
    const authScreen = document.getElementById('authScreen');
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

  async function signUp(email, password) {
    const redirectTo = window.location.origin + window.location.pathname;
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) {
      return { success: 'Аккаунт создан. Проверьте почту для подтверждения.' };
    }
    return { success: 'Вы вошли в аккаунт.' };
  }

  async function signIn(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) return { error: 'Неверный email или пароль.' };
    return { success: 'Вы вошли в аккаунт.' };
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    showAuthScreen();
    updateAuthUI();
  }

  async function init() {
    if (typeof supabase === 'undefined') {
      setMessage('Не удалось загрузить модуль авторизации. Проверьте интернет.', '#f87171');
      showAuthScreen();
      return;
    }

    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    } catch (e) {
      setMessage('Ошибка подключения к серверу авторизации.', '#f87171');
      showAuthScreen();
      return;
    }

    supabaseClient.auth.onAuthStateChange(function (event, session) {
      if (session) {
        currentUser = session.user;
        hideAuthScreen();
      } else {
        currentUser = null;
        showAuthScreen();
      }
      updateAuthUI();
    });

    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchAuthTab(tab.dataset.tab);
      });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        setMessage('Вход...', '#9ca3af');
        const result = await signIn(email, password);
        if (result.error) {
          setMessage(result.error, '#f87171');
        } else {
          setMessage(result.success, '#34d399');
          loginForm.reset();
        }
      });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        if (password.length < 6) {
          setMessage('Пароль должен быть не менее 6 символов', '#f87171');
          return;
        }
        setMessage('Создание аккаунта...', '#9ca3af');
        const result = await signUp(email, password);
        if (result.error) {
          setMessage(result.error, '#f87171');
        } else {
          setMessage(result.success, '#34d399');
          registerForm.reset();
        }
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        await signOut();
      });
    }

    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session) {
      currentUser = data.session.user;
      hideAuthScreen();
    } else {
      showAuthScreen();
    }
    updateAuthUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
