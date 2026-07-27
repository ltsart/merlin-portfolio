/* ============================================================
   Merlin Portfolio — main.js
   Navigation, Modal, Comments Carousel, Back to Top
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Hamburger / Mobile Menu ---- */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');

  if (hamburger && mobileMenu) {
    const openMenu  = () => { mobileMenu.classList.add('open');    hamburger.classList.add('is-open'); };
    const closeMenu = () => { mobileMenu.classList.remove('open'); hamburger.classList.remove('is-open'); };

    hamburger.addEventListener('click', openMenu);
    mobileClose?.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
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
    });
    nextBtn.addEventListener('click', () => {
      current = Math.min(maxIndex(), current + getVisible());
      updateCarousel();
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

  /* ---- Parallax: Project Hero Image ---- */
  const projHeroWrap = document.querySelector('.proj-hero-wrap');
  const projHeroImg  = document.querySelector('.proj-hero-img');
  if (projHeroWrap && projHeroImg) {
    const FACTOR = 0.20; // 20% of viewport-relative offset
    function updateProjParallax() {
      if (window.innerWidth <= 600) {
        projHeroImg.style.transform = '';
        return;
      }
      const rect   = projHeroWrap.getBoundingClientRect();
      const relY   = (rect.top + rect.height / 2) - window.innerHeight / 2;
      projHeroImg.style.transform = `translateY(${relY * FACTOR}px)`;
    }
    window.addEventListener('scroll', updateProjParallax, { passive: true });
    window.addEventListener('resize', updateProjParallax, { passive: true });
    updateProjParallax();
  }

  /* ---- Scroll Reveal ---- */
  setTimeout(() => {
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const revealObserver = new IntersectionObserver((entries) => {
        const showing = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        showing.forEach((entry, i) => {
          entry.target.style.transitionDelay = `${i * 0.08}s`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
      revealEls.forEach(el => revealObserver.observe(el));
    }
  }, 200);

  /* ---- Parallax: Hero Photo (desktop only) ---- */
  const heroPhotoWrap = document.querySelector('.hero-photo-wrap');
  if (heroPhotoWrap) {
    // factor 0.22 → 每滾動 100px 照片向下移 22px，速度比頁面慢
    // 只在桌面 (>600px) 啟用，避免手機直排時產生位移衝突
    const parallaxFactor = 0.22;
    window.addEventListener('scroll', () => {
      if (window.innerWidth > 600) {
        heroPhotoWrap.style.transform = `translateY(${window.scrollY * parallaxFactor}px)`;
      } else {
        heroPhotoWrap.style.transform = '';
      }
    }, { passive: true });
  }

});
