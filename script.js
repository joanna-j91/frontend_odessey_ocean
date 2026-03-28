
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


  const cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .creature-card, .biolumin-canvas').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });

  const canvas  = document.getElementById('deep-canvas');
  const ctx     = canvas.getContext('2d');
  const orbs    = [];
 
  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawOrbs() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach((orb, i) => {
      orb.life -= 0.008;
      orb.radius += 0.4;
      if (orb.life <= 0) { orbs.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${orb.r},${orb.g},${orb.b},${orb.life * 0.25})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${orb.r},${orb.g},${orb.b},${orb.life * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    requestAnimationFrame(drawOrbs);
  }
  drawOrbs();
 
  const biluminCanvas = document.getElementById('biolumin-canvas');
  const hint          = biluminCanvas.querySelector('.biolumin-canvas__hint');
  biluminCanvas.addEventListener('click', e => {
    if (hint) hint.style.opacity = '0';
    const rect = biluminCanvas.getBoundingClientRect();
    const colors = [
      [52,211,153], [165,243,252], [56,189,248], [167,243,208]
    ];
    for (let i = 0; i < 6; i++) {
      const [r,g,b] = colors[Math.floor(Math.random() * colors.length)];
      orbs.push({
        x: e.clientX - rect.left + (Math.random()-0.5)*40,
        y: e.clientY - rect.top  + (Math.random()-0.5)*40,
        radius: Math.random() * 8 + 4,
        life: 1,
        r, g, b
      });
  }
});

const hamburger  = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('nav-mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}

const fishCanvas = document.getElementById('fish-canvas')
const fctx = fishCanvas.getContext('2d')
let fishW, fishH

function resizeFishCanvas() {
  fishW = fishCanvas.width  = fishCanvas.offsetWidth
  fishH = fishCanvas.height = fishCanvas.offsetHeight
}
resizeFishCanvas()
window.addEventListener('resize', resizeFishCanvas)

const FISH_COUNT = 60
const fishes = Array.from({ length: FISH_COUNT }, () => ({
  x: Math.random() * 800,
  y: Math.random() * 400,
  speed: 0.8 + Math.random() * 0.6,
  offset: Math.random() * Math.PI * 2,
  size: 2 + Math.random() * 2.5
}))

let schoolAngle = 0
let targetAngle = 0
let fishMouseX  = null
let fishMouseY  = null
let angleTimer  = 0

document.getElementById('sunlight').addEventListener('mousemove', e => {
  const rect = fishCanvas.getBoundingClientRect()
  fishMouseX = e.clientX - rect.left
  fishMouseY = e.clientY - rect.top
})

document.getElementById('sunlight').addEventListener('mouseleave', () => {
  fishMouseX = null
  fishMouseY = null
})

function drawFish(ctx, x, y, size, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.ellipse(0, 0, size * 2, size * 0.8, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(186, 230, 253, 0.55)'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-size * 2, 0)
  ctx.lineTo(-size * 3.2, -size)
  ctx.lineTo(-size * 3.2, size)
  ctx.closePath()
  ctx.fillStyle = 'rgba(186, 230, 253, 0.4)'
  ctx.fill()
  ctx.restore()
}

function animateFish(t) {
  requestAnimationFrame(animateFish)
  if (!fishW) return
  fctx.clearRect(0, 0, fishW, fishH)

  if (fishMouseX !== null && fishMouseY !== null) {
  const centerX = fishW / 2
  const centerY = fishH / 2
  targetAngle = Math.atan2(fishMouseY - centerY, fishMouseX - centerX)
  } else {
  angleTimer++
  if (angleTimer > 180) {
    targetAngle = (Math.random() - 0.5) * Math.PI * 0.6
    angleTimer  = 0
  }
}

schoolAngle += (targetAngle - schoolAngle) * 0.04

  fishes.forEach(f => {
    f.x += Math.cos(schoolAngle) * f.speed
    f.y += Math.sin(schoolAngle) * f.speed
            + Math.sin(t * 0.001 + f.offset) * 0.4

    if (f.x > fishW + 20) f.x = -20
    if (f.x < -20)        f.x = fishW + 20
    if (f.y > fishH + 20) f.y = -20
    if (f.y < -20)        f.y = fishH + 20

    drawFish(fctx, f.x, f.y, f.size, schoolAngle)
  })
}
requestAnimationFrame(animateFish)


const sonarCanvas = document.getElementById('sonar-canvas')
const sctx = sonarCanvas.getContext('2d')
let sonarW, sonarH
const pings = []

function resizeSonar() {
  sonarW = sonarCanvas.width  = sonarCanvas.offsetWidth
  sonarH = sonarCanvas.height = sonarCanvas.offsetHeight
}
resizeSonar()
window.addEventListener('resize', resizeSonar)

document.getElementById('hadal').addEventListener('click', e => {
  const rect = sonarCanvas.getBoundingClientRect()
  pings.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1 })
  pings.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1, delay: 12 })
  pings.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1, delay: 24 })
})

function animateSonar() {
  requestAnimationFrame(animateSonar)
  sctx.clearRect(0, 0, sonarW, sonarH)

  for (let i = pings.length - 1; i >= 0; i--) {
    const p = pings[i]
    if (p.delay > 0) { p.delay--; continue }

    p.r    += 2.5
    p.life -= 0.012

    if (p.life <= 0) { pings.splice(i, 1); continue }

    sctx.beginPath()
    sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    sctx.strokeStyle = `rgba(52, 211, 153, ${p.life * 0.7})`
    sctx.lineWidth   = 1.5
    sctx.stroke()

    sctx.beginPath()
    sctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
    sctx.fillStyle = `rgba(52, 211, 153, ${p.life})`
    sctx.fill()
  }
}
animateSonar()

const midnightSection = document.getElementById('midnight')
const trailCanvas = document.getElementById('trail-canvas')
const tctx = trailCanvas.getContext('2d')
const trail = []
let mouseX = -999, mouseY = -999

function resizeTrail() {
  trailCanvas.width  = midnightSection.offsetWidth
  trailCanvas.height = midnightSection.offsetHeight
}
resizeTrail()
window.addEventListener('resize', resizeTrail)

window.addEventListener('mousemove', e => {
  const rect = midnightSection.getBoundingClientRect()
  const insideMidnight = (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top  &&
    e.clientY <= rect.bottom
  )

  if (!insideMidnight) return

  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top

  for (let i = 0; i < 3; i++) {
    trail.push({
      x:     mouseX + (Math.random() - 0.5) * 24,
      y:     mouseY + (Math.random() - 0.5) * 24,
      r:     0.8 + Math.random() * 1.8,
      life:  1,
      decay: 0.025 + Math.random() * 0.025,
      hue:   170 + Math.random() * 40
    })
  }
})

function animateTrail() {
  requestAnimationFrame(animateTrail)
  tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)

  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i]
    p.life -= p.decay
    p.r    *= 0.97

    if (p.life <= 0) { trail.splice(i, 1); continue }

    const grad = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
    grad.addColorStop(0,   `hsla(${p.hue}, 90%, 75%, ${p.life})`)
    grad.addColorStop(0.4, `hsla(${p.hue}, 80%, 60%, ${p.life * 0.5})`)
    grad.addColorStop(1,   `hsla(${p.hue}, 70%, 50%, 0)`)

    tctx.beginPath()
    tctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
    tctx.fillStyle = grad
    tctx.fill()

    tctx.beginPath()
    tctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2)
    tctx.fillStyle = `hsla(${p.hue}, 100%, 92%, ${p.life * 0.9})`
    tctx.fill()
  }
}
animateTrail()

});