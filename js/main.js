/* ============================================================
   Merlin Portfolio — main.js
   Navigation, Modal, Comments Carousel, Back to Top
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Hamburger / Mobile Menu ---- */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');

  const openMenu  = () => { mobileMenu?.classList.add('open');    hamburger?.classList.add('is-open'); };
  const closeMenu = () => { mobileMenu?.classList.remove('open'); hamburger?.classList.remove('is-open'); };

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', openMenu);
    mobileClose?.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---- Prevent Android back gesture from exiting the site ---- */
  // Push a buffer entry so the first back gesture doesn't exit to blank screen.
  // For a static multi-page site, popstate only fires for same-URL pushState
  // history states (not for navigating between .html pages), so this is safe.
  history.pushState(null, '');
  window.addEventListener('popstate', function () {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu(); // 如果選單開著，返回手勢先關閉選單
    } else {
      history.pushState(null, ''); // 否則留在當前頁
    }
  });

  /* ---- Hide/Show Nav on scroll (mobile only) ---- */
  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    const backBtn = document.querySelector('.back-btn');
    let lastScrollY = window.scrollY;
    let downDelta = 0; // 累積往下的滑動距離

    function setNavHidden(hidden) {
      siteNav.classList.toggle('nav-hidden', hidden);
      backBtn?.classList.toggle('nav-hidden', hidden);
    }

    window.addEventListener('scroll', () => {
      if (window.innerWidth > 600) {
        // 桌面版：確保不殘留 nav-hidden 狀態
        setNavHidden(false);
        lastScrollY = window.scrollY;
        downDelta = 0;
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY < 80) {
        // 接近頁頂：永遠顯示
        setNavHidden(false);
        downDelta = 0;
      } else if (currentScrollY > lastScrollY) {
        // 往下滑：累積距離，超過 40px 才隱藏
        downDelta += currentScrollY - lastScrollY;
        if (downDelta > 40) {
          setNavHidden(true);
        }
      } else if (currentScrollY < lastScrollY - 4) {
        // 往上滑 → 立即顯示，重置累積
        setNavHidden(false);
        downDelta = 0;
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  /* ---- Contact Modal ---- */
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose   = document.querySelector('.modal-close');
  const contactBtns  = document.querySelectorAll('.btn-contact, .mobile-btn-contact');

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  contactBtns.forEach(btn => btn.addEventListener('click', openModal));
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---- Comments Carousel ---- */
  const track    = document.querySelector('.comments-track');
  const prevBtn  = document.querySelector('.comments-prev');
  const nextBtn  = document.querySelector('.comments-next');

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.comment-card');
    let current = 0;

    function getVisible() {
      return window.innerWidth <= 640 ? 1
           : window.innerWidth <= 900 ? 2
           : 4;
    }

    function maxIndex() {
      return Math.max(0, cards.length - getVisible());
    }

    function updateCarousel() {
      if (!cards.length) return;
      const cardW   = cards[0].offsetWidth;
      const gap     = 20;
      const offset  = current * (cardW + gap);
      track.style.transform = `translateX(-${offset}px)`;

      prevBtn.disabled = current <= 0;
      nextBtn.disabled = current >= maxIndex();
    }

    prevBtn.addEventListener('click', () => {
      current = Math.max(0, current - getVisible());
      updateCarousel();
      prevBtn.blur();
    });
    nextBtn.addEventListener('click', () => {
      current = Math.min(maxIndex(), current + getVisible());
      updateCarousel();
      nextBtn.blur();
    });

    // 手機觸控按壓視覺回饋（可靠的 touchstart/touchend 方式）
    [prevBtn, nextBtn].forEach(btn => {
      btn.addEventListener('touchstart', () => btn.classList.add('is-pressed'), { passive: true });
      btn.addEventListener('touchend',   () => btn.classList.remove('is-pressed'));
      btn.addEventListener('touchcancel',() => btn.classList.remove('is-pressed'));
    });

    // Reset on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = Math.min(current, maxIndex());
        updateCarousel();
      }, 150);
    });

    updateCarousel();
  }

  /* ---- Back to Top ---- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---- Active nav link highlight ---- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPath) link.classList.add('active');
  });

  /* ---- Page Transition: 淡出後導航 (200ms ease-out) ---- */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // 只處理頁面導航連結，跳過 anchor、外部、email、tel
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // 停止淡入動畫並改為淡出
      document.body.style.animation = 'none';
      document.body.style.transition = 'opacity 0.2s ease-out';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });

  /* ---- 詳情頁 Cover：往下捲時從目前寬度等比例擴展到畫面寬，往上捲回原狀 ----
     高度固定在原本的大小（圖片 object-fit: contain，維持完整不裁切），下方文字不會因此跳動；
     --full-w 設有上限 MAX_FULL_W，避免超寬螢幕（如三螢幕/寬螢幕顯示器）展開後兩側留白色塊過大、
     圖片相對變得很小的問題；捲動距離 0 → dist 對應進度 0 → 1，圓角同步收成直角 */
  function initProjHeroExpand(wrap) {
    if (!wrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const MAX_DIST = 480;      // 捲動多少 px 後完全展開（跟 Cover 高度取小值；原本 280 一兩下捲動就結束，感覺不出漸變）
    const MAX_FULL_W = 1600;   // 展開上限寬度（px）；超寬螢幕時不會撐到整個視窗寬
    let dist = MAX_DIST;
    let ticking = false;
    function measure() {
      wrap.classList.remove('is-expandable');
      wrap.style.removeProperty('--p');
      const rect = wrap.getBoundingClientRect();
      const cs = getComputedStyle(wrap);
      const baseW = rect.width;
      const baseH = rect.height;
      const fullW = Math.min(window.innerWidth, MAX_FULL_W);
      // 高度跟寬度同比例放大（而不是鎖固定高度），這樣圖片本身才會真的「放大」，
      // 不會因為 object-fit: contain 卡在固定高度而只有外框變寬、看不出放大效果
      // 展開到底時高度剛好等於圖片本身比例（圖片貼齊邊緣、上下不留色條）；圖片還沒載入就先用外框比例
      const im = wrap.querySelector('img');
      const ratio = (im && im.naturalWidth) ? im.naturalHeight / im.naturalWidth : baseH / baseW;
      const fullH = fullW * ratio;
      wrap.style.setProperty('--base-w', baseW + 'px');
      wrap.style.setProperty('--full-w', fullW + 'px');
      wrap.style.setProperty('--base-h', baseH + 'px');
      wrap.style.setProperty('--full-h', fullH + 'px');
      wrap.style.setProperty('--pad-x', cs.paddingLeft);
      wrap.style.setProperty('--pad-y', cs.paddingTop);
      dist = Math.min(MAX_DIST, baseH / 2);
      wrap.classList.add('is-expandable');
      update();
    }
    function update() {
      ticking = false;
      const prog = Math.min(1, Math.max(0, window.scrollY / dist));
      wrap.style.setProperty('--p', prog.toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    // 圖片若是第一次載入（尚未從快取讀到），DOMContentLoaded 當下量到的高度可能是 0，
    // 導致 Cover 被鎖成 0 高度而「消失」；等圖片真正載入完成後要再量一次
    const img = wrap.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', measure, { once: true });
  }
  initProjHeroExpand(document.querySelector('.proj-hero-wrap'));

  /* ---- Scroll Reveal ---- */
  setTimeout(() => {
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const revealObserver = new IntersectionObserver((entries) => {
        const showing = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        showing.forEach((entry, i) => {
          const el = entry.target;
          el.style.transitionDelay = `${i * 0.12}s`;
          el.classList.add('visible');
          // 進場結束後清掉 delay，避免之後的 hover 效果也被延遲
          el.addEventListener('transitionend', function clear(ev) {
            if (ev.target !== el || ev.propertyName !== 'transform') return;
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', clear);
          });
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
      revealEls.forEach(el => revealObserver.observe(el));
    }
  }, 200);

  /* ---- Parallax: Hero Photo (desktop only) ---- */
  const heroPhotoWrap = document.querySelector('.hero-photo-wrap');
  if (heroPhotoWrap) {
    // 桌面 0.22，手機 0.30（視野較小，加強效果更明顯）
    window.addEventListener('scroll', () => {
      const factor = window.innerWidth <= 600 ? 0.18 : 0.22;
      heroPhotoWrap.style.transform = `translateY(${window.scrollY * factor}px)`;
    }, { passive: true });
  }

});
