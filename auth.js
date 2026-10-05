const SUPABASE_URL = 'https://txcceysqsvljptvdxxwni.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_u5dAfUcaLVfegeDdZkMZDg_nkCVirLh';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let currentUser = null;

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    currentUser = session.user;
    hideAuthScreen();
    updateAuthUI();
  } else {
    currentUser = null;
    showAuthScreen();
    updateAuthUI();
  }
});

async function signUp(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });

    if (error) return { error: error.message };

    if (data.user && !data.session) {
      return { success: 'Аккаунт создан. Проверьте почту для подтверждения.' };
    }

    return { success: 'Вы вошли в аккаунт.' };
  } catch (e) {
    return { error: e.message };
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) return { error: 'Неверный email или пароль.' };

    return { success: 'Вы вошли в аккаунт.' };
  } catch (e) {
    return { error: e.message };
  }
}

async function signOut() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  showAuthScreen();
  updateAuthUI();
}

function showAuthScreen() {
  const app = document.querySelector('.app');
  const authScreen = document.getElementById('authScreen');
  if (app) app.classList.add('hidden');
  if (authScreen) authScreen.classList.remove('hidden');
}

function hideAuthScreen() {
  const app = document.querySelector('.app');
  const authScreen = document.getElementById('authScreen');
  if (app) app.classList.remove('hidden');
  if (authScreen) authScreen.classList.add('hidden');
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
  const message = document.getElementById('authMessage');

  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.add('hidden'));
  if (message) message.textContent = '';

  if (mode === 'login') {
    tabs[0].classList.add('active');
    document.getElementById('loginForm').classList.remove('hidden');
  } else {
    tabs[1].classList.add('active');
    document.getElementById('registerForm').classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const msgEl = document.getElementById('authMessage');

      msgEl.textContent = 'Вход...';
      msgEl.style.color = '#9ca3af';
      const result = await signIn(email, password);

      if (result.error) {
        msgEl.textContent = result.error;
        msgEl.style.color = '#f87171';
      } else {
        msgEl.textContent = result.success;
        msgEl.style.color = '#34d399';
        loginForm.reset();
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const msgEl = document.getElementById('authMessage');

      if (password.length < 6) {
        msgEl.textContent = 'Пароль должен быть не менее 6 символов';
        msgEl.style.color = '#f87171';
        return;
      }

      msgEl.textContent = 'Создание аккаунта...';
      msgEl.style.color = '#9ca3af';
      const result = await signUp(email, password);

      if (result.error) {
        msgEl.textContent = result.error;
        msgEl.style.color = '#f87171';
      } else {
        msgEl.textContent = result.success;
        msgEl.style.color = '#34d399';
        registerForm.reset();
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }
});

(async () => {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    hideAuthScreen();
    updateAuthUI();
  } else {
    showAuthScreen();
  }
})();
