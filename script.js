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
const resultImages      = document.getElementById('resultImages');
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
let attachedImages = [];
let currentResults = [];
let galleryItems = [];

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

  // Если загружено больше лимита — обрезаем
  if (attachedImages.length > cfg.maxImages) {
    attachedImages = attachedImages.slice(0, cfg.maxImages);
  }

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

// ===== 6. ПОЛЗУНОК КОЛИЧЕСТВА =====
numImages.addEventListener('input', () => {
  numImagesValue.textContent = numImages.value;
});

// ===== 7. ЗАГРУЗКА ИЗОБРАЖЕНИЙ =====
function updateDropZone() {
  const max = MODELS[selectedModel].maxImages;
  const current = attachedImages.length;

  imagesCounter.textContent = `${current} / ${max}`;
  dropZoneHint.textContent = `PNG, JPG, WEBP — максимум ${max} файлов`;

  if (current >= max) {
    dropZone.classList.add('disabled');
  } else {
    dropZone.classList.remove('disabled');
  }
}

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

dropZone.addEventListener('click', () => {
  imageInput.click();
});

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

// ===== 8. ГАЛЕРЕЯ =====
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

// ===== 9. ГЕНЕРАЦИЯ (заглушка, N штук) =====
generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert('Пожалуйста, введите промт');
    promptInput.focus();
    return;
  }

  const count = parseInt(numImages.value, 10) || 1;

  generateBtn.disabled = true;
  generateBtn.textContent = `⏳ Генерация ${count} изобр...`;

  await new Promise(resolve => setTimeout(resolve, 1200));

  resultImages.innerHTML = '';
  currentResults = [];

  for (let i = 0; i < count; i++) {
    const stubUrl = makeStub(prompt, i + 1, count);
    const id = addToGallery(stubUrl, prompt, selectedModel);
    currentResults.push({ id, url: stubUrl, prompt, model: selectedModel });

    const img = document.createElement('img');
    img.src = stubUrl;
    img.alt = `Результат ${i + 1}`;
    resultImages.appendChild(img);
  }

  resultEmpty.classList.add('hidden');
  resultContent.classList.remove('hidden');

  resultMeta.innerHTML = `
    <b>${MODELS[selectedModel].name}</b> • ${ratioSelect.value} • сгенерировано: <b>${count}</b><br>
    <span style="opacity:0.7">Входных изображений: ${attachedImages.length}</span>
  `;

  generateBtn.disabled = false;
  generateBtn.textContent = '✨ Сгенерировать';
});

// Заглушка — цветной квадрат
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
            text-anchor="middle" dominant-baseline="middle" font-weight="bold">
        ${escapeHtml(label)}
      </text>
      <text x="300" y="325" fill="white" font-size="14" font-family="sans-serif"
            text-anchor="middle" dominant-baseline="middle" opacity="0.85">
        ${escapeHtml(prompt.slice(0, 40))}
      </text>
    </svg>
  `;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ===== 10. ДЕЙСТВИЯ С РЕЗУЛЬТАТОМ =====
downloadCurrent.addEventListener('click', () => {
  if (currentResults.length === 0) return;

  currentResults.forEach((res, i) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = res.url;
      a.download = `aurora_${res.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, i * 150);
  });
});

clearResult.addEventListener('click', () => {
  currentResults = [];
  resultImages.innerHTML = '';
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
