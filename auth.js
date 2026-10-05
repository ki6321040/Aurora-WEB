// ===== AUTH.JS — Регистрация и вход через Supabase =====

// 1. ВСТАВЬ СВОИ КЛЮЧИ СЮДА (из настроек Supabase)
const SUPABASE_URL = 'https://txcceysqsvljptvdxxwni.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'ВСТАВЬ_СЮДА_СВОЙ_sb_publishable_КЛЮЧ';

// 2. Инициализация клиента Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Глобальная переменная — текущий пользователь
let currentUser = null;

// ===== 3. СЛУШАЕМ ИЗМЕНЕНИЯ АВТОРИЗАЦИИ =====
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    currentUser = session.user;
    updateAuthUI();
    console.log('Вход выполнен:', currentUser.email);
  } else {
    currentUser = null;
    updateAuthUI();
    console.log('Пользователь вышел');
  }
});

// ===== 4. РЕГИСТРАЦИЯ =====
async function signUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Если сессии нет — значит нужно подтвердить email
  if (data.user && !data.session) {
    return { success: 'Регистрация успешна! Проверьте почту и подтвердите email.' };
  }

  return { success: 'Вы успешно зарегистрированы!' };
}

// ===== 5. ВХОД =====
async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    return { error: 'Неверный email или пароль.' };
  }

  return { success: 'Вы вошли!' };
}

// ===== 6. ВЫХОД =====
async function signOut() {
  await supabaseClient.auth.signOut();
  updateAuthUI();
}

// ===== 7. ОБНОВЛЕНИЕ UI =====
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

// ===== 8. МОДАЛЬНЫЕ ОКНА =====
function openAuthModal(mode) {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const tabs = modal.querySelectorAll('.auth-tab');
  const forms = modal.querySelectorAll('.auth-form');

  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.add('hidden'));

  if (mode === 'login') {
    tabs[0].classList.add('active');
    document.getElementById('loginForm').classList.remove('hidden');
  } else {
    tabs[1].classList.add('active');
    document.getElementById('registerForm').classList.remove('hidden');
  }

  document.getElementById('authMessage').textContent = '';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
}

// ===== 9. ОБРАБОТЧИКИ =====
document.addEventListener('DOMContentLoaded', () => {
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    authBtn.addEventListener('click', () => openAuthModal('login'));
  }

  const closeBtn = document.getElementById('authModalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);

  // Клик по оверлею — закрыть
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAuthModal();
    });
  }

  // Esc — закрыть
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
  });

  // Вкладки
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => openAuthModal(tab.dataset.tab));
  });

  // ВХОД
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const msgEl = document.getElementById('authMessage');

      msgEl.textContent = 'Вход...';
      msgEl.style.color = '#9ca3af';
      const result = await signIn(email, password);

      if (result.error) {
        msgEl.textContent = result.error;
        msgEl.style.color = '#f87171';
      } else {
        closeAuthModal();
        loginForm.reset();
        if (typeof showToast === 'function') showToast('Добро пожаловать!');
      }
    });
  }

  // РЕГИСТРАЦИЯ
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const msgEl = document.getElementById('authMessage');

      msgEl.textContent = 'Регистрация...';
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

  // ВЫХОД
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
      if (typeof showToast === 'function') showToast('Вы вышли');
    });
  }
});
