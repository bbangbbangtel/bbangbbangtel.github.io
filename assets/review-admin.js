(function () {
  'use strict';
  const apiUrl = (window.BUSINESS_CONFIG || {}).reviewApiUrl || '';
  const loginForm = document.querySelector('[data-admin-login]');
  const createForm = document.querySelector('[data-admin-create]');
  const workspace = document.querySelector('[data-admin-workspace]');
  const pendingList = document.querySelector('[data-pending-list]');
  const statusBox = document.querySelector('[data-admin-status]');
  let password = '';

  function status(message, type) {
    statusBox.textContent = message;
    statusBox.className = `form-status show ${type || 'success'}`;
  }

  async function request(payload) {
    if (!apiUrl) throw new Error('후기 데이터 연결 주소가 아직 설정되지 않았습니다.');
    const response = await fetch(apiUrl, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, adminPassword: password })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.message || '요청을 처리하지 못했습니다.');
    return data;
  }

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function renderPending(items) {
    pendingList.replaceChildren();
    if (!items.length) {
      pendingList.appendChild(element('div', 'empty-state', '검토 대기 중인 후기가 없습니다.'));
      return;
    }
    items.forEach(item => {
      const wrap = element('article', 'pending-item');
      wrap.append(
        element('strong', '', `${item.name} · ${item.category} · ${'★'.repeat(Number(item.rating) || 5)}`),
        element('h3', '', item.title),
        element('p', 'muted', item.content)
      );
      const actions = element('div', 'pending-actions');
      [['approve', '공개하기', 'btn primary small'], ['hide', '숨김 처리', 'btn small'], ['delete', '삭제', 'btn danger small']].forEach(([action, label, cls]) => {
        const button = element('button', cls, label);
        button.type = 'button';
        button.addEventListener('click', async () => {
          if (action === 'delete' && !confirm('이 후기를 완전히 삭제할까요?')) return;
          try { await request({ action, id: item.id }); await loadPending(); }
          catch (error) { status(error.message, 'error'); }
        });
        actions.appendChild(button);
      });
      wrap.appendChild(actions);
      pendingList.appendChild(wrap);
    });
  }

  async function loadPending() {
    const data = await request({ action: 'adminList' });
    renderPending(data.reviews || []);
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    password = new FormData(loginForm).get('adminPassword');
    try {
      await loadPending();
      loginForm.closest('.admin-panel').hidden = true;
      workspace.hidden = false;
      status('관리자 확인이 완료되었습니다.', 'success');
    } catch (error) { password = ''; status(error.message, 'error'); }
  });

  createForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = createForm.querySelector('[type="submit"]');
    const payload = Object.fromEntries(new FormData(createForm).entries());
    payload.action = 'adminCreate';
    submit.disabled = true;
    try {
      await request(payload);
      createForm.reset();
      status('대표님 후기가 바로 공개되었습니다.', 'success');
    } catch (error) { status(error.message, 'error'); }
    finally { submit.disabled = false; }
  });
})();
