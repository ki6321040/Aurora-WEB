// ===== 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ =====
const promptInput     = document.getElementById('prompt');
const imageInput      = document.getElementById('imageInput');
const fileNameEl      = document.getElementById('fileName');
const previewWrap     = document.getElementById('previewWrap');
const previewImg      = document.getElementById('preview');
const removeImage     = document.getElementById('removeImage');
const modelsBox       = document.getElementById('models');
const ratiosBox       = document.getElementById('ratios');
const generateBtn     = document.getElementById('generateBtn');
const resultBox       = document.getElementById('result');
const resultImageWrap = document.getElementById('resultImageWrap');

// ===== 2. ПЕРЕМЕННЫЕ СОСТОЯНИЯ =====
let selectedModel = 'nano-banana-2';   // выбранная модель
let selectedRatio = '1:1';             // выбранное соотношение
let attachedImage = null;              // объект File или null

// ===== 3. ВЫБОР МОДЕЛИ =====
modelsBox.addEventListener('click', (e) => {
  const btn = e.target.closest('.model-btn');
  if (!btn) return;

  document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  selectedModel = btn.dataset.model;
});

// ===== 4. ВЫБОР СООТНОШЕНИЯ СТОРОН =====
ratiosBox.addEventListener('click', (e) => {
  const btn = e.target.closest('.ratio-btn');
  if (!btn) return;

  document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  selectedRatio = btn.dataset.ratio;
});

// ===== 5. ЗАГРУЗКА КАРТИНКИ =====
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

// ===== 6. УДАЛЕНИЕ КАРТИНКИ =====
removeImage.addEventListener('click', () => {
  attachedImage = null;
  imageInput.value = '';
  fileNameEl.textContent = 'Файл не выбран';
  previewWrap.classList.add('hidden');
  previewImg.src = '';
});

// ===== 7. КНОПКА "СГЕНЕРИРОВАТЬ" =====
generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert('Пожалуйста, введите промт');
    promptInput.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Генерация...';

  // 🔽 ЗДЕСЬ ПОЗЖЕ БУДЕТ ЗАПРОС К API
  await new Promise(resolve => setTimeout(resolve, 1500));

  resultBox.classList.remove('hidden');
  resultImageWrap.innerHTML = `
    <p style="color:#a78bfa; font-size:14px; margin-top:10px;">
      API пока не подключён.<br>
      Промт: "${escapeHtml(prompt)}"<br>
      Модель: ${selectedModel}<br>
      Соотношение: ${selectedRatio}<br>
      Картинка: ${attachedImage ? 'прикреплена' : 'нет'}
    </p>
  `;

  generateBtn.disabled = false;
  generateBtn.textContent = '✨ Сгенерировать';
});

// ===== 8. ЗАЩИТА ОТ HTML-ИНЪЕКЦИЙ =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
