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
    function $(id) { return document.getElementById(id); }
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = String(str);
      return div.innerHTML;
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

    // ---------- ПРОФИЛЬ ----------
    const DEFAULT_PROFILE = {
      name: 'Гость',
      theme: 'dark',
      notifications: true,
      autoSave: true,
      generated: 0,
      firstVisit: Date.now()
    };

    let profile = (function () {
      try {
        const saved = localStorage.getItem('aurora_profile');
        if (saved) return Object.assign({}, DEFAULT_PROFILE, JSON.parse(saved));
      } catch (e) {}
      return Object.assign({}, DEFAULT_PROFILE);
    })();

    function saveProfileData() {
      try { localStorage.setItem('aurora_profile', JSON.stringify(profile)); } catch (e) {}
    }

    function applyProfile() {
      const initial = (profile.name || 'Гость').charAt(0).toUpperCase();
      ['profileAvatarMenu', 'modalAvatar'].forEach(function (id) {
        const el = $(id); if (el) el.textContent = initial;
      });
      const pnm = $('profileNameMenu'); if (pnm) pnm.textContent = profile.name;
      const mn = $('modalName'); if (mn) mn.textContent = profile.name;
      if (profile.theme === 'light') document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');
    }

    function updateProfileStats() {
      const days = Math.max(1, Math.ceil((Date.now() - profile.firstVisit) / 86400000));
      if ($('statGenerated')) $('statGenerated').textContent = profile.generated;
      if ($('statGallery')) $('statGallery').textContent = galleryItems.length;
      if ($('statDays')) $('statDays').textContent = days;
      if ($('profileStatsMenu')) $('profileStatsMenu').textContent = profile.generated + ' генераций';
    }

    // ---------- ТОСТ ----------
    let toastTimeout;
    function showToast(message) {
      if (!profile.notifications) return;
      const toast = $('toast');
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

    // ---------- ТАБЫ (сайдбар) ----------
    document.querySelectorAll('.side-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.side-tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
        tab.classList.add('active');
        const target = $('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // ---------- SUB-TABS (внутри Изображений) ----------
    document.querySelectorAll('.sub-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.sub-tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.sub-content').forEach(function (c) { c.classList.remove('active'); });
        tab.classList.add('active');
        const target = $('sub-' + tab.dataset.sub);
        if (target) target.classList.add('active');
      });
    });

    // ---------- ГАЛЕРЕЯ (только картинки) ----------
    let galleryItems = [];

    function addToGallery(url, prompt, model) {
      const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      galleryItems.push({ id: id, url: url, prompt: prompt, model: model });
      renderGallery();
      updateGalleryCount();
      return id;
    }

    function renderGallery() {
      const gallery = $('gallery');
      if (!gallery) return;
      gallery.querySelectorAll('.gallery-item').forEach(function (el) { el.remove(); });
      const empty = $('galleryEmpty');

      if (galleryItems.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
      }
      if (empty) empty.style.display = 'none';

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
      if ($('galleryCount')) $('galleryCount').textContent = galleryItems.length;
      updateProfileStats();
    }

    document.addEventListener('click', function (e) {
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
      if (btn.dataset.action === 'download' && item.url) {
        downloadUrl(item.url, 'aurora_' + id + '.png');
      }
    });

    if ($('clearGallery')) {
      $('clearGallery').addEventListener('click', function () {
        if (galleryItems.length === 0) return;
        if (!confirm('Удалить все изображения из галереи?')) return;
        galleryItems = [];
        renderGallery();
        updateGalleryCount();
      });
    }

    // ============================================================
    // ИЗОБРАЖЕНИЯ
    // ============================================================
    const MAX_SEED = 4294967295;
    const MODELS = {
      'nano-banana-2': {
        name: 'Nano Banana 2',
        maxImages: 4,
        resolutions: ['0.5K', '1K', '2K', '4K'],
        defaultResolution: '1K',
        hasTranslate: false, hasVersion: false, hasSeed: true,
        hasSystemPrompt: false, hasWebSearch: true, hasThinking: true
      },
      'nano-banana-pro': {
        name: 'Nano Banana Pro',
        maxImages: 14,
        resolutions: ['1K', '2K', '4K'],
        defaultResolution: '2K',
        hasTranslate: true, hasVersion: false, hasSeed: false,
        hasSystemPrompt: false, hasWebSearch: false, hasThinking: false
      },
      'nano-banana-lite': {
        name: 'Nano Banana Lite',
        maxImages: 4,
        resolutions: null, defaultResolution: null,
        hasTranslate: false, hasVersion: true, hasSeed: true,
        hasSystemPrompt: true, hasWebSearch: false, hasThinking: true
      }
    };

    let selectedModel = 'nano-banana-2';
    let attachedImages = [];
    let currentResults = [];

    function applyModelSettings(modelKey) {
      const cfg = MODELS[modelKey]; if (!cfg) return;
      const resBlock = $('resolutionBlock'), resSel = $('resolutionSelect');
      if (cfg.resolutions && resBlock && resSel) {
        resBlock.classList.remove('hidden');
        resSel.innerHTML = cfg.resolutions.map(function (r) {
          return '<option value="' + r + '"' + (r === cfg.defaultResolution ? ' selected' : '') + '>' + r + '</option>';
        }).join('');
      } else if (resBlock) resBlock.classList.add('hidden');

      if ($('versionBlock')) $('versionBlock').classList.toggle('hidden', !cfg.hasVersion);
      if ($('seedBlock')) $('seedBlock').classList.toggle('hidden', !cfg.hasSeed);
      if ($('systemPromptBlock')) $('systemPromptBlock').classList.toggle('hidden', !cfg.hasSystemPrompt);
      if ($('translateRow')) $('translateRow').classList.toggle('hidden', !cfg.hasTranslate);
      if ($('webSearchRow')) $('webSearchRow').classList.toggle('hidden', !cfg.hasWebSearch);
      if ($('thinkingBlock')) $('thinkingBlock').classList.toggle('hidden', !cfg.hasThinking);

      if (attachedImages.length > cfg.maxImages) attachedImages = attachedImages.slice(0, cfg.maxImages);
      updateDropZone();
      renderImagePreviews();
    }

    if ($('modelToggle') && $('modelDropdown')) {
      $('modelToggle').addEventListener('click', function (e) {
        e.stopPropagation();
        $('modelDropdown').classList.toggle('open');
      });
    }
    if ($('modelMenu')) {
      $('modelMenu').addEventListener('click', function (e) {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        $('modelMenu').querySelectorAll('.dropdown-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');
        selectedModel = item.dataset.model;
        if ($('modelLabel')) $('modelLabel').textContent = MODELS[selectedModel].name;
        applyModelSettings(selectedModel);
        if ($('modelDropdown')) $('modelDropdown').classList.remove('open');
      });
    }

    if ($('numImages')) {
      $('numImages').addEventListener('input', function () {
        if ($('numImagesValue')) $('numImagesValue').textContent = $('numImages').value;
      });
    }

    if ($('seedInput')) {
      $('seedInput').addEventListener('input', function () {
        let val = $('seedInput').value.replace(/[^0-9]/g, '');
        if (val.length > 1) val = val.replace(/^0+/, '');
        if (val !== '') {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num > MAX_SEED) val = String(MAX_SEED);
        }
        $('seedInput').value = val;
      });
      $('seedInput').addEventListener('keydown', function (e) {
        if (['-', '+', '.', ',', 'e', 'E'].indexOf(e.key) !== -1) e.preventDefault();
      });
    }

    if ($('randomSeedBtn')) {
      $('randomSeedBtn').addEventListener('click', function () {
        const r = Math.floor(Math.random() * (MAX_SEED + 1));
        if ($('seedInput')) $('seedInput').value = r;
        showToast('Seed: ' + r);
      });
    }

    function updateDropZone() {
      const cfg = MODELS[selectedModel];
      const max = cfg.maxImages;
      const cur = attachedImages.length;
      if ($('imagesCounter')) $('imagesCounter').textContent = cur + ' / ' + max;
      if ($('dropZoneHint')) $('dropZoneHint').textContent = 'PNG, JPG, WEBP — максимум ' + max + ' файлов';
      if ($('dropZone')) {
        if (cur >= max) $('dropZone').classList.add('disabled');
        else $('dropZone').classList.remove('disabled');
      }
    }

    function renderImagePreviews() {
      const wrap = $('imagesPreview'); if (!wrap) return;
      wrap.innerHTML = '';
      attachedImages.forEach(function (img) {
        const div = document.createElement('div');
        div.className = 'image-thumb';
        div.innerHTML = '<img src="' + img.url + '" alt="Превью">' +
          '<button class="thumb-remove" data-id="' + img.id + '" type="button">✕</button>';
        wrap.appendChild(div);
      });
    }

    function addImages(files) {
      const max = MODELS[selectedModel].maxImages;
      const free = max - attachedImages.length;
      if (free <= 0) { showToast('Максимум ' + max + ' изображений'); return; }
      const list = Array.from(files).slice(0, free);
      if (files.length > free) showToast('Добавлено только ' + free + '. Лимит: ' + max);
      list.forEach(function (file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function (e) {
          attachedImages.push({
            id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            file: file, url: e.target.result
          });
          updateDropZone();
          renderImagePreviews();
        };
        reader.readAsDataURL(file);
      });
    }

    if ($('dropZone')) {
      $('dropZone').addEventListener('click', function () { if ($('imageInput')) $('imageInput').click(); });
      ['dragenter', 'dragover'].forEach(function (evt) {
        $('dropZone').addEventListener(evt, function (e) {
          e.preventDefault(); e.stopPropagation();
          $('dropZone').classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(function (evt) {
        $('dropZone').addEventListener(evt, function (e) {
          e.preventDefault(); e.stopPropagation();
          $('dropZone').classList.remove('dragover');
        });
      });
      $('dropZone').addEventListener('drop', function (e) {
        if (e.dataTransfer.files.length) addImages(e.dataTransfer.files);
      });
    }
    if ($('imageInput')) {
      $('imageInput').addEventListener('change', function () {
        if ($('imageInput').files.length) {
          addImages($('imageInput').files);
          $('imageInput').value = '';
        }
      });
    }
    if ($('imagesPreview')) {
      $('imagesPreview').addEventListener('click', function (e) {
        const btn = e.target.closest('.thumb-remove'); if (!btn) return;
        attachedImages = attachedImages.filter(function (img) { return img.id !== btn.dataset.id; });
        updateDropZone(); renderImagePreviews();
      });
    }

    if ($('generateBtn')) {
      $('generateBtn').addEventListener('click', async function () {
        const prompt = $('prompt') ? $('prompt').value.trim() : '';
        if (!prompt) { showToast('Введите промт'); if ($('prompt')) $('prompt').focus(); return; }
        const count = parseInt($('numImages').value, 10) || 1;

        $('generateBtn').disabled = true;
        $('generateBtn').textContent = '⏳ Генерация ' + count + ' изобр...';

        try {
          await new Promise(function (r) { setTimeout(r, 1200); });
          if ($('resultImages')) $('resultImages').innerHTML = '';
          currentResults = [];

          for (let i = 0; i < count; i++) {
            const url = makeStub(prompt, i + 1, count);
            let id;
            if (profile.autoSave) id = addToGallery(url, prompt, selectedModel);
            else id = 'tmp_' + Date.now() + '_' + i;
            currentResults.push({ id: id, url: url });
            const img = document.createElement('img');
            img.src = url; img.alt = 'Результат ' + (i + 1);
            if ($('resultImages')) $('resultImages').appendChild(img);
          }

          profile.generated += count;
          saveProfileData();
          updateProfileStats();

          if ($('resultEmpty')) $('resultEmpty').classList.add('hidden');
          if ($('resultContent')) $('resultContent').classList.remove('hidden');

          if ($('resultMeta')) {
            $('resultMeta').innerHTML = '<b>' + MODELS[selectedModel].name + '</b> • ' +
              ($('ratioSelect') ? $('ratioSelect').value : '') + '<br>' +
              '<span style="opacity:0.7">Сгенерировано: ' + count + '</span>';
          }

          if (profile.notifications) showToast('Готово! ' + count + ' изображений');
        } catch (err) {
          showToast('Ошибка: ' + err.message);
        } finally {
          $('generateBtn').disabled = false;
          $('generateBtn').textContent = '✨ Сгенерировать';
        }
      });
    }

    function makeStub(prompt, index, total) {
      const a = randomColor(), b = randomColor();
      const label = total > 1 ? (index + ' / ' + total) : 'Aurora';
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">' +
        '<defs><linearGradient id="g' + index + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + a + '"/><stop offset="100%" stop-color="' + b + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="600" height="600" fill="url(#g' + index + ')"/>' +
        '<text x="300" y="290" fill="white" font-size="22" font-family="sans-serif" ' +
        'text-anchor="middle" dominant-baseline="middle" font-weight="bold">' + escapeHtml(label) + '</text>' +
        '<text x="300" y="325" fill="white" font-size="14" font-family="sans-serif" ' +
        'text-anchor="middle" dominant-baseline="middle" opacity="0.85">' +
        escapeHtml(prompt.slice(0, 40)) + '</text></svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    if ($('downloadCurrent')) {
      $('downloadCurrent').addEventListener('click', function () {
        currentResults.forEach(function (r, i) {
          setTimeout(function () { downloadUrl(r.url, 'aurora_' + r.id + '.png'); }, i * 150);
        });
      });
    }
    if ($('clearResult')) {
      $('clearResult').addEventListener('click', function () {
        currentResults = [];
        if ($('resultImages')) $('resultImages').innerHTML = '';
        if ($('resultContent')) $('resultContent').classList.add('hidden');
        if ($('resultEmpty')) $('resultEmpty').classList.remove('hidden');
      });
    }

    // ============================================================
    // ЧАТ
    // ============================================================
    const CHAT_STORAGE = 'aurora_chats_v1';
    let chats = [];
    let activeChatId = null;
    let chatAttachments = [];

    function loadChats() {
      try {
        const raw = localStorage.getItem(CHAT_STORAGE);
        if (raw) chats = JSON.parse(raw);
      } catch (e) { chats = []; }
      if (!Array.isArray(chats)) chats = [];
    }
    function saveChats() {
      try { localStorage.setItem(CHAT_STORAGE, JSON.stringify(chats)); } catch (e) {}
    }
    function newChatId() { return 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); }
    function getActiveChat() { return chats.find(function (c) { return c.id === activeChatId; }) || null; }

    function renderChatList() {
      const list = $('chatList'); if (!list) return;
      list.innerHTML = '';
      if (chats.length === 0) {
        list.innerHTML = '<div class="chat-list-empty">Нет чатов</div>';
        return;
      }
      chats.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; })
        .forEach(function (chat) {
          const div = document.createElement('div');
          div.className = 'chat-list-item' + (chat.id === activeChatId ? ' active' : '');
          div.dataset.id = chat.id;
          div.innerHTML =
            '<div class="chat-list-title">' + escapeHtml(chat.title || 'Новый чат') + '</div>' +
            '<button class="chat-list-delete" data-del="' + chat.id + '" title="Удалить">✕</button>';
          list.appendChild(div);
        });
    }

    function renderChatMessages() {
      const wrap = $('chatMessages'); if (!wrap) return;
      const chat = getActiveChat();
      wrap.innerHTML = '';
      if (!chat || chat.messages.length === 0) {
        wrap.innerHTML =
          '<div class="chat-welcome">' +
            '<div class="chat-welcome-icon">✍️</div>' +
            '<h2>Чем помочь?</h2>' +
            '<p>Задайте вопрос или прикрепите фото — начнём диалог.</p>' +
          '</div>';
        return;
      }
      chat.messages.forEach(function (m) {
        const div = document.createElement('div');
        div.className = 'chat-msg ' + (m.role === 'user' ? 'user' : 'ai');
        let html = '';
        if (m.images && m.images.length) {
          html += '<div class="chat-msg-images">' +
            m.images.map(function (src) { return '<img src="' + src + '">'; }).join('') +
            '</div>';
        }
        if (m.text) html += '<div class="chat-msg-text">' + escapeHtml(m.text) + '</div>';
        div.innerHTML = html;
        wrap.appendChild(div);
      });
      wrap.scrollTop = wrap.scrollHeight;
    }

    function selectChat(id) {
      activeChatId = id;
      renderChatList();
      renderChatMessages();
    }

    if ($('chatNewBtn')) {
      $('chatNewBtn').addEventListener('click', function () {
        const chat = {
          id: newChatId(), title: 'Новый чат', messages: [],
          createdAt: Date.now(), updatedAt: Date.now()
        };
        chats.push(chat);
        saveChats();
        selectChat(chat.id);
      });
    }

    if ($('chatList')) {
      $('chatList').addEventListener('click', function (e) {
        const delBtn = e.target.closest('.chat-list-delete');
        if (delBtn) {
          const id = delBtn.dataset.del;
          chats = chats.filter(function (c) { return c.id !== id; });
          if (activeChatId === id) activeChatId = chats.length ? chats[0].id : null;
          saveChats(); renderChatList(); renderChatMessages();
          return;
        }
        const item = e.target.closest('.chat-list-item');
        if (item) selectChat(item.dataset.id);
      });
    }

    if ($('chatClearBtn')) {
      $('chatClearBtn').addEventListener('click', function () {
        const chat = getActiveChat();
        if (!chat || chat.messages.length === 0) return;
        if (!confirm('Очистить сообщения в этом чате?')) return;
        chat.messages = [];
        chat.updatedAt = Date.now();
        saveChats(); renderChatMessages();
      });
    }

    if ($('chatImageInput')) {
      $('chatImageInput').addEventListener('change', function () {
        Array.from($('chatImageInput').files).forEach(function (file) {
          if (!file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = function (e) {
            chatAttachments.push({ id: 'ca_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), url: e.target.result });
            renderChatAttachments();
          };
          reader.readAsDataURL(file);
        });
        $('chatImageInput').value = '';
      });
    }

    function renderChatAttachments() {
      const wrap = $('chatAttachments'); if (!wrap) return;
      wrap.innerHTML = '';
      chatAttachments.forEach(function (a) {
        const div = document.createElement('div');
        div.className = 'chat-attach-thumb';
        div.innerHTML = '<img src="' + a.url + '">' +
          '<button class="chat-attach-remove" data-id="' + a.id + '">✕</button>';
        wrap.appendChild(div);
      });
    }

    if ($('chatAttachments')) {
      $('chatAttachments').addEventListener('click', function (e) {
        const btn = e.target.closest('.chat-attach-remove'); if (!btn) return;
        chatAttachments = chatAttachments.filter(function (a) { return a.id !== btn.dataset.id; });
        renderChatAttachments();
      });
    }

    function sendChatMessage() {
      const input = $('chatInput'); if (!input) return;
      const text = input.value.trim();
      if (!text && chatAttachments.length === 0) return;

      let chat = getActiveChat();
      if (!chat) {
        chat = {
          id: newChatId(), title: 'Новый чат', messages: [],
          createdAt: Date.now(), updatedAt: Date.now()
        };
        chats.push(chat);
        activeChatId = chat.id;
      }

      chat.messages.push({
        role: 'user',
        text: text,
        images: chatAttachments.map(function (a) { return a.url; })
      });

      if (chat.messages.length === 1 && text) {
        chat.title = text.slice(0, 30) + (text.length > 30 ? '…' : '');
      }

      chat.updatedAt = Date.now();
      saveChats();

      input.value = '';
      chatAttachments = [];
      renderChatAttachments();
      renderChatList();
      renderChatMessages();

      setTimeout(function () {
        const modelSelect = $('chatModelSelect');
        const modelName = modelSelect && modelSelect.value
          ? modelSelect.options[modelSelect.selectedIndex].text
          : 'модель';
        const aiText = '🤖 ' + modelName + ' пока не подключена. Когда подключим API — здесь будет ответ модели на ваш запрос: «' +
          (text || '(фото)').slice(0, 80) + '»';

        chat.messages.push({ role: 'assistant', text: aiText });
        chat.updatedAt = Date.now();
        saveChats();
        renderChatList();
        renderChatMessages();

        profile.generated += 1;
        saveProfileData();
        updateProfileStats();
      }, 800);
    }

    if ($('chatSendBtn')) {
      $('chatSendBtn').addEventListener('click', sendChatMessage);
    }
    if ($('chatInput')) {
      $('chatInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage();
        }
      });
      $('chatInput').addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 160) + 'px';
      });
    }

    // ============================================================
    // ПРОФИЛЬ
    // ============================================================
    if ($('profileBtn')) {
      $('profileBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        if ($('profileMenu')) $('profileMenu').classList.toggle('open');
      });
    }
    document.addEventListener('click', function (e) {
      const wrap = $('profileWrap'), menu = $('profileMenu');
      if (wrap && menu && !wrap.contains(e.target)) menu.classList.remove('open');
      const dd = $('modelDropdown');
      if (dd && !dd.contains(e.target)) dd.classList.remove('open');
    });

    if ($('profileMenu')) {
      $('profileMenu').addEventListener('click', function (e) {
        const item = e.target.closest('.profile-menu-item'); if (!item) return;
        const action = item.dataset.action;
        $('profileMenu').classList.remove('open');

        if (action === 'open-profile' || action === 'open-settings') openProfileModal();
        if (action === 'reset') {
          if (confirm('Сбросить все данные?')) {
            profile = Object.assign({}, DEFAULT_PROFILE, { firstVisit: Date.now() });
            saveProfileData(); applyProfile(); showToast('Данные сброшены');
          }
        }
      });
    }

    function openProfileModal() {
      if ($('userName')) $('userName').value = profile.name;
      if ($('themeSelect')) $('themeSelect').value = profile.theme;
      if ($('notificationsToggle')) $('notificationsToggle').checked = profile.notifications;
      if ($('autoSaveToggle')) $('autoSaveToggle').checked = profile.autoSave;
      updateProfileStats();
      if ($('profileModal')) $('profileModal').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeProfileModal() {
      if ($('profileModal')) $('profileModal').classList.add('hidden');
      document.body.style.overflow = '';
    }
    if ($('modalClose')) $('modalClose').addEventListener('click', closeProfileModal);
    if ($('profileModal')) {
      $('profileModal').addEventListener('click', function (e) {
        if (e.target === $('profileModal')) closeProfileModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('profileModal') && !$('profileModal').classList.contains('hidden')) closeProfileModal();
    });

    if ($('saveProfileBtn')) {
      $('saveProfileBtn').addEventListener('click', function () {
        profile.name = ($('userName') && $('userName').value.trim()) || 'Гость';
        profile.theme = $('themeSelect') ? $('themeSelect').value : 'dark';
        profile.notifications = $('notificationsToggle') ? $('notificationsToggle').checked : true;
        profile.autoSave = $('autoSaveToggle') ? $('autoSaveToggle').checked : true;
        saveProfileData(); applyProfile();
        showToast('Профиль сохранён');
        closeProfileModal();
      });
    }

    // ---------- ИНИЦИАЛИЗАЦИЯ ----------
    applyProfile();
    applyModelSettings(selectedModel);
    renderGallery();
    updateGalleryCount();
    updateDropZone();

    loadChats();
    if (chats.length > 0) {
      activeChatId = chats.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; })[0].id;
    }
    renderChatList();
    renderChatMessages();
  });
})();
