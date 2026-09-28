const nav = document.getElementById('navbar');
const toggle = document.querySelector('.nav-toggle');

const syncNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
syncNav();
window.addEventListener('scroll', syncNav, { passive: true });

if (toggle) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
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
