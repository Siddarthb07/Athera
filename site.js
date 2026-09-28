const nav = document.getElementById('navbar');
const toggle = document.querySelector('.nav-toggle');

const syncNav = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
if (nav) {
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });
}

if (toggle && nav) {
  toggle.addEventListener('pointerdown', () => {
    toggle.style.transform = 'scale(0.97)';
  });
  const release = () => {
    toggle.style.transform = '';
  };
  toggle.addEventListener('pointerup', release);
  toggle.addEventListener('pointercancel', release);
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealNodes = document.querySelectorAll('.offer article, .work-card, .section-head');

if (!reduceMotion && revealNodes.length) {
  revealNodes.forEach((node) => node.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });
  revealNodes.forEach((node) => observer.observe(node));
}

const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const body = [
      `Name: ${name}`,
      `Email: ${data.get('email') || ''}`,
      `Company: ${data.get('company') || '-'}`,
      `Service interest: ${data.get('service') || '-'}`,
      '',
      (data.get('message') || '').toString()
    ].join('\n');
    const subject = `Athera inquiry${name ? ` from ${name}` : ''}`;
    window.location.href = `mailto:siddarthb078@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
