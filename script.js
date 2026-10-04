// ===== 1. НАХОДИМ ЭЛЕМЕНТЫ =====
const promptInput       = document.getElementById('prompt');
const imageInput        = document.getElementById('imageInput');
const fileNameEl        = document.getElementById('fileName');
const previewWrap       = document.getElementById('previewWrap');
const previewImg        = document.getElementById('preview');
const removeImage       = document.getElementById('removeImage');
const modelsBox         = document.getElementById('models');
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

  // Разрешение
  if (cfg.resolutions) {
    resolutionBlock.classList.remove('hidden');
    resolutionSelect.innerHTML = cfg.resolutions
      .map(r => `<option value="${r}" ${r === cfg.defaultResolution ? 'selected' : ''}>${r}</option>`)
      .join('');
  } else {
    resolutionBlock.classList.add('hidden');
  }

  // Версия v1/v2
  versionBlock.classList.toggle('hidden', !cfg.hasVersion);

  // Seed
  seedBlock.classList.toggle('hidden', !cfg.hasSeed);

  // Системный промт
  systemPromptBlock.classList.toggle('hidden', !cfg.hasSystemPrompt);

  // Перевод ввода
  translateRow.classList.toggle('hidden', !cfg.hasTranslate);

  // Веб-поиск
  webSearchRow.classList.toggle('hidden', !cfg.hasWebSearch);

  // Thinking level
  thinkingBlock.classList.toggle('hidden', !cfg.hasThinking);
}

// ===== 4. ПЕРЕКЛЮЧЕНИЕ МОДЕЛИ =====
modelsBox.addEventListener('click', (e) => {
  const btn = e.target.closest('.model-btn');
  if (!btn) return;

  document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  selectedModel = btn.dataset.model;
  applyModelSettings(selectedModel);
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

// ===== 8. ГЕНЕРАЦИЯ (заглушка) =====
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

  // Собираем все параметры для наглядности
  const params = {
    model: selectedModel,
    prompt: prompt,
    ratio: ratioSelect.value,
    resolution: MODELS[selectedModel].resolutions ? resolutionSelect.value : '—',
    version: MODELS[selectedModel].hasVersion ? versionSelect.value : '—',
    numImages: numImages.value,
    seed: MODELS[selectedModel].hasSeed ? (seedInput.value || 'случайный') : '—',
    systemPrompt: MODELS[selectedModel].hasSystemPrompt ? (systemPromptInput.value || '—') : '—',
    format: formatSelect.value,
    translate: MODELS[selectedModel].hasTranslate ? translateInput.checked : '—',
    webSearch: MODELS[selectedModel].hasWebSearch ? webSearch.checked : '—',
    thinking: MODELS[selectedModel].hasThinking ? (thinkingSelect.value || '—') : '—',
    image: attachedImage ? 'прикреплена' : 'нет'
  };

  resultBox.classList.remove('hidden');
  resultImageWrap.innerHTML = `
    <p style="color:#a78bfa; font-size:13px; margin-top:10px; text-align:left; line-height:1.6;">
      <strong>API пока не подключён.</strong><br>
      <b>Модель:</b> ${params.model}<br>
      <b>Промт:</b> ${escapeHtml(params.prompt)}<br>
      <b>Соотношение:</b> ${params.ratio}<br>
      <b>Разрешение:</b> ${params.resolution}<br>
      <b>Версия:</b> ${params.version}<br>
      <b>Картинок:</b> ${params.numImages}<br>
      <b>Seed:</b> ${params.seed}<br>
      <b>Сист. промт:</b> ${escapeHtml(String(params.systemPrompt))}<br>
      <b>Формат:</b> ${params.format}<br>
      <b>Перевод:</b> ${params.translate}<br>
      <b>Веб-поиск:</b> ${params.webSearch}<br>
      <b>Thinking:</b> ${params.thinking}<br>
      <b>Входное изображение:</b> ${params.image}
    </p>
  `;

  generateBtn.disabled = false;
  generateBtn.textContent = '✨ Сгенерировать';
});

// ===== 9. ЗАЩИТА ОТ HTML-ИНЪЕКЦИЙ =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== 10. СТАРТ =====
applyModelSettings(selectedModel);
