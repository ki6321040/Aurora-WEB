(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
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

    const MAX_SEED = 4294967295;

    const DEFAULT_PROFILE = {
      name: 'Гость',
      theme: 'dark',
      notifications: true,
      autoSave: true,
      generated: 0,
      firstVisit: Date.now()
    };

    let profile = loadProfile();
    let selectedModel = 'nano-banana-2';
    let attachedImages = [];
    let currentResults = [];
    let galleryItems = [];

    function loadProfile() {
      try {
        const saved = localStorage.getItem('aurora_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          return Object.assign({}, DEFAULT_PROFILE, parsed);
        }
      } catch (e) {
        console.warn('profile load error', e);
      }
      return Object.assign({}, DEFAULT_PROFILE);
    }

    function saveProfileData() {
      try {
        localStorage.setItem('aurora_profile', JSON.stringify(profile));
      } catch (e) {
        console.warn('profile save error', e);
      }
    }

    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

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

    function applyModelSettings(modelKey) {
      const cfg = MODELS[modelKey];
      if (!cfg) return;

      if (cfg.resolutions && resolutionBlock && resolutionSelect) {
        resolutionBlock.classList.remove('hidden');
        resolutionSelect.innerHTML = cfg.resolutions
          .map(function (r) {
            return '<option value="' + r + '"' + (r === cfg.defaultResolution ? ' selected' : '') + '>' + r + '</option>';
          })
          .join('');
      } else if (resolutionBlock) {
        resolutionBlock.classList.add('hidden');
      }

      if (versionBlock) versionBlock.classList.toggle('hidden', !cfg.hasVersion);
      if (seedBlock) seedBlock.classList.toggle('hidden', !cfg.hasSeed);
      if (systemPromptBlock) systemPromptBlock.classList.toggle('hidden', !cfg.hasSystemPrompt);
      if (translateRow) translateRow.classList.toggle('hidden', !cfg.hasTranslate);
      if (webSearchRow) webSearchRow.classList.toggle('hidden', !cfg.hasWebSearch);
      if (thinkingBlock) thinkingBlock.classList.toggle('hidden', !cfg.hasThinking);

      if (attachedImages.length > cfg.maxImages) {
        attachedImages = attachedImages.slice(0, cfg.maxImages);
      }

      updateDropZone();
      renderImagePreviews();
    }

    if (modelToggle && modelDropdown) {
      modelToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        modelDropdown.classList.toggle('open');
      });
    }

    if (modelMenu) {
      modelMenu.addEventListener('click', function (e) {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        modelMenu.querySelectorAll('.dropdown-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');
        selectedModel = item.dataset.model;
        if (modelLabel) modelLabel.textContent = MODELS[selectedModel].name;
        applyModelSettings(selectedModel);
        if (modelDropdown) modelDropdown.classList.remove('open');
      });
    }

    if (numImages) {
      numImages.addEventListener('input', function () {
        if (numImagesValue) numImagesValue.textContent = numImages.value;
      });
    }

    if (seedInput) {
      seedInput.addEventListener('input', function () {
        let val = seedInput.value;
        val = val.replace(/[^0-9]/g, '');
        if (val.length > 1) val = val.replace(/^0+/, '');
        if (val !== '') {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num > MAX_SEED) val = String(MAX_SEED);
        }
        seedInput.value = val;
      });

      seedInput.addEventListener('keydown', function (e) {
        if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === ',' ||
            e.key === 'e' || e.key === 'E') {
          e.preventDefault();
        }
      });
    }

    if (randomSeedBtn) {
      randomSeedBtn.addEventListener('click', function () {
        const randomSeed = Math.floor(Math.random() * (MAX_SEED + 1));
        if (seedInput) seedInput.value = randomSeed;
        showToast('Seed: ' + randomSeed);
      });
    }

    function updateDropZone() {
      const max = MODELS[selectedModel].maxImages;
      const current = attachedImages.length;
      if (imagesCounter) imagesCounter.textContent = current + ' / ' + max;
      if (dropZoneHint) dropZoneHint.textContent = 'PNG, JPG, WEBP — максимум ' + max + ' файлов';
      if (dropZone) {
        if (current >= max) dropZone.classList.add('disabled');
        else dropZone.classList.remove('disabled');
      }
    }

    function renderImagePreviews() {
      if (!imagesPreview) return;
      imagesPreview.innerHTML = '';
      attachedImages.forEach(function (img) {
        const div = document.createElement('div');
        div.className = 'image-thumb';
        div.innerHTML = '<img src="' + img.url + '" alt="Превью">' +
          '<button class="thumb-remove" data-id="' + img.id + '" type="button">✕</button>';
        imagesPreview.appendChild(div);
      });
    }

    function addImages(files) {
      const cfg = MODELS[selectedModel];
      const max = cfg.maxImages;
      const freeSlots = max - attachedImages.length;
      if (freeSlots <= 0) {
        showToast('Максимум ' + max + ' изображений');
        return;
      }
      const filesToAdd = Array.from(files).slice(0, freeSlots);
      if (files.length > freeSlots) {
        showToast('Добавлено только ' + freeSlots + '. Лимит: ' + max);
      }
      filesToAdd.forEach(function (file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function (e) {
          attachedImages.push({
            id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            file: file,
            url: e.target.result
          });
          updateDropZone();
          renderImagePreviews();
        };
        reader.readAsDataURL(file);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('click', function () {
        if (imageInput) imageInput.click();
      });

      ['dragenter', 'dragover'].forEach(function (evt) {
        dropZone.addEventListener(evt, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(function (evt) {
        dropZone.addEventListener(evt, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove('dragover');
        });
      });

      dropZone.addEventListener('drop', function (e) {
        const files = e.dataTransfer.files;
        if (files.length) addImages(files);
      });
    }

    if (imageInput) {
      imageInput.addEventListener('change', function () {
        if (imageInput.files.length) {
          addImages(imageInput.files);
          imageInput.value = '';
        }
      });
    }

    if (imagesPreview) {
      imagesPreview.addEventListener('click', function (e) {
        const btn = e.target.closest('.thumb-remove');
        if (!btn) return;
        const id = btn.dataset.id;
        attachedImages = attachedImages.filter(function (img) { return img.id !== id; });
        updateDropZone();
        renderImagePreviews();
      });
    }

    function addToGallery(url, prompt, model) {
      const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      galleryItems.push({ id: id, url: url, prompt: prompt, model: model });
      renderGallery();
      updateGalleryCount();
      return id;
    }

    function renderGallery() {
      if (!gallery) return;
      gallery.querySelectorAll('.gallery-item').forEach(function (el) { el.remove(); });

      if (galleryItems.length === 0) {
        if (galleryEmpty) galleryEmpty.style.display = 'block';
        return;
      }
      if (galleryEmpty) galleryEmpty.style.display = 'none';

      galleryItems.forEach(function (item) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML =
          '<img src="' + item.url + '" alt="' + escapeHtml(item.prompt) + '" title="' + escapeHtml(item.prompt) + '">' +
          '<div class="gallery-actions">' +
            '<button class="gallery-btn" data-action="download" data-id="' + item.id + '" title="Скачать">⬇</button>' +
            '<button class="gallery-btn delete" data-action="delete" data-id="' + item.id + '" title="Удалить">🗑</button>' +
          '</div>';
        gallery.appendChild(div);
      });
    }

    function updateGalleryCount() {
      if (galleryCount) galleryCount.textContent = galleryItems.length;
      updateProfileStats();
    }

    if (gallery) {
      gallery.addEventListener('click', function (e) {
        const btn = e.target.closest('.gallery-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        const item = galleryItems.find(function (i) { return i.id === id; });
        if (!item) return;
        if (btn.dataset.action === 'delete') {
          galleryItems = galleryItems.filter(function (i) { return i.id !== id; });
          renderGallery();
          updateGalleryCount();
        }
        if (btn.dataset.action === 'download') {
          downloadUrl(item.url, 'aurora_' + id + '.png');
        }
      });
    }

    if (clearGallery) {
      clearGallery.addEventListener('click', function () {
        if (galleryItems.length === 0) return;
        if (!confirm('Удалить все изображения из галереи?')) return;
        galleryItems = [];
        renderGallery();
        updateGalleryCount();
      });
    }

    if (generateBtn) {
      generateBtn.addEventListener('click', async function () {
        const prompt = promptInput ? promptInput.value.trim() : '';
        if (!prompt) {
          showToast('Введите промт');
          if (promptInput) promptInput.focus();
          return;
        }

        const count = parseInt(numImages.value, 10) || 1;

        let seed = seedInput ? seedInput.value.trim() : '';
        if (seed !== '') {
          const num = parseInt(seed, 10);
          if (isNaN(num) || num < 0 || num > MAX_SEED) {
            seed = '';
            if (seedInput) seedInput.value = '';
          }
        }

        generateBtn.disabled = true;
        generateBtn.textContent = '⏳ Генерация ' + count + ' изобр...';

        try {
          await new Promise(function (resolve) { setTimeout(resolve, 1200); });

          if (resultImages) resultImages.innerHTML = '';
          currentResults = [];

          for (let i = 0; i < count; i++) {
            const stubUrl = makeStub(prompt, i + 1, count);
            let id;
            if (profile.autoSave) {
              id = addToGallery(stubUrl, prompt, selectedModel);
            } else {
              id = 'tmp_' + Date.now() + '_' + i;
            }
            currentResults.push({ id: id, url: stubUrl, prompt: prompt, model: selectedModel });
            const img = document.createElement('img');
            img.src = stubUrl;
            img.alt = 'Результат ' + (i + 1);
            if (resultImages) resultImages.appendChild(img);
          }

          profile.generated += count;
          saveProfileData();
          updateProfileStats();

          if (resultEmpty) resultEmpty.classList.add('hidden');
          if (resultContent) resultContent.classList.remove('hidden');

          const seedText = seed ? ('seed: ' + seed) : 'seed: случайный';
          if (resultMeta) {
            resultMeta.innerHTML =
              '<b>' + MODELS[selectedModel].name + '</b> • ' +
              (ratioSelect ? ratioSelect.value : '') + ' • ' + seedText + '<br>' +
              '<span style="opacity:0.7">Сгенерировано: ' + count +
              ' • Входных: ' + attachedImages.length + '</span>';
          }

          if (profile.notifications) showToast('Готово! ' + count + ' изображений');
        } catch (err) {
          console.error('generation error', err);
          if (resultImages) {
            resultImages.innerHTML =
              '<div style="color:#f87171; padding:16px;">' +
              '<h3 style="margin-bottom:8px;">Ошибка</h3>' +
              '<p>' + escapeHtml(err.message || 'Что-то пошло не так.') + '</p></div>';
          }
          if (resultEmpty) resultEmpty.classList.add('hidden');
          if (resultContent) resultContent.classList.remove('hidden');
        } finally {
          generateBtn.disabled = false;
          generateBtn.textContent = '✨ Сгенерировать';
        }
      });
    }

    function makeStub(prompt, index, total) {
      const colorA = randomColor();
      const colorB = randomColor();
      const label = total > 1 ? (index + ' / ' + total) : 'Aurora';
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">' +
          '<defs><linearGradient id="g' + index + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="' + colorA + '"/>' +
            '<stop offset="100%" stop-color="' + colorB + '"/>' +
          '</linearGradient></defs>' +
          '<rect width="600" height="600" fill="url(#g' + index + ')"/>' +
          '<text x="300" y="290" fill="white" font-size="22" font-family="sans-serif" ' +
            'text-anchor="middle" dominant-baseline="middle" font-weight="bold">' +
            escapeHtml(label) + '</text>' +
          '<text x="300" y="325" fill="white" font-size="14" font-family="sans-serif" ' +
            'text-anchor="middle" dominant-baseline="middle" opacity="0.85">' +
            escapeHtml(prompt.slice(0, 40)) + '</text>' +
        '</svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    if (downloadCurrent) {
      downloadCurrent.addEventListener('click', function () {
        if (currentResults.length === 0) return;
        currentResults.forEach(function (res, i) {
          setTimeout(function () { downloadUrl(res.url, 'aurora_' + res.id + '.png'); }, i * 150);
        });
      });
    }

    if (clearResult) {
      clearResult.addEventListener('click', function () {
        currentResults = [];
        if (resultImages) resultImages.innerHTML = '';
        if (resultContent) resultContent.classList.add('hidden');
        if (resultEmpty) resultEmpty.classList.remove('hidden');
      });
    }

    if (profileBtn) {
      profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (profileMenu) profileMenu.classList.toggle('open');
      });
    }

    document.addEventListener('click', function (e) {
      if (profileWrap && !profileWrap.contains(e.target) && profileMenu) {
        profileMenu.classList.remove('open');
      }
      if (modelDropdown && !modelDropdown.contains(e.target)) {
        modelDropdown.classList.remove('open');
      }
    });

    if (profileMenu) {
      profileMenu.addEventListener('click', function (e) {
        const item = e.target.closest('.profile-menu-item');
        if (!item) return;
        const action = item.dataset.action;
        profileMenu.classList.remove('open');

        if (action === 'open-profile' || action === 'open-settings') {
          openProfileModal();
        }

        if (action === 'reset') {
          if (confirm('Сбросить все данные? Имя, настройки и статистика вернутся к стандартным.')) {
            profile = Object.assign({}, DEFAULT_PROFILE, { firstVisit: Date.now() });
            saveProfileData();
            applyProfile();
            showToast('Данные сброшены');
          }
        }
      });
    }

    function openProfileModal() {
      if (userName) userName.value = profile.name;
      if (themeSelect) themeSelect.value = profile.theme;
      if (notificationsToggle) notificationsToggle.checked = profile.notifications;
      if (autoSaveToggle) autoSaveToggle.checked = profile.autoSave;
      updateProfileStats();
      if (profileModal) profileModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeProfileModal() {
      if (profileModal) profileModal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeProfileModal);

    if (profileModal) {
      profileModal.addEventListener('click', function (e) {
        if (e.target === profileModal) closeProfileModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && profileModal && !profileModal.classList.contains('hidden')) {
        closeProfileModal();
      }
    });

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', function () {
        profile.name = (userName && userName.value.trim()) || 'Гость';
        profile.theme = themeSelect ? themeSelect.value : 'dark';
        profile.notifications = notificationsToggle ? notificationsToggle.checked : true;
        profile.autoSave = autoSaveToggle ? autoSaveToggle.checked : true;
        saveProfileData();
        applyProfile();
        showToast('Профиль сохранён');
        closeProfileModal();
      });
    }

    function applyProfile() {
      const initial = (profile.name || 'Гость').charAt(0).toUpperCase();
      if (profileAvatar) profileAvatar.textContent = initial;
      if (profileAvatarMenu) profileAvatarMenu.textContent = initial;
      if (modalAvatar) modalAvatar.textContent = initial;
      if (profileNameMenu) profileNameMenu.textContent = profile.name;
      if (modalName) modalName.textContent = profile.name;

      if (profile.theme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }

    function updateProfileStats() {
      const days = Math.max(1, Math.ceil((Date.now() - profile.firstVisit) / (1000 * 60 * 60 * 24)));
      if (statGenerated) statGenerated.textContent = profile.generated;
      if (statGallery) statGallery.textContent = galleryItems.length;
      if (statDays) statDays.textContent = days;
      if (profileStatsMenu) profileStatsMenu.textContent = profile.generated + ' генераций';
    }

    let toastTimeout;
    function showToast(message) {
      if (!profile.notifications) return;
      if (!toast) return;
      toast.textContent = message;
      toast.classList.remove('hidden');
      requestAnimationFrame(function () { toast.classList.add('show'); });
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.classList.add('hidden'); }, 300);
      }, 2500);
    }

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
      div.textContent = String(str);
      return div.innerHTML;
    }

    applyProfile();
    applyModelSettings(selectedModel);
    renderGallery();
    updateGalleryCount();
    updateDropZone();
  });
})();
