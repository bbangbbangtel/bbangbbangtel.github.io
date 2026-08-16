const btn = document.querySelector('.menu-btn');
const nav = document.querySelector('.navlinks');

if (btn && nav) {
  btn.addEventListener('click', () => nav.classList.toggle('open'));

  // 모든 페이지의 공통 메뉴에 판매사례 링크 자동 추가
  if (!nav.querySelector('a[href$="cases.html"]')) {
    const caseLink = document.createElement('a');
    const inSubfolder = location.pathname.includes('/guide/') || location.pathname.includes('/gwangju/');
    caseLink.href = inSubfolder ? '../cases.html' : 'cases.html';
    caseLink.textContent = '판매사례';
    const reviewLink = nav.querySelector('a[href$="reviews.html"]');
    const ctaLink = nav.querySelector('.cta');
    nav.insertBefore(caseLink, reviewLink || ctaLink || null);
  }

  // 모든 페이지의 공통 메뉴에 고객후기 링크 자동 추가
  if (!nav.querySelector('a[href$="reviews.html"]')) {
    const reviewLink = document.createElement('a');
    const inSubfolder = location.pathname.includes('/guide/') || location.pathname.includes('/gwangju/');
    reviewLink.href = inSubfolder ? '../reviews.html' : 'reviews.html';
    reviewLink.textContent = '고객후기';
    const ctaLink = nav.querySelector('.cta');
    nav.insertBefore(reviewLink, ctaLink || null);
  }
}

document.querySelectorAll('[data-year]').forEach(
  el => el.textContent = new Date().getFullYear()
);

// 공통 사업정보 불러오기
const cfg = window.BUSINESS_CONFIG;

if (cfg) {

  // 페이지 안의 사업정보 자동 적용
  document.querySelectorAll('[data-phone]').forEach(
    el => el.textContent = cfg.phone
  );

  document.querySelectorAll('[data-address]').forEach(
    el => el.textContent = cfg.address
  );

  document.querySelectorAll('[data-store-name]').forEach(
    el => el.textContent = cfg.storeName
  );

  // 전화 / 카카오 상담 버튼
  if (!document.querySelector('.contact-float')) {

    const wrap = document.createElement('div');
    wrap.className = 'contact-float';

    wrap.innerHTML = `
      <a class="contact-phone"
         href="${cfg.phoneHref}"
         aria-label="전화 상담">

        <span>📞</span>

        <span>
          <small>상담전화</small>
          <b>${cfg.phone}</b>
        </span>

      </a>

      <a class="contact-kakao"
         href="${cfg.kakaoUrl}"
         target="_blank"
         rel="noopener"
         aria-label="카카오채널 상담">

        <span>💬</span>

        <span>
          <small>빠른상담</small>
          <b>카카오채널</b>
        </span>

      </a>
    `;

    document.body.appendChild(wrap);


    // 상담 버튼 디자인
    const style = document.createElement('style');

    style.textContent = `

      .contact-float {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 80;
        display: flex;
        gap: 10px;
      }

      .contact-float a {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 12px 15px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,.18);
        font-weight: 800;
        line-height: 1.15;
        text-decoration: none;
      }

      .contact-float small {
        display: block;
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 3px;
        opacity: .82;
      }

      .contact-phone {
        background: #1767ff;
        color: #ffffff;
      }

      .contact-kakao {
        background: #fee500;
        color: #191919;
      }

      @media (max-width: 600px) {

        body {
          padding-bottom: 70px;
        }

        .contact-float {
          left: 0;
          right: 0;
          bottom: 0;
          gap: 0;
        }

        .contact-float a {
          flex: 1;
          justify-content: center;
          border-radius: 0;
          padding: 12px 8px;
        }

        .contact-float small {
          display: none;
        }
      }

    `;

    document.head.appendChild(style);
  }
}
