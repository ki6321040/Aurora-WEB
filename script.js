const promptInput       = document.getElementById('prompt');
const imageInput        = document.getElementById('imageInput');
const dropZone          = document.getElementById('dropZone');
const dropZoneHint      = document.getElementById('dropZoneHint');
const imagesPreview     = document.getElementById('imagesPreview');
const imagesCounter     = document.getElementById('imagesCounter');

const modelDropdown     = document.getElementById('modelDropdown');
const modelToggle       = document.getElementById('modelToggle');
const modelMenu         = document.getElementById('modelMenu');
const modelLabel        = document.getElementById('modelLabel');

const ratioSelect       = document.getElementById('ratioSelect');
const resolutionBlock   = document.getElementById('resolutionBlock');
const resolutionSelect  = document.getElementById('resolutionSelect');
const versionBlock      = document.getElementById('versionBlock');
const versionSelect     = document.getElementById('versionSelect');
const numImages         = document.getElementById('numImages');
const numImagesValue    = document.getElementById('numImagesValue');
const seedBlock         = document.getElementById('seedBlock');
const seedInput         = document.getElementById('seedInput');
const randomSeedBtn     = document.getElementById('randomSeedBtn');
const systemPromptBlock = document.getElementById('systemPromptBlock');
const systemPromptInput = document.getElementById('systemPrompt');
const formatSelect      = document.getElementById('formatSelect');
const translateRow      = document.getElementById('translateRow');
const translateInput    = document.getElementById('translateInput');
const webSearchRow      = document.getElementById('webSearchRow');
const webSearch         = document.getElementById('webSearch');
const thinkingBlock     = document.getElementById('thinkingBlock');
const thinkingSelect    = document.getElementById('thinkingSelect');
const generateBtn       = document.getElementById('generateBtn');

const resultEmpty       = document.getElementById('resultEmpty');
const resultContent     = document.getElementById('resultContent');
const resultImages      = document.getElementById('resultImages');
const resultMeta        = document.getElementById('resultMeta');
const downloadCurrent   = document.getElementById('downloadCurrent');
const clearResult       = document.getElementById('clearResult');

const gallery           = document.getElementById('gallery');
const galleryEmpty      = document.getElementById('galleryEmpty');
const clearGallery      = document.getElementById('clearGallery');
const galleryCount      = document.getElementById('galleryCount');

const profileWrap       = document.getElementById('profileWrap');
const profileBtn        = document.getElementById('profileBtn');
const profileMenu       = document.getElementById('profileMenu');
const profileAvatar     = document.getElementById('profileAvatar');
const profileAvatarMenu = document.getElementById('profileAvatarMenu');
const profileNameMenu   = document.getElementById('profileNameMenu');
const profileStatsMenu  = document.getElementById('profileStatsMenu');

const profileModal      = document.getElementById('profileModal');
const modalClose        = document.getElementById('modalClose');
const modalAvatar       = document.getElementById('modalAvatar');
const modalName         = document.getElementById('modalName');
const modalSub          = document.getElementById('modalSub');

const statGenerated     = document.getElementById('statGenerated');
const statGallery       = document.getElementById('statGallery');
const statDays          = document.getElementById('statDays');

const userName          = document.getElementById('userName');
const themeSelect       = document.getElementById('themeSelect');
const notificationsToggle = document.getElementById('notificationsToggle');
const autoSaveToggle    = document.getElementById('autoSaveToggle');
const saveProfileBtn    = document.getElementById('saveProfileBtn');

const toast             = document.getElementById('toast');

// ===== ЗВЁЗДЫ =====
const starsBtn          = document.getElementById('starsBtn');
const starsCount        = document.getElementById('starsCount');
const starsModal        = document.getElementById('starsModal');
const starsModalClose   = document.getElementById('starsModalClose');
const starsModalBalance = document.getElementById('starsModalBalance');
const starsCustomInput  = document.getElementById('starsCustomInput');
const starsTopUpBtn     = document.getElementById('starsTopUpBtn');
const starsPacks        = document.querySelectorAll('.stars-pack');

const MAX_SEED = 4294967295;
const STARS_KEY = 'aurora_stars';

// ===== ПРОФИЛЬ =====
const DEFAULT_PROFILE = {
  name: 'Гость',
  theme: 'dark',
  notifications: true,
  autoSave: true,
  generated: 0,
  firstVisit: Date.now()
};

let profile = loadProfile();

function loadProfile() {
  try {
    const saved = localStorage.getItem('aurora_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (e) {}
  return { ...DEFAULT_PROFILE };
}

function saveProfile() {
  try {
    localStorage.setItem('aurora_profile', JSON.stringify(profile));
  } catch (e) {}
}

// ===== ЗВЁЗДЫ: ЛОГИКА =====
function getStars() {
  const v = parseInt(localStorage.getItem(STARS_KEY) || '0', 10);
  return isNaN(v) || v < 0 ? 0 : v;
}

function setStars(value) {
  const v = Math.max(0, parseInt(value, 10) || 0);
  localStorage.setItem(STARS_KEY, String(v));
  updateStarsUI();
}

function addStars(amount) {
  const current = getStars();
  setStars(current + amount);
}

function updateStarsUI() {
  const balance = getStars();
  if (starsCount) starsCount.textContent = balance;
  if (starsModalBalance) starsModalBalance.textContent = balance;
}

// Открытие/закрытие модалки звёзд
function openStarsModal() {
  updateStarsUI();
  starsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeStarsModal() {
  starsModal.classList.add('hidden');
  document.body.style.overflow = '';
  starsCustomInput.value = '';
  starsPacks.forEach(p => p.classList.remove('active'));
}

if (starsBtn) starsBtn.addEventListener('click', openStarsModal);
if (starsModalClose) starsModalClose.addEventListener('click', closeStarsModal);

if (starsModal) {
  starsModal.addEventListener('click', (e) => {
    if (e.target === starsModal) closeStarsModal();
  });
}

// Выбор пакета
starsPacks.forEach(pack => {
  pack.addEventListener('click', () => {
    starsPacks.forEach(p => p.classList.remove('active'));
    pack.classList.add('active');
    starsCustomInput.value = '';
  });
});

// Очистка выбора пакета при вводе своего числа
if (starsCustomInput) {
  starsCustomInput.addEventListener('input', () => {
    const val = starsCustomInput.value.replace(/[^0-9]/g, '');
    if (val !== starsCustomInput.value) starsCustomInput.value = val;

    if (val !== '') {
      starsPacks.forEach(p => p.classList.remove('active'));
    }
  });

  starsCustomInput.addEventListener('keydown', (e) => {
    if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) e.preventDefault();
  });
}

// Кнопка "Пополнить"
if (starsTopUpBtn) {
  starsTopUpBtn.addEventListener('click', () => {
    let amount = 0;

    const activePack = document.querySelector('.stars-pack.active');
    if (activePack) {
      amount = parseInt(activePack.dataset.stars, 10);
    } else {
      amount = parseInt(starsCustomInput.value, 10);
    }

    if (!amount || amount < 1) {
      showToast('Выберите пакет или введите количество');
      return;
    }

    if (amount > 100000) {
      showToast('Максимум 100 000 за раз');
      return;
    }

    addStars(amount);
    showToast(`Начислено ${amount} ⭐`);
    closeStarsModal();
  });
}

// ===== ТАБЫ =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ===== МОДЕЛИ =====
const MODELS = {
  'nano-banana-2': {
    name: 'Nano Banana 2',
    maxImages: 4,
    resolutions: ['0.5K', '1K', '2K', '4K'],
    defaultResolution: '1K',
    hasTranslate: false,
    hasVersion: false,
    hasSeed: true,
    hasSystemPrompt: false,
    hasWebSearch: true,
    hasThinking: true
  },
  'nano-banana-pro': {
    name: 'Nano Banana Pro',
    maxImages: 14,
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '2K',
    hasTranslate: true,
    hasVersion: false,
    hasSeed: false,
    hasSystemPrompt: false,
    hasWebSearch: false,
    hasThinking: false
  },
  'nano-banana-lite': {
    name: 'Nano Banana Lite',
    maxImages: 4,
    resolutions: null,
    defaultResolution: null,
    hasTranslate: false,
    hasVersion: true,
    hasSeed: true,
    hasSystemPrompt: true,
    hasWebSearch: false,
    hasThinking: true
  }
};

let selectedModel = 'nano-banana-2';
let attachedImages = [];
let currentResults = [];
let galleryItems = [];

function applyModelSettings(modelKey) {
  const cfg = MODELS[modelKey];

  if (cfg.resolutions) {
    resolutionBlock.classList.remove('hidden');
    resolutionSelect.innerHTML = cfg.resolutions
      .map(r => `<option value="${r}" ${r === cfg.defaultResolution ? 'selected' : ''}>${r}</option>`)
      .join('');
  } else {
    resolutionBlock.classList.add('hidden');
  }

  versionBlock.classList.toggle('hidden', !cfg.hasVersion);
  seedBlock.classList.toggle('hidden', !cfg.hasSeed);
  systemPromptBlock.classList.toggle('hidden', !cfg.hasSystemPrompt);
  translateRow.classList.toggle('hidden', !cfg.hasTranslate);
  webSearchRow.classList.toggle('hidden', !cfg.hasWebSearch);
  thinkingBlock.classList.toggle('hidden', !cfg.hasThinking);

  if (attachedImages.length > cfg.maxImages) {
    attachedImages = attachedImages.slice(0, cfg.maxImages);
  }

  updateDropZone();
  renderImagePreviews();
}

modelToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  modelDropdown.classList.toggle('open');
});

modelMenu.addEventListener('click', (e) => {
  const item = e.target.closest('.dropdown-item');
  if (!item) return;
  modelMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  selectedModel = item.dataset.model;
  modelLabel.textContent = MODELS[selectedModel].name;
  applyModelSettings(selectedModel);
  modelDropdown.classList.remove('open');
});

numImages.addEventListener('input', () => {
  numImagesValue.textContent = numImages.value;
});

// ===== SEED =====
seedInput.addEventListener('input', () => {
  let val = seedInput.value.replace(/[^0-9]/g, '');
  if (val.length > 1) val = val.replace(/^0+/, '');
  if (val !== '') {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > MAX_SEED) val = String(MAX_SEED);
  }
  seedInput.value = val;
});

seedInput.addEventListener('keydown', (e) => {
  if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) e.preventDefault();
});

randomSeedBtn.addEventListener('click', () => {
  const randomSeed = Math.floor(Math.random() * (MAX_SEED + 1));
  seedInput.value = randomSeed;
  showToast(`Seed: ${randomSeed}`);
});

// ===== ЗАГРУЗКА КАРТИНОК =====
function updateDropZone() {
  const max = MODELS[selectedModel].maxImages;
  const current = attachedImages.length;
  imagesCounter.textContent = `${current} / ${max}`;
  dropZoneHint.textContent = `PNG, JPG, WEBP — максимум ${max} файлов`;
  if (current >= max) dropZone.classList.add('disabled');
  else dropZone.classList.remove('disabled');
}

function renderImagePreviews() {
  imagesPreview.innerHTML = '';
  attachedImages.forEach(img => {
    const div = document.createElement('div');
    div.className = 'image-thumb';
    div.innerHTML = `<img src="${img.url}" alt=""><button class="thumb-remove" data-id="${img.id}" type="button">✕</button>`;
    imagesPreview.appendChild(div);
  });
}

function addImages(files) {
  const cfg = MODELS[selectedModel];
  const max = cfg.maxImages;
  const freeSlots = max - attachedImages.length;
  if (freeSlots <= 0) { showToast(`Максимум ${max}`); return; }
  const filesToAdd = Array.from(files).slice(0, freeSlots);
  if (files.length > freeSlots) showToast(`Добавлено ${freeSlots}`);
  filesToAdd.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      attachedImages.push({
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        file,
        url: e.target.result
      });
      updateDropZone();
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
}

dropZone.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', () => {
  if (imageInput.files.length) {
    addImages(imageInput.files);
    imageInput.value = '';
  }
});

['dragenter', 'dragover'].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  if (files.length) addImages(files);
});

imagesPreview.addEventListener('click', (e) => {
  const btn = e.target.closest('.thumb-remove');
  if (!btn) return;
  const id = btn.dataset.id;
  attachedImages = attachedImages.filter(img => img.id !== id);
  updateDropZone();
  renderImagePreviews();
});

// ===== ГАЛЕРЕЯ =====
function addToGallery(url, prompt, model) {
  const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  galleryItems.push({ id, url, prompt, model });
  renderGallery();
  updateGalleryCount();
  return id;
}

function renderGallery() {
  gallery.querySelectorAll('.gallery-item').forEach(el => el.remove());
  if (galleryItems.length === 0) {
    galleryEmpty.style.display = 'block';
    return;
  }
  galleryEmpty.style.display = 'none';
  galleryItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${item.url}" alt="" title="${escapeHtml(item.prompt)}">
      <div class="gallery-actions">
        <button class="gallery-btn" data-action="download" data-id="${item.id}" title="Скачать">⬇</button>
        <button class="gallery-btn delete" data-action="delete" data-id="${item.id}" title="Удалить">🗑</button>
      </div>
    `;
    gallery.appendChild(div);
  });
}

function updateGalleryCount() {
  galleryCount.textContent = galleryItems.length;
  updateProfileStats();
}

gallery.addEventListener('click', (e) => {
  const btn = e.target.closest('.gallery-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  const item = galleryItems.find(i => i.id === id);
  if (!item) return;
  if (btn.dataset.action === 'delete') {
    galleryItems = galleryItems.filter(i => i.id !== id);
    renderGallery();
    updateGalleryCount();
  }
  if (btn.dataset.action === 'download') {
    downloadUrl(item.url, `aurora_${id}.png`);
  }
});

clearGallery.addEventListener('click', () => {
  if (galleryItems.length === 0) return;
  if (!confirm('Удалить все изображения?')) return;
  galleryItems = [];
  renderGallery();
  updateGalleryCount();
});

// ===== ГЕНЕРАЦИЯ (заглушка) =====
generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    showToast('Введите промт');
    promptInput.focus();
    return;
  }

  const count = parseInt(numImages.value, 10) || 1;
  let seed = seedInput.value.trim();
  if (seed !== '') {
    const num = parseInt(seed, 10);
    if (isNaN(num) || num < 0 || num > MAX_SEED) {
      seed = '';
      seedInput.value = '';
    }
  }

  generateBtn.disabled = true;
  generateBtn.textContent = `⏳ Генерация ${count} изобр...`;

  try {
    await new Promise(resolve => setTimeout(resolve, 1200));

    resultImages.innerHTML = '';
    currentResults = [];

    for (let i = 0; i < count; i++) {
      const stubUrl = makeStub(prompt, i + 1, count);
      let id;
      if (profile.autoSave) id = addToGallery(stubUrl, prompt, selectedModel);
      else id = 'tmp_' + Date.now() + '_' + i;

      currentResults.push({ id, url: stubUrl, prompt, model: selectedModel });

      const img = document.createElement('img');
      img.src = stubUrl;
      img.alt = '';
      resultImages.appendChild(img);
    }

    profile.generated += count;
    saveProfile();
    updateProfileStats();

    resultEmpty.classList.add('hidden');
    resultContent.classList.remove('hidden');

    const seedText = seed ? `seed: ${seed}` : 'seed: случайный';
    resultMeta.innerHTML = `
      <b>${MODELS[selectedModel].name}</b> • ${ratioSelect.value} • ${seedText}<br>
      <span style="opacity:0.7">Сгенерировано: ${count} • Входных: ${attachedImages.length}</span>
    `;

    if (profile.notifications) showToast(`Готово! ${count} изображений`);
  } catch (err) {
    resultImages.innerHTML = `<div style="color:#f87171;padding:16px;">Ошибка: ${escapeHtml(err.message)}</div>`;
    resultEmpty.classList.add('hidden');
    resultContent.classList.remove('hidden');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = '✨ Сгенерировать';
  }
});

function makeStub(prompt, index, total) {
  const colorA = randomColor();
  const colorB = randomColor();
  const label = total > 1 ? `${index} / ${total}` : 'Aurora';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <defs>
        <linearGradient id="g${index}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}"/>
          <stop offset="100%" stop-color="${colorB}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#g${index})"/>
      <text x="300" y="290" fill="white" font-size="22" font-family="sans-serif"
            text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeHtml(label)}</text>
      <text x="300" y="325" fill="white" font-size="14" font-family="sans-serif"
            text-anchor="middle" dominant-baseline="middle" opacity="0.85">${escapeHtml(prompt.slice(0, 40))}</text>
    </svg>
  `;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ===== ДЕЙСТВИЯ С РЕЗУЛЬТАТОМ =====
downloadCurrent.addEventListener('click', () => {
  if (currentResults.length === 0) return;
  currentResults.forEach((res, i) => {
    setTimeout(() => downloadUrl(res.url, `aurora_${res.id}.png`), i * 150);
  });
});

clearResult.addEventListener('click', () => {
  currentResults = [];
  resultImages.innerHTML = '';
  resultContent.classList.add('hidden');
  resultEmpty.classList.remove('hidden');
});

// ===== ПРОФИЛЬ =====
profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  profileMenu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!profileWrap.contains(e.target)) profileMenu.classList.remove('open');
  if (!modelDropdown.contains(e.target)) modelDropdown.classList.remove('open');
});

profileMenu.addEventListener('click', (e) => {
  const item = e.target.closest('.profile-menu-item');
  if (!item) return;
  const action = item.dataset.action;
  profileMenu.classList.remove('open');

  if (action === 'open-profile' || action === 'open-settings') openProfileModal();

  if (action === 'reset') {
    if (confirm('Сбросить все данные?')) {
      profile = { ...DEFAULT_PROFILE, firstVisit: Date.now() };
      saveProfile();
      applyProfile();
      showToast('Данные сброшены');
    }
  }
});

function openProfileModal() {
  userName.value = profile.name;
  themeSelect.value = profile.theme;
  notificationsToggle.checked = profile.notifications;
  autoSaveToggle.checked = profile.autoSave;
  updateProfileStats();
  profileModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  profileModal.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeProfileModal);

profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) closeProfileModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!profileModal.classList.contains('hidden')) closeProfileModal();
    if (!starsModal.classList.contains('hidden')) closeStarsModal();
  }
});

saveProfileBtn.addEventListener('click', () => {
  profile.name = userName.value.trim() || 'Гость';
  profile.theme = themeSelect.value;
  profile.notifications = notificationsToggle.checked;
  profile.autoSave = autoSaveToggle.checked;
  saveProfile();
  applyProfile();
  showToast('Профиль сохранён');
  closeProfileModal();
});

function applyProfile() {
  const initial = (profile.name || 'Гость').charAt(0).toUpperCase();
  profileAvatar.textContent = initial;
  profileAvatarMenu.textContent = initial;
  modalAvatar.textContent = initial;
  profileNameMenu.textContent = profile.name;
  modalName.textContent = profile.name;
  if (profile.theme === 'light') document.body.classList.add('light-theme');
  else document.body.classList.remove('light-theme');
}

function updateProfileStats() {
  const stats = {
    generated: profile.generated,
    gallery: galleryItems.length,
    days: Math.max(1, Math.ceil((Date.now() - profile.firstVisit) / (1000 * 60 * 60 * 24)))
  };
  statGenerated.textContent = stats.generated;
  statGallery.textContent = stats.gallery;
  statDays.textContent = stats.days;
  profileStatsMenu.textContent = `${stats.generated} генераций`;
}

// ===== ТОСТ =====
let toastTimeout;
function showToast(message) {
  if (!profile.notifications) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2500);
}

// ===== УТИЛИТЫ =====
function downloadUrl(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function randomColor() {
  const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#22d3ee'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== СТАРТ =====
applyProfile();
applyModelSettings(selectedModel);
renderGallery();
updateGalleryCount();
updateDropZone();
updateStarsUI();
