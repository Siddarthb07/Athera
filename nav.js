/* ============================================
   ATHERA — Navigation Controller
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // --- Scroll behaviour: add .scrolled class ---
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // --- Mobile toggle ---
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Active page highlighting ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Magnetic hover effect on nav CTA ---
  const ctaBtn = document.querySelector('.nav-cta .btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', (e) => {
      const rect = ctaBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ctaBtn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    ctaBtn.addEventListener('mouseleave', () => {
      ctaBtn.style.transform = '';
    });
  }

  // --- Page transition on link click ---
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
        e.preventDefault();
        const transition = document.querySelector('.page-transition');
        if (transition) {
          transition.style.transformOrigin = 'bottom';
          transition.style.transform = 'scaleY(1)';
          setTimeout(() => {
            window.location.href = href;
          }, 400);
        } else {
          window.location.href = href;
        }
      }
    });
  });
});
