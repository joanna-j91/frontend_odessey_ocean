document.addEventListener('DOMContentLoaded', () => {

  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      revealVisibleElements();
    }, 1600);
  });

  setTimeout(() => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      revealVisibleElements();
    }
  }, 3000);

  const depthFill  = document.getElementById('depth-fill');
  const depthLabel = document.getElementById('depth-label');

  function updateDepthIndicator() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct  = Math.min(scrollTop / docHeight, 1);

    if (depthFill) depthFill.style.height = (scrollPct * 100) + '%';

    const currentDepth = Math.round(scrollPct * 11000);
    if (depthLabel) depthLabel.textContent = currentDepth.toLocaleString() + 'm';
  }


  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  function revealVisibleElements() {
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('visible');
      }
    });
  }


  const creatureCards = document.querySelectorAll('.creature-card');

  creatureCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(32px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  });

  const cardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        creatureCards.forEach(card => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
        cardsObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const creaturesSection = document.getElementById('creatures-sunlight');
  if (creaturesSection) cardsObserver.observe(creaturesSection);


  const statNumbers = document.querySelectorAll('.stat-block__number[data-target]');
  let countersStarted = false;

  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(target * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        statNumbers.forEach(el => {
          animateCounter(el, parseInt(el.dataset.target, 10));
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsRow = document.getElementById('stats-twilight');
  if (statsRow) statsObserver.observe(statsRow);


  const parallaxLayers = document.querySelectorAll('.zone__bg-layer');

  function updateParallax() {
    parallaxLayers.forEach(layer => {
      const section = layer.closest('.zone');
      if (!section) return;

      const rect    = section.getBoundingClientRect();
      const sectionH = section.offsetHeight;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const progress = -(rect.top / sectionH);
      const speed    = layer.classList.contains('zone__bg-layer--2') ? 0.4 : 0.2;
      const yShift   = progress * sectionH * speed;

      layer.style.transform = `translateY(${yShift}px)`;
    });
  }


  const zoneTitles = document.querySelectorAll('.zone__title');

  function updateTitleParallax() {
    zoneTitles.forEach(title => {
      const section = title.closest('.zone');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      const progress = rect.top / window.innerHeight;
      title.style.transform = `translateY(${progress * 30}px)`;
    });
  }

  const navLinks = document.querySelectorAll('.nav__links a');
  const sections = document.querySelectorAll('.zone[id]');

  function updateActiveNav() {
    let current  = '';
    const midY   = window.scrollY + window.innerHeight * 0.4;

    sections.forEach(section => {
      if (midY >= section.offsetTop && midY < section.offsetTop + section.offsetHeight) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  const nav = document.querySelector('.nav');

  function updateNav() {
    if (!nav) return;
    nav.style.background = window.scrollY > 60
      ? 'rgba(5, 13, 26, 0.95)'
      : 'rgba(5, 13, 26, 0.7)';
  }


  let lastZoneId = '';

  const zoneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.id !== lastZoneId) {
        lastZoneId = entry.target.id;
        if (depthLabel) {
          depthLabel.style.transition = 'none';
          depthLabel.style.color = '#a5f3fc';
          depthLabel.style.transform = 'scale(1.2)';
          setTimeout(() => {
            depthLabel.style.transition = 'color 0.6s ease, transform 0.6s ease';
            depthLabel.style.color = '#34d399';
            depthLabel.style.transform = 'scale(1)';
          }, 60);
        }
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => zoneObserver.observe(s));


  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateDepthIndicator();
        updateParallax();
        updateTitleParallax();
        updateActiveNav();
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateDepthIndicator();
  updateActiveNav();
  updateNav();

});