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
    if (window.isLightboxOpen && window.isLightboxOpen()) {
      window.closeLightbox(); // 燈箱開著時，返回手勢先關閉燈箱
      history.pushState(null, '');
    } else if (mobileMenu && mobileMenu.classList.contains('open')) {
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


  /* ---- Link card: 手機按壓回饋 ---- */
  document.querySelectorAll('.proj-link-card').forEach(card => {
    card.addEventListener('touchstart', () => card.classList.add('is-pressed'), { passive: true });
    card.addEventListener('touchend',   () => card.classList.remove('is-pressed'));
    card.addEventListener('touchcancel',() => card.classList.remove('is-pressed'));
  });


  /* ---- Lightbox：專案詳情頁圖片點擊放大（參考曉山波官網） ---- */
  (function initLightbox() {
    const pageImgs = Array.from(document.querySelectorAll('.proj-detail-page .proj-img'));
    if (!pageImgs.length) return;
    const total = pageImgs.length;
    const LONG_RATIO = 1.5; // 高／寬超過這個比例就當長截圖，改成上下捲動

    document.body.insertAdjacentHTML('beforeend',
      '<div class="lightbox" role="dialog" aria-modal="true" aria-label="圖片檢視" hidden>' +
        '<button class="lightbox-close" type="button" aria-label="關閉圖片檢視"><svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20 21.9446L11.4446 30.5C11.176 30.7686 10.8518 30.9029 10.4721 30.9029C10.0926 30.9029 9.7686 30.7686 9.49999 30.5C9.23138 30.2314 9.09708 29.9074 9.09708 29.5279C9.09708 29.1482 9.23138 28.824 9.49999 28.5554L18.0554 20L9.49999 11.4446C9.23138 11.176 9.09708 10.8518 9.09708 10.4721C9.09708 10.0926 9.23138 9.7686 9.49999 9.49999C9.7686 9.23138 10.0926 9.09708 10.4721 9.09708C10.8518 9.09708 11.176 9.23138 11.4446 9.49999L20 18.0554L28.5554 9.49999C28.824 9.23138 29.1482 9.09708 29.5279 9.09708C29.9074 9.09708 30.2314 9.23138 30.5 9.49999C30.7686 9.7686 30.9029 10.0926 30.9029 10.4721C30.9029 10.8518 30.7686 11.176 30.5 11.4446L21.9446 20L30.5 28.5554C30.7686 28.824 30.9029 29.1482 30.9029 29.5279C30.9029 29.9074 30.7686 30.2314 30.5 30.5C30.2314 30.7686 29.9074 30.9029 29.5279 30.9029C29.1482 30.9029 28.824 30.7686 28.5554 30.5L20 21.9446Z"/></svg></button>' +
        '<div class="lightbox-stage"><figure class="lightbox-figure">' +
          '<img class="lightbox-img" alt="">' +
          (total > 1 ? '<p class="lightbox-count" aria-live="polite"></p>' : '') +
        '</figure></div>' +
        (total > 1 ?
          '<button class="lightbox-nav lightbox-prev" type="button" aria-label="上一張"><span class="lightbox-dot"><svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28.0417 21.3888H8.05541C7.65736 21.3888 7.32639 21.2568 7.0625 20.9929C6.79861 20.729 6.66666 20.3981 6.66666 20C6.66666 19.6019 6.79861 19.271 7.0625 19.0071C7.32639 18.7432 7.65736 18.6113 8.05541 18.6113H28.0417L19.0137 9.58333C18.736 9.30556 18.5994 8.98153 18.6042 8.61125C18.6089 8.2407 18.7501 7.91653 19.0279 7.63875C19.3057 7.37042 19.6297 7.23389 20 7.22917C20.3703 7.22445 20.6943 7.36097 20.9721 7.63875L32.3612 19.0279C32.5093 19.176 32.6135 19.3288 32.6737 19.4863C32.7337 19.6435 32.7637 19.8147 32.7637 20C32.7637 20.1853 32.7337 20.3565 32.6737 20.5138C32.6135 20.6713 32.5093 20.824 32.3612 20.9721L20.9721 32.3613C20.7037 32.6296 20.3821 32.7638 20.0071 32.7638C19.6321 32.7638 19.3057 32.6296 19.0279 32.3613C18.7501 32.0835 18.6112 31.7571 18.6112 31.3821C18.6112 31.0071 18.7501 30.6807 19.0279 30.4029L28.0417 21.3888Z" fill="currentColor"/></svg></span></button>' +
          '<button class="lightbox-nav lightbox-next" type="button" aria-label="下一張"><span class="lightbox-dot"><svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28.0417 21.3888H8.05541C7.65736 21.3888 7.32639 21.2568 7.0625 20.9929C6.79861 20.729 6.66666 20.3981 6.66666 20C6.66666 19.6019 6.79861 19.271 7.0625 19.0071C7.32639 18.7432 7.65736 18.6113 8.05541 18.6113H28.0417L19.0137 9.58333C18.736 9.30556 18.5994 8.98153 18.6042 8.61125C18.6089 8.2407 18.7501 7.91653 19.0279 7.63875C19.3057 7.37042 19.6297 7.23389 20 7.22917C20.3703 7.22445 20.6943 7.36097 20.9721 7.63875L32.3612 19.0279C32.5093 19.176 32.6135 19.3288 32.6737 19.4863C32.7337 19.6435 32.7637 19.8147 32.7637 20C32.7637 20.1853 32.7337 20.3565 32.6737 20.5138C32.6135 20.6713 32.5093 20.824 32.3612 20.9721L20.9721 32.3613C20.7037 32.6296 20.3821 32.7638 20.0071 32.7638C19.6321 32.7638 19.3057 32.6296 19.0279 32.3613C18.7501 32.0835 18.6112 31.7571 18.6112 31.3821C18.6112 31.0071 18.7501 30.6807 19.0279 30.4029L28.0417 21.3888Z" fill="currentColor"/></svg></span></button>' : '') +
      '</div>');
    const lb = document.querySelector('.lightbox');
    const fig = lb.querySelector('.lightbox-figure');
    const img = lb.querySelector('.lightbox-img');
    const countEl = lb.querySelector('.lightbox-count');
    const prevBtn = lb.querySelector('.lightbox-prev');
    const nextBtn = lb.querySelector('.lightbox-next');
    const closeBtn = lb.querySelector('.lightbox-close');
    let idx = -1, lastFocus = null;

    const srcOf = i => pageImgs[i].currentSrc || pageImgs[i].src;
    const preload = i => { if (i >= 0 && i < total) { const p = new Image(); p.src = srcOf(i); } };
    function layout() {
      const long = img.naturalWidth && img.naturalHeight / img.naturalWidth > LONG_RATIO;
      lb.classList.toggle('is-long', !!long);
      // 長截圖以「畫面寬、1000px、原圖寬」三者最小值顯示，不放大到糊掉
      img.style.setProperty('--natural-w', img.naturalWidth ? img.naturalWidth + 'px' : '100%');
    }
    function show(i) {
      idx = i;
      img.onload = layout;
      img.alt = pageImgs[i].alt;
      img.src = srcOf(i);
      if (img.complete) layout();
      if (countEl) countEl.textContent = (i + 1) + ' / ' + total;
      if (prevBtn) { prevBtn.disabled = i === 0; nextBtn.disabled = i === total - 1; }
      lb.scrollTop = 0;
      preload(i + 1); preload(i - 1);
    }
    function go(step) {
      const n = idx + step;
      if (n < 0 || n >= total || lb.hidden) return;
      fig.classList.add('is-switching');
      setTimeout(() => { show(n); fig.classList.remove('is-switching'); }, 140);
    }
    // 燈箱開著時鎖住背景頁面（html、body 都有 overflow-x: hidden，兩個都要鎖）；補上捲軸寬度避免畫面左右跳
    function lockPage(on) {
      const html = document.documentElement;
      if (on) {
        const sbw = window.innerWidth - html.clientWidth;
        html.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
        if (sbw > 0) html.style.paddingRight = sbw + 'px';
      } else {
        html.style.overflow = ''; html.style.paddingRight = ''; document.body.style.overflow = '';
      }
    }
    function open(i, viaKey) {
      lastFocus = document.activeElement;
      // 頁面上還沒載入的圖一起載，關閉時版面高度才正確
      pageImgs.forEach(im => { if (im.loading === 'lazy') im.loading = 'eager'; });
      show(i);
      lb.hidden = false;
      lb.scrollTop = 0;
      lockPage(true);
      requestAnimationFrame(() => lb.classList.add('open'));
      // 用滑鼠點開時不顯示焦點框，用鍵盤開啟才顯示
      closeBtn.focus({ preventScroll: true, focusVisible: !!viaKey });
    }
    function close() {
      if (lb.hidden) return;
      lb.classList.remove('open');
      lockPage(false);
      // 關閉後停在「最後看的那張圖」，可以接著往下看
      const target = pageImgs[idx];
      if (target) {
        const navH = window.innerWidth <= 600 ? 100 : 160;
        const y = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
        target.focus({ preventScroll: true });
      } else if (lastFocus) lastFocus.focus({ preventScroll: true });
      setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 250);
    }
    window.closeLightbox = close;
    window.isLightboxOpen = () => !lb.hidden && lb.classList.contains('open');

    pageImgs.forEach((im, i) => {
      im.setAttribute('tabindex', '0');
      im.setAttribute('role', 'button');
      im.setAttribute('aria-label', '放大檢視' + (im.alt ? '：' + im.alt : ''));
      im.addEventListener('click', () => open(i));
      im.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, true); } });
    });
    closeBtn.addEventListener('click', close);
    if (prevBtn) {
      prevBtn.addEventListener('click', e => { e.stopPropagation(); go(-1); });
      nextBtn.addEventListener('click', e => { e.stopPropagation(); go(1); });
      [prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('touchstart', () => btn.classList.add('is-pressed'), { passive: true });
        btn.addEventListener('touchend',   () => btn.classList.remove('is-pressed'));
        btn.addEventListener('touchcancel',() => btn.classList.remove('is-pressed'));
      });
    }
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'Tab') {
        // 焦點留在燈箱裡
        const f = Array.from(lb.querySelectorAll('button:not(:disabled)'));
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // 手機：點圖片以外的背景就關閉（桌機背景是左右切換區，不適用）
    lb.addEventListener('click', e => {
      if (!window.matchMedia('(max-width: 600px)').matches) return;
      if (e.target.closest('.lightbox-img, .lightbox-count, button')) return;
      close();
    });
    // 手機：左右滑動切換（上下滑留給長截圖捲動）
    let tx = 0, ty = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

});
