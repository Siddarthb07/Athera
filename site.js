const nav = document.getElementById('navbar');
const toggle = document.querySelector('.nav-toggle');

let lastY = 0;
const syncNav = () => {
  if (!nav) return;
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 8);
  const menuOpen = nav.classList.contains('is-open');
  nav.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 120);
  lastY = y;
};
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
const revealNodes = document.querySelectorAll('.offer article, .cards article, .work-card, .section-head');

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

const chapters = [...document.querySelectorAll('[data-chapter]')];
const chapterIndex = document.querySelector('[data-chapter-index]');
const chapterName = document.querySelector('[data-chapter-name]');

if (chapters.length && chapterIndex && chapterName) {
  const chapterObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    chapterIndex.textContent = visible.target.dataset.chapter;
    chapterName.textContent = visible.target.dataset.name;
  }, { threshold: [0.35, 0.6] });
  chapters.forEach((section) => chapterObserver.observe(section));
}

document.querySelectorAll('.section-head').forEach((head) => {
  const mark = head.closest('[data-chapter]');
  if (mark) head.dataset.mark = mark.dataset.chapter;
});

if (!reduceMotion) {
  document.querySelectorAll('.btn-primary, .nav-cta').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect();
      const x = (event.clientX - (box.left + box.width / 2)) * 0.28;
      const y = (event.clientY - (box.top + box.height / 2)) * 0.4;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.97)';
    });
  });
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

const systems = document.querySelectorAll('.system');
systems.forEach((item) => {
  const button = item.querySelector('button');
  if (!button) return;
  button.addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');
    systems.forEach((other) => {
      const open = willOpen && other === item;
      other.classList.toggle('is-open', open);
      const otherButton = other.querySelector('button');
      if (otherButton) otherButton.setAttribute('aria-expanded', String(open));
    });
  });
});
