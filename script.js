// ===== 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ =====
const promptInput   = document.getElementById('prompt');
const imageInput    = document.getElementById('imageInput');
const fileNameEl    = document.getElementById('fileName');
const previewWrap   = document.getElementById('previewWrap');
const previewImg    = document.getElementById('preview');
const removeImage   = document.getElementById('removeImage');
const ratiosBox     = document.getElementById('ratios');
const generateBtn   = document.getElementById('generateBtn');
const resultBox     = document.getElementById('result');
const resultImageWrap = document.getElementById('resultImageWrap');

// ===== 2. ПЕРЕМЕННЫЕ СОСТОЯНИЯ =====
let selectedRatio = '1:1';   // выбранное соотношение
let attachedImage = null;    // объект File или null

// ===== 3. ВЫБОР СООТНОШЕНИЯ СТОРОН =====
ratiosBox.addEventListener('click', (e) => {
  const btn = e.target.closest('.ratio-btn');
  if (!btn) return;

  // убираем active у всех
  document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
  // ставим active на нажатую
  btn.classList.add('active');

  selectedRatio = btn.dataset.ratio;
});

// ===== 4. ЗАГРУЗКА КАРТИНКИ =====
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  attachedImage = file;
  fileNameEl.textContent = file.name;

  // показываем превью
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewWrap.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// ===== 5. УДАЛЕНИЕ КАРТИНКИ =====
removeImage.addEventListener('click', () => {
  attachedImage = null;
  imageInput.value = '';
  fileNameEl.textContent = 'Файл не выбран';
  previewWrap.classList.add('hidden');
  previewImg.src = '';
});

// ===== 6. КНОПКА "СГЕНЕРИРОВАТЬ" =====
generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();

  // простая проверка
  if (!prompt) {
    alert('Пожалуйста, введите промт');
    promptInput.focus();
    return;
  }

  // показываем загрузку
  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Генерация...';

  // 🔽 ЗДЕСЬ ПОЗЖЕ БУДЕТ ЗАПРОС К API (Nano Banana 2 / Gen202)
  // Пока что просто имитируем задержку
  await new Promise(resolve => setTimeout(resolve, 1500));

  // показываем результат-заглушку
  resultBox.classList.remove('hidden');
  resultImageWrap.innerHTML = `
    <p style="color:#a78bfa; font-size:14px; margin-top:10px;">
      API пока не подключён.<br>
      Промт: "${escapeHtml(prompt)}"<br>
      Соотношение: ${selectedRatio}<br>
      Картинка: ${attachedImage ? 'прикреплена' : 'нет'}
    </p>
  `;

  // возвращаем кнопку в исходное состояние
  generateBtn.disabled = false;
  generateBtn.textContent = '✨ Сгенерировать';
});

// ===== 7. ЗАЩИТА ОТ HTML-ИНЪЕКЦИЙ =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
