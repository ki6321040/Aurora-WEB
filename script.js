// ===== 1. НАХОДИМ ЭЛЕМЕНТЫ =====
const promptInput       = document.getElementById('prompt');
const imageInput        = document.getElementById('imageInput');
const fileNameEl        = document.getElementById('fileName');
const previewWrap       = document.getElementById('previewWrap');
const previewImg        = document.getElementById('preview');
const removeImage       = document.getElementById('removeImage');

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
const resultBox         = document.getElementById('result');
const resultImageWrap   = document.getElementById('resultImageWrap');

const gallery           = document.getElementById('gallery');
const galleryEmpty      = document.getElementById('galleryEmpty');
const clearGallery      = document.getElementById('clearGallery');

// ===== 2. КОНФИГУРАЦИЯ МОДЕЛЕЙ =====
const MODELS = {
  'nano-banana-2': {
    name: 'Nano Banana 2',
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
let attachedImage = null;

// ===== 3. ПРИМЕНЕНИЕ НАСТРОЕК МОДЕЛИ =====
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
}

// ===== 4. ОТКРЫТИЕ / ЗАКРЫТИЕ ВЫПАДАЮЩЕГО СПИСКА =====
modelToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  modelDropdown.classList.toggle('open');
});

// Клик по элементу списка
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

// Клик вне — закрыть список
document.addEventListener('click', (e) => {
  if (!modelDropdown.contains(e.target)) {
    modelDropdown.classList.remove('open');
  }
});

// ===== 5. КОЛИЧЕСТВО ИЗОБРАЖЕНИЙ =====
numImages.addEventListener('input', () => {
  numImagesValue.textContent = numImages.value;
});

// ===== 6. ЗАГРУЗКА КАРТИНКИ =====
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  attachedImage = file;
  fileNameEl.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewWrap.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// ===== 7. УДАЛЕНИЕ КАРТИНКИ =====
removeImage.addEventListener('click', () => {
  attachedImage = null;
  imageInput.value = '';
  fileNameEl.textContent = 'Файл не выбран';
  previewWrap.classList.add('hidden');
  previewImg.src = '';
});

// ===== 8. ГАЛЕРЕЯ =====

// Массив сгенерированных картинок. Каждая запись: { id, url, prompt, model }
let galleryItems = [];

// Добавить картинку в галерею
function addToGallery(url, prompt, model) {
  const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  galleryItems.push({ id, url, prompt, model });
  renderGallery();
}

// Перерисовать всю галерею
function renderGallery() {
  // Очищаем всё кроме заглушки
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
      <img src="${item.url}" alt="${escapeHtml(item.prompt)}" title="${escapeHtml(item.prompt)}">
      <div class="gallery-actions">
        <button class="gallery-btn" data-action="download" data-id="${item.id}" title="Скачать">⬇</button>
        <button class="gallery-btn delete" data-action="delete" data-id="${item.id}" title="Удалить">🗑</button>
      </div>
    `;
    gallery.appendChild(div);
  });
}

// Обработка кликов в галерее (скачать / удалить)
gallery.addEventListener('click', (e) => {
  const btn = e.target.closest('.gallery-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  const item = galleryItems.find(i => i.id === id);
  if (!item) return;

  if (btn.dataset.action === 'delete') {
    galleryItems = galleryItems.filter(i => i.id !== id);
    renderGallery();
  }

  if (btn.dataset.action === 'download') {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `aurora_${id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
});

// Кнопка "Очистить всё"
clearGallery.addEventListener('click', () => {
  if (galleryItems.length === 0) return;
  if (!confirm('Удалить все изображения из галереи?')) return;
  galleryItems = [];
  renderGallery();
});

// ===== 9. ГЕНЕРАЦИЯ (заглушка) =====
generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert('Пожалуйста, введите промт');
    promptInput.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Генерация...';

  // 🔽 Здесь позже будет запрос к API
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Пока API нет — генерируем ЗАГЛУШКУ: цветной градиентный квадрат с текстом
  const colorA = randomColor();
  const colorB = randomColor();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}"/>
          <stop offset="100%" stop-color="${colorB}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <text x="200" y="200" fill="white" font-size="18" font-family="sans-serif"
            text-anchor="middle" dominant-baseline="middle">
        ${escapeHtml(prompt.slice(0, 30))}
      </text>
    </svg>
  `;
  const stubUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  // Добавляем в галерею
  addToGallery(stubUrl, prompt, selectedModel);

  // Показываем в блоке результата
  resultBox.classList.remove('hidden');
  resultImageWrap.innerHTML = `
    <img src="${stubUrl}" alt="Заглушка">
    <p style="color:#a78bfa; font-size:12px; margin-top:8px;">
      Заглушка. Модель: <b>${MODELS[selectedModel].name}</b>, соотношение: <b>${ratioSelect.value}</b>
    </p>
  `;

  generateBtn.disabled = false;
  generateBtn.textContent = '✨ Сгенерировать';
});

// Случайный цвет
function randomColor() {
  const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#22d3ee'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ===== 10. УТИЛИТЫ =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== 11. СТАРТ =====
applyModelSettings(selectedModel);
renderGallery();
