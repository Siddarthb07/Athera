/* ============================================
   ATHERA — Animation Engine v3
   Full GSAP ScrollTrigger + Scroll Reveal
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // ---- Scroll-triggered Reveal Classes ----
  // Handles .reveal, .reveal-left, .reveal-right, .reveal-scale
  // These elements start with opacity:0 in CSS, we add .active on scroll to reveal them
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    revealElements.forEach((el, index) => {
      // Skip elements inside .section-header (those are handled by GSAP directly)
      if (el.closest('.section-header') && el.classList.contains('reveal')) return;
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          // Stagger based on siblings with same parent
          const parent = el.parentElement;
          const siblings = parent ? Array.from(parent.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')) : [el];
          const siblingIndex = siblings.indexOf(el);
          
          gsap.delayedCall(siblingIndex * 0.1, () => {
            el.classList.add('active');
          });
        },
        once: true
      });
    });
  }

  // ---- Loading Screen ----
  const loader = document.querySelector('.loader');
  if (loader) {
    const tl = gsap.timeline();
    tl.to('.loader-bar-inner', { width: '100%', duration: 1.2, ease: 'power2.out' })
      .to('.loader', { yPercent: -100, duration: 0.8, ease: 'power3.inOut', delay: 0.3 })
      .set('.loader', { display: 'none' })
      .add(() => {
        initHeroAnimations();
        initScrollReveal();
      });
  } else {
    initHeroAnimations();
    initScrollReveal();
  }

  // ---- Hero Entrance Animations ----
  function initHeroAnimations() {
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      // Set initial visible state so GSAP can animate FROM these values
      gsap.set('.hero-tagline', { opacity: 1 });
      gsap.set('.hero-title', { opacity: 1 });
      gsap.set('.hero-description', { opacity: 1 });
      gsap.set('.hero-cta', { opacity: 1 });

      const heroTl = gsap.timeline({ delay: 0.2 });

      heroTl
        .from('.hero-tagline', {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
        })
        .from('.hero-title .line-inner', {
          y: '110%', duration: 1, ease: 'power4.out', stagger: 0.15
        }, '-=0.4')
        .from('.hero-description', {
          y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-cta', {
          y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-gradient', {
          scale: 0.5, opacity: 0, duration: 1.5, ease: 'power2.out', stagger: 0.2
        }, '-=1');

      // Hero parallax on scroll
      gsap.to('.hero-content', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: 150,
        opacity: 0,
        ease: 'none'
      });

      gsap.to('.hero-particles', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: 80,
        ease: 'none'
      });

      gsap.to('.hero-gradient-1', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: -100,
        x: 50,
        scale: 1.3,
        ease: 'none'
      });
    }
  }

  // ---- Page Hero Animations (inner pages) ----
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    const pageHeroTl = gsap.timeline({ delay: 0.2 });
    
    pageHeroTl
      .from('.page-hero .section-subtitle', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
      })
      .from('.page-hero h1', {
        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
      }, '-=0.4')
      .from('.page-hero p', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
      }, '-=0.5');

    gsap.to('.page-hero', {
      scrollTrigger: {
        trigger: '.page-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      backgroundPositionY: '50%'
    });
  }

  // ---- Section Headers - Scroll Reveal ----
  gsap.utils.toArray('.section-header').forEach(header => {
    const subtitle = header.querySelector('.section-subtitle');
    const h2 = header.querySelector('h2');
    const desc = header.querySelector('.section-description');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none none'
      }
    });

    // Clear the CSS reveal state since GSAP handles these
    if (header.classList.contains('reveal')) {
      gsap.set(header, { opacity: 1, y: 0 });
    }

    if (subtitle) {
      tl.from(subtitle, {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
      });
    }
    if (h2) {
      tl.from(h2, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
      }, subtitle ? '-=0.3' : 0);
    }
    if (desc) {
      tl.from(desc, {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
      }, '-=0.4');
    }
  });

  // ---- Cards - Staggered Scroll Reveal ----
  gsap.utils.toArray('.card:not(.card[onclick]), .team-card, .stat-item, .portfolio-card, .contact-info-card').forEach((card, i) => {
    // Skip if element already has a reveal class (handled by CSS reveal system)
    if (card.classList.contains('reveal') || card.classList.contains('reveal-left') || card.classList.contains('reveal-right')) {
      return;
    }
    
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: (i % 5) * 0.1,
      ease: 'power3.out'
    });
  });

  // ---- Service Detail Sections - Alternating Slide In ----
  gsap.utils.toArray('.service-detail').forEach((section, i) => {
    const visual = section.querySelector('.service-detail-visual');
    const content = section.querySelector('.service-detail-content');
    const isEven = i % 2 === 1;

    // Clear CSS reveal state since GSAP handles these
    if (visual) {
      visual.classList.remove('reveal-left', 'reveal-right');
      gsap.set(visual, { opacity: 1, x: 0 });
    }
    if (content) {
      content.classList.remove('reveal-left', 'reveal-right');
      gsap.set(content, { opacity: 1, x: 0 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'top 30%',
        toggleActions: 'play none none none'
      }
    });

    if (visual) {
      tl.from(visual, {
        x: isEven ? 80 : -80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }
    if (content) {
      tl.from(content, {
        x: isEven ? -80 : 80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      }, visual ? '-=0.7' : 0);
    }

    // Feature items stagger
    const features = content?.querySelectorAll('.service-feature-item');
    if (features?.length) {
      tl.from(features, {
        x: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=0.4');
    }
  });

  // ---- About Story - Parallax Scroll ----
  gsap.utils.toArray('.about-story').forEach(story => {
    const text = story.querySelector('.about-story-text');
    const image = story.querySelector('.about-image');

    // Clear CSS reveal state since GSAP handles these
    if (text) {
      text.classList.remove('reveal-left');
      gsap.set(text, { opacity: 1, x: 0 });
    }
    if (image) {
      image.classList.remove('reveal-right');
      gsap.set(image, { opacity: 1, x: 0 });
    }

    if (text) {
      gsap.from(text, {
        scrollTrigger: {
          trigger: story,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        x: -80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }

    if (image) {
      gsap.from(image, {
        scrollTrigger: {
          trigger: story,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        x: 80,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      });

      // Image parallax
      gsap.to(image, {
        scrollTrigger: {
          trigger: story,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -40,
        ease: 'none'
      });
    }
  });

  // ---- Stats Counter Animation ----
  const counters = document.querySelectorAll('[data-counter]');
  counters.forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => animateCounter(el),
      once: true
    });
  });

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.floor(obj.val) + suffix;
      }
    });
  }

  // ---- Testimonial Auto-Scroll ----
  const testimonialTrack = document.querySelector('.testimonial-track');
  if (testimonialTrack) {
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');
    if (cards.length > 0) {
      cards.forEach(card => {
        testimonialTrack.appendChild(card.cloneNode(true));
      });

      const totalWidth = Array.from(cards).reduce((acc, card) => acc + card.offsetWidth + 32, 0);

      gsap.to(testimonialTrack, {
        x: -totalWidth,
        duration: totalWidth / 40,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
        }
      });

      testimonialTrack.addEventListener('mouseenter', () => {
        gsap.to(testimonialTrack, { timeScale: 0, duration: 0.5 });
      });
      testimonialTrack.addEventListener('mouseleave', () => {
        gsap.to(testimonialTrack, { timeScale: 1, duration: 0.5 });
      });

      // Scroll-triggered entrance
      gsap.from(testimonialTrack, {
        scrollTrigger: {
          trigger: testimonialTrack,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }

  // ---- CTA Box - Scale-in with Glow ----
  gsap.utils.toArray('.cta-box').forEach(box => {
    // Clear CSS reveal-scale since GSAP handles this
    box.classList.remove('reveal-scale');
    gsap.set(box, { opacity: 1, scale: 1 });

    gsap.from(box, {
      scrollTrigger: {
        trigger: box,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      scale: 0.9,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // ---- Footer - Staggered Reveal ----
  const footer = document.querySelector('.footer');
  if (footer) {
    gsap.from('.footer-grid > *', {
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }

  // ---- Contact Form - Slide In ----
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    gsap.from('.contact-form .form-group', {
      scrollTrigger: {
        trigger: contactForm,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out'
    });
  }

  // ---- Contact Grid Sections - Slide In ----
  const contactGrid = document.querySelector('.contact-grid');
  if (contactGrid) {
    const contactLeft = contactGrid.querySelector('.reveal-left');
    const contactRight = contactGrid.querySelector('.reveal-right');

    if (contactLeft) {
      contactLeft.classList.remove('reveal-left');
      gsap.set(contactLeft, { opacity: 1, x: 0 });
      gsap.from(contactLeft, {
        scrollTrigger: {
          trigger: contactGrid,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        x: -60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }
    if (contactRight) {
      contactRight.classList.remove('reveal-right');
      gsap.set(contactRight, { opacity: 1, x: 0 });
      gsap.from(contactRight, {
        scrollTrigger: {
          trigger: contactGrid,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        x: 60,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      });
    }
  }

  // ---- FAQ Cards ----
  gsap.utils.toArray('.card[onclick]').forEach((card, i) => {
    // Clear CSS reveal state since GSAP handles these
    card.classList.remove('reveal');
    gsap.set(card, { opacity: 1, y: 0 });

    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      delay: i * 0.08,
      ease: 'power3.out'
    });
  });

  // ---- Portfolio Filter ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          gsap.to(card, { 
            scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out',
            onStart: () => { card.style.display = ''; card.style.pointerEvents = 'auto'; }
          });
        } else {
          gsap.to(card, { 
            scale: 0.8, opacity: 0, duration: 0.3, ease: 'power3.in',
            onComplete: () => { card.style.display = 'none'; card.style.pointerEvents = 'none'; }
          });
        }
      });
    });
  });

  // ---- Portfolio Stats Counter on Hover ----
  document.querySelectorAll('.portfolio-card-stats').forEach(statsBlock => {
    gsap.from(statsBlock.querySelectorAll('.portfolio-card-stat'), {
      scrollTrigger: {
        trigger: statsBlock,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out'
    });
  });

  // ---- Timeline Scroll Animation ----
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      x: -60,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  // ---- Timeline Line Draw ----
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    // Create a visible line element to animate
    const timelineLine = document.createElement('div');
    timelineLine.style.cssText = `
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--rose-gold), var(--rose-gold-dark), transparent);
      transform-origin: top;
      transform: scaleY(0);
    `;
    timeline.appendChild(timelineLine);

    gsap.to(timelineLine, {
      scrollTrigger: {
        trigger: timeline,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 1
      },
      scaleY: 1,
      ease: 'none'
    });
  }

  // ---- Values Grid Stagger ----
  const valuesGrid = document.querySelector('.values-grid');
  if (valuesGrid) {
    const valuesCards = valuesGrid.querySelectorAll('.card');
    valuesCards.forEach(card => {
      card.classList.remove('reveal');
      gsap.set(card, { opacity: 1, y: 0 });
    });

    gsap.from(valuesCards, {
      scrollTrigger: {
        trigger: valuesGrid,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }

  // ---- Team Cards Stagger ----
  const teamGrid = document.querySelector('.team-grid');
  if (teamGrid) {
    const teamCards = teamGrid.querySelectorAll('.team-card');
    teamCards.forEach(card => {
      card.classList.remove('reveal');
      gsap.set(card, { opacity: 1, y: 0 });
    });

    gsap.from(teamCards, {
      scrollTrigger: {
        trigger: teamGrid,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }

  // ---- Portfolio Cards Stagger ----
  const portfolioGrid = document.querySelector('.portfolio-grid');
  if (portfolioGrid) {
    const pCards = portfolioGrid.querySelectorAll('.portfolio-card');
    pCards.forEach(card => {
      card.classList.remove('reveal');
      gsap.set(card, { opacity: 1, y: 0 });
    });

    gsap.from(pCards, {
      scrollTrigger: {
        trigger: portfolioGrid,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out'
    });
  }

  // ---- Portfolio Filters Reveal ----
  const portfolioFilters = document.querySelector('.portfolio-filters');
  if (portfolioFilters) {
    portfolioFilters.classList.remove('reveal');
    gsap.set(portfolioFilters, { opacity: 1, y: 0 });

    gsap.from(portfolioFilters, {
      scrollTrigger: {
        trigger: portfolioFilters,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });
  }

  // ---- Tilt Effect on Cards ----
  document.querySelectorAll('.card-tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -12;
      const rotateY = (x - 0.5) * 12;
      gsap.to(card, {
        rotateX, rotateY,
        transformPerspective: 1000,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    });
  });

  // ---- Magnetic Buttons ----
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // ---- Floating Background Orbs ----
  document.querySelectorAll('.bg-orb').forEach(orb => {
    gsap.to(orb, {
      y: 'random(-30, 30)',
      x: 'random(-20, 20)',
      duration: 'random(4, 7)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });

  // ---- Section Background Parallax ----
  gsap.utils.toArray('section').forEach(section => {
    const orbs = section.querySelectorAll('.section-orb');
    orbs.forEach(orb => {
      gsap.to(orb, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -80,
        ease: 'none'
      });
    });
  });

  // ---- Cursor Glow Effect ----
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  cursorGlow.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(183, 110, 121, 0.07), transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    will-change: transform;
  `;
  document.body.appendChild(cursorGlow);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  gsap.ticker.add(() => {
    gsap.set(cursorGlow, { left: mouseX, top: mouseY });
  });

  // ---- Contact Form Handler ----
  const formEl = document.getElementById('contactForm');
  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = formEl.querySelector('[name="name"]').value;
      const email = formEl.querySelector('[name="email"]').value;
      const company = formEl.querySelector('[name="company"]').value;
      const service = formEl.querySelector('[name="service"]')?.value || '';
      const message = formEl.querySelector('[name="message"]').value;

      const subject = encodeURIComponent(`Inquiry from ${name} - ${company}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nService Interest: ${service}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:siddarthb078@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // ---- Nav scroll ----
  const nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start: 60,
    onUpdate: (self) => {
      if (self.direction === 1 && window.scrollY > 60) {
        nav?.classList.add('scrolled');
      }
      if (window.scrollY <= 60) {
        nav?.classList.remove('scrolled');
      }
    }
  });

  // ---- Page transition links ----
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
        e.preventDefault();
        const transition = document.querySelector('.page-transition');
        if (transition) {
          gsap.to(transition, {
            scaleY: 1,
            transformOrigin: 'bottom',
            duration: 0.4,
            ease: 'power3.inOut',
            onComplete: () => { window.location.href = href; }
          });
        } else {
          window.location.href = href;
        }
      }
    });
  });

  // ---- Refresh ScrollTrigger on full load ----
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
});
