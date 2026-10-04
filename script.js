// ===== 1. НАХОДИМ ЭЛЕМЕНТЫ =====
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
const resultImage       = document.getElementById('resultImage');
const resultMeta        = document.getElementById('resultMeta');
const downloadCurrent   = document.getElementById('downloadCurrent');
const clearResult       = document.getElementById('clearResult');

const gallery           = document.getElementById('gallery');
const galleryEmpty      = document.getElementById('galleryEmpty');
const clearGallery      = document.getElementById('clearGallery');
const galleryCount      = document.getElementById('galleryCount');

// ===== 2. ТАБЫ =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ===== 3. КОНФИГУРАЦИЯ МОДЕЛЕЙ =====
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
let attachedImages = []; // массив объектов { id, file, url }
let currentResult = null;

// ===== 4. ПРИМЕНЕНИЕ НАСТРОЕК МОДЕЛИ =====
function applyModelSettings(modelKey) {
  const cfg = MODELS[modelKey];

  // Разрешение
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

  // Обрезаем загруженные картинки, если их больше лимита
  if (attachedImages.length > cfg.maxImages) {
    attachedImages = attachedImages.slice(0, cfg.maxImages);
  }

  // Обновляем UI загрузки
  updateDropZone();
  renderImagePreviews();
}

// ===== 5. ВЫБОР МОДЕЛИ =====
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

document.addEventListener('click', (e) => {
  if (!modelDropdown.contains(e.target)) {
    modelDropdown.classList.remove('open');
  }
});

// ===== 6. КОЛИЧЕСТВО ГЕНЕРАЦИЙ =====
numImages.addEventListener('input', () => {
  numImagesValue.textContent = numImages.value;
});

// ===== 7. ЗАГРУЗКА ИЗОБРАЖЕНИЙ (мульти) =====

// Обновление внешнего вида drop-зоны и счётчика
function updateDropZone() {
  const max = MODELS[selectedModel].maxImages;
  const current = attachedImages.length;

  imagesCounter.textContent = `${current} / ${max}`;
  dropZoneHint.textContent = `PNG, JPG, WEBP — максимум ${max} файлов`;

  // Если достигнут лимит — блокируем drop-зону
  if (current >= max) {
    dropZone.classList.add('disabled');
  } else {
    dropZone.classList.remove('disabled');
  }
}

// Отрисовка превью
function renderImagePreviews() {
  imagesPreview.innerHTML = '';

  attachedImages.forEach(img => {
    const div = document.createElement('div');
    div.className = 'image-thumb';
    div.innerHTML = `
      <img src="${img.url}" alt="Превью">
      <button class="thumb-remove" data-id="${img.id}" type="button">✕</button>
    `;
    imagesPreview.appendChild(div);
  });
}

// Добавление файлов
function addImages(files) {
  const cfg = MODELS[selectedModel];
  const max = cfg.maxImages;
  const freeSlots = max - attachedImages.length;

  if (freeSlots <= 0) {
    alert(`Максимум ${max} изображений для модели ${cfg.name}`);
    return;
  }

  const filesToAdd = Array.from(files).slice(0, freeSlots);

  if (files.length > freeSlots) {
    alert(`Можно добавить только ${freeSlots} файл(ов). Лимит модели ${cfg.name}: ${max}.`);
  }

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

// Клик по drop-зоне → открыть выбор файлов
dropZone.addEventListener('click', () => {
  imageInput.click();
});

// Выбор файлов через input
imageInput.addEventListener('change', () => {
  if (imageInput.files.length) {
    addImages(imageInput.files);
    imageInput.value = ''; // чтобы можно было выбрать те же файлы повторно
  }
});

// Drag & drop
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

// Удаление картинки по крестику
imagesPreview.addEventListener('click', (e) => {
  const btn = e.target.closest('.thumb-remove');
  if (!btn) return;

  const id = btn.dataset.id;
  attachedImages = attachedImages.filter(img => img.id !== id);
  updateDropZone();
  renderImagePreviews();
});

// ===== 8. ГАЛЕРЕЯ =====
let galleryItems = [];

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
      <img src="${item.url}" alt="${escapeHtml(item.prompt)}" title="${escapeHtml(item.prompt)}">
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
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `aurora_${id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
});

clearGallery.addEventListener('click', () => {
  if (galleryItems.length === 0) return;
  if (!confirm('Удалить все изображения из галереи?')) return;
  galleryItems = [];
  renderGallery();
  updateGalleryCount();
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

  await new Promise(resolve => setTimeout(resolve, 1200));

  // Заглушка
  const colorA = randomColor();
  const colorB = randomColor();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}"/>
          <stop offset="100%" stop-color="${colorB}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#g)"/>
      <text x="300" y="290" fill="white" font-size="22" font-family="sans-serif"
            text-anchor="middle" dominant-baseline="middle" font-weight="bold">
        Aurora
      </text>
      <text x="300" y="325" fill="white" font-size="14" font-family="sans-serif"
            text-anchor="middle" dominant-baseline="middle" opacity="0.85">
        ${escapeHtml(prompt.slice(0, 40))}
      </text>
    </svg>
  `;
  const stubUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  const id = addToGallery(stubUrl, prompt, selectedModel);
  currentResult = { id, url: stubUrl, prompt, model: selectedModel };

  resultEmpty.classList.add('hidden');
  resultContent.classList.remove('hidden');
  resultImage.src = stubUrl;
  resultMeta.innerHTML = `
    <b>${MODELS[selectedModel].name}</b> • ${ratioSelect.value}<br>
    <span style="opacity:0.7">Входных изображений: ${attachedImages.length}</span>
  `;

  generateBtn.disabled = false;
  generateBtn.textContent = '✨ Сгенерировать';
});

// ===== 10. ДЕЙСТВИЯ С РЕЗУЛЬТАТОМ =====
downloadCurrent.addEventListener('click', () => {
  if (!currentResult) return;
  const a = document.createElement('a');
  a.href = currentResult.url;
  a.download = `aurora_${currentResult.id}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
});

clearResult.addEventListener('click', () => {
  currentResult = null;
  resultContent.classList.add('hidden');
  resultEmpty.classList.remove('hidden');
});

// ===== 11. УТИЛИТЫ =====
function randomColor() {
  const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#22d3ee'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== 12. СТАРТ =====
applyModelSettings(selectedModel);
renderGallery();
updateGalleryCount();
updateDropZone();
