(function () {
  'use strict';

  const cfg = window.BUSINESS_CONFIG || {};
  const apiUrl = cfg.reviewApiUrl || '';
  const grid = document.querySelector('[data-review-grid]');
  const form = document.querySelector('[data-review-form]');
  const statusBox = document.querySelector('[data-form-status]');
  const countEl = document.querySelector('[data-review-count]');
  const scoreEl = document.querySelector('[data-review-score]');
  let reviews = [];
  let activeCategory = '전체';

  const demoReviews = [
    {
      id: 'sample-1', name: '김○○', rating: 5, category: '휴대폰',
      product: '갤럭시 Z 폴드8', carrier: 'SKT', activationType: '기기변경',
      title: '조건을 하나씩 설명해주셔서 좋았습니다',
      content: '지원금과 선택약정 차이부터 부가서비스 유지기간까지 자세히 설명해주셔서 안심하고 개통했습니다.',
      date: '등록 예시'
    },
    {
      id: 'sample-2', name: '박○○', rating: 5, category: '인터넷+TV',
      product: '인터넷+TV 결합', carrier: 'KT', activationType: '신규가입',
      title: '가족 통신비를 함께 비교했습니다',
      content: '휴대폰만 보지 않고 가족 회선과 인터넷 결합까지 계산해주셔서 매달 나가는 비용을 줄였습니다.',
      date: '등록 예시'
    },
    {
      id: 'sample-3', name: '이○○', rating: 5, category: '선불폰',
      product: '선불폰 비대면 개통', carrier: 'LG U+', activationType: '신규가입',
      title: '처음인데도 어렵지 않게 개통했습니다',
      content: '유심 준비부터 신청 순서까지 안내를 잘해주셔서 비대면으로 빠르게 개통할 수 있었습니다.',
      date: '등록 예시'
    }
  ];

  function escapeText(value) {
    return String(value == null ? '' : value);
  }

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function renderCard(review) {
    const card = makeEl('article', 'review-card');
    const head = makeEl('div', 'review-card-head');
    const category = makeEl('span', 'badge', escapeText(review.category || '구매후기'));
    const stars = makeEl('span', 'stars', '★'.repeat(Number(review.rating) || 5));
    stars.setAttribute('aria-label', `별점 ${Number(review.rating) || 5}점`);
    head.append(category, stars);

    const title = makeEl('h3', '', escapeText(review.title || '고객 후기'));
    const content = makeEl('p', '', escapeText(review.content));
    const meta = makeEl('div', 'review-meta');
    [review.product, review.carrier, review.activationType].filter(Boolean).forEach(value => {
      meta.appendChild(makeEl('span', '', escapeText(value)));
    });
    const writer = makeEl('div', 'review-writer');
    writer.append(makeEl('span', '', escapeText(review.name || '고객')), makeEl('span', '', escapeText(review.date || '')));
    card.append(head, title, content, meta, writer);
    return card;
  }

  function render() {
    if (!grid) return;
    let filtered = activeCategory === '전체' ? reviews : reviews.filter(item => item.category === activeCategory);
    const limit = Number(grid.dataset.reviewLimit) || 0;
    if (limit) filtered = filtered.slice(0, limit);
    grid.replaceChildren();
    if (!filtered.length) {
      grid.appendChild(makeEl('div', 'empty-state', '해당 항목의 공개된 후기가 아직 없습니다.'));
      return;
    }
    filtered.forEach(review => grid.appendChild(renderCard(review)));
    if (countEl) countEl.textContent = String(reviews.length);
    if (scoreEl && reviews.length) {
      const average = reviews.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / reviews.length;
      scoreEl.textContent = average.toFixed(1);
    }
  }

  async function loadReviews() {
    if (!apiUrl) {
      reviews = demoReviews;
      render();
      return;
    }
    try {
      const response = await fetch(`${apiUrl}?action=list&_=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (!data.ok) throw new Error(data.message || '후기를 불러오지 못했습니다.');
      reviews = Array.isArray(data.reviews) ? data.reviews : [];
      render();
    } catch (error) {
      reviews = [];
      render();
      if (grid) grid.replaceChildren(makeEl('div', 'empty-state', '후기를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 확인해 주세요.'));
    }
  }

  document.querySelectorAll('[data-review-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-review-filter]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      activeCategory = button.dataset.reviewFilter;
      render();
    });
  });

  function showStatus(message, type) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = `form-status show ${type}`;
  }

  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!apiUrl) {
        showStatus('후기 접수 기능을 연결하는 중입니다. 지금은 전화 또는 카카오채널로 후기를 남겨주세요.', 'error');
        return;
      }
      const submitButton = form.querySelector('[type="submit"]');
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.action = 'submit';
      submitButton.disabled = true;
      submitButton.textContent = '접수 중...';
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.ok) throw new Error(data.message || '접수하지 못했습니다.');
        form.reset();
        showStatus('후기가 접수되었습니다. 내용 확인 후 홈페이지에 공개됩니다. 감사합니다.', 'success');
      } catch (error) {
        showStatus(error.message || '접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = '후기 접수하기';
      }
    });
  }

  loadReviews();
})();
