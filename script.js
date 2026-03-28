
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

  const depthFill = document.getElementById('depth-fill');
  const depthLabel = document.getElementById('depth-label');

  function updateDepthIndicator() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = Math.min(scrollTop / docHeight, 1);

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
    const design = card.querySelector('.card-design')
    const glow = card.style.getPropertyValue('--glow-color')
    card.addEventListener('mouseenter', () => {
      design.style.opacity = '1'
      design.style.filter = `drop-shadow(0 0 8px ${glow}) drop-shadow(0 0 24px ${glow})`
    })
    card.addEventListener('mouseleave', () => {
      design.style.opacity = '0'
      design.style.filter = 'none'
    })
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
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
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

      const rect = section.getBoundingClientRect();
      const sectionH = section.offsetHeight;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const progress = -(rect.top / sectionH);
      const speed = layer.classList.contains('zone__bg-layer--2') ? 0.4 : 0.2;
      const yShift = progress * sectionH * speed;

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
    let current = '';
    const midY = window.scrollY + window.innerHeight * 0.4;

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
    cursor.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .creature-card, .biolumin-canvas').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });

  const canvas = document.getElementById('deep-canvas');
  const ctx = canvas.getContext('2d');
  const orbs = [];

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
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

  const hamburger = document.getElementById('nav-hamburger');
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
    fishW = fishCanvas.width = fishCanvas.offsetWidth
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
  let fishMouseX = null
  let fishMouseY = null
  let angleTimer = 0

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
        angleTimer = 0
      }
    }

    schoolAngle += (targetAngle - schoolAngle) * 0.04

    fishes.forEach(f => {
      f.x += Math.cos(schoolAngle) * f.speed
      f.y += Math.sin(schoolAngle) * f.speed
        + Math.sin(t * 0.001 + f.offset) * 0.4

      if (f.x > fishW + 20) f.x = -20
      if (f.x < -20) f.x = fishW + 20
      if (f.y > fishH + 20) f.y = -20
      if (f.y < -20) f.y = fishH + 20

      drawFish(fctx, f.x, f.y, f.size, schoolAngle)
    })
  }
  requestAnimationFrame(animateFish)


  const sonarCanvas = document.getElementById('sonar-canvas')
  const sctx = sonarCanvas.getContext('2d')
  let sonarW, sonarH
  const pings = []

  function resizeSonar() {
    sonarW = sonarCanvas.width = sonarCanvas.offsetWidth
    sonarH = sonarCanvas.height = sonarCanvas.offsetHeight
  }
  resizeSonar()
  window.addEventListener('resize', resizeSonar)

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  document.getElementById('hadal').addEventListener('click', e => {
    const rect = sonarCanvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    pings.push({ x, y, r: 0, life: 1 })
    pings.push({ x, y, r: 0, life: 1, delay: 12 })
    pings.push({ x, y, r: 0, life: 1, delay: 24 })

    if (audioCtx.state === 'suspended') audioCtx.resume()

    const frequency = 80 + (x / sonarW) * 320
    const volume = 0.08 + (1 - y / sonarH) * 0.25

    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    const convolver = audioCtx.createConvolver()

    const bufferSize = audioCtx.sampleRate * 3
    const buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
      }
    }
    convolver.buffer = buffer

    const wetGain = audioCtx.createGain()
    wetGain.gain.value = 0.4

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.3, audioCtx.currentTime + 2)

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    gainNode.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(audioCtx.destination)

    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 2.5)
  })

  function animateSonar() {
    requestAnimationFrame(animateSonar)
    sctx.clearRect(0, 0, sonarW, sonarH)

    for (let i = pings.length - 1; i >= 0; i--) {
      const p = pings[i]
      if (p.delay > 0) { p.delay--; continue }

      p.r += 2.5
      p.life -= 0.012

      if (p.life <= 0) { pings.splice(i, 1); continue }

      sctx.beginPath()
      sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      sctx.strokeStyle = `rgba(52, 211, 153, ${p.life * 0.7})`
      sctx.lineWidth = 1.5
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
    trailCanvas.width = midnightSection.offsetWidth
    trailCanvas.height = midnightSection.offsetHeight
  }
  resizeTrail()
  window.addEventListener('resize', resizeTrail)

  window.addEventListener('mousemove', e => {
    const rect = midnightSection.getBoundingClientRect()
    const insideMidnight = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    )

    if (!insideMidnight) return

    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top

    for (let i = 0; i < 3; i++) {
      trail.push({
        x: mouseX + (Math.random() - 0.5) * 24,
        y: mouseY + (Math.random() - 0.5) * 24,
        r: 0.8 + Math.random() * 1.8,
        life: 1,
        decay: 0.025 + Math.random() * 0.025,
        hue: 170 + Math.random() * 40
      })
    }
  })

  function animateTrail() {
    requestAnimationFrame(animateTrail)
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)

    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i]
      p.life -= p.decay
      p.r *= 0.97

      if (p.life <= 0) { trail.splice(i, 1); continue }

      const grad = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
      grad.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${p.life})`)
      grad.addColorStop(0.4, `hsla(${p.hue}, 80%, 60%, ${p.life * 0.5})`)
      grad.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`)

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


const echoCanvas = document.getElementById('echo-canvas')
const ectx       = echoCanvas.getContext('2d')
const echoBtn    = document.getElementById('echo-btn')

function resizeEchoCanvas() {
  const midnight = document.getElementById('midnight')
  const rect = midnight.getBoundingClientRect()

  echoCanvas.style.top    = '0'
  echoCanvas.style.left   = '0'
  echoCanvas.width  = rect.width
  echoCanvas.height = rect.height

  echoCanvas.style.width  = rect.width + 'px'
  echoCanvas.style.height = rect.height + 'px'

  
}


resizeEchoCanvas()
window.addEventListener('resize', resizeEchoCanvas)

let echoActive   = false
let echoProgress = 0
let echoFishes   = []
let echoJellies  = []
let echoAlpha    = 0
let echoFading   = false

function spawnEchoCreatures() {
  const w = echoCanvas.width
  const h = echoCanvas.height

  echoFishes = Array.from({ length: 100 }, (_, i) => ({
    x:      Math.random() * w,
    y:      (i / 120) * h + Math.random() * (h / 120),
    speed:  0.4 + Math.random() * 0.4,
    offset: Math.random() * Math.PI * 2,
    size:   1.2 + Math.random() * 1.5,
    group:  Math.floor(Math.random() * 3)
  }))

  echoJellies = Array.from({ length: 20 }, (_, i) => ({
    x:      Math.random() * w,
    y:      (i / 20) * h + Math.random() * (h / 20),
    size:   12 + Math.random() * 14,
    speed:  0.1 + Math.random() * 0.12,
    wobble: Math.random() * Math.PI * 2,
    pulse:  Math.random() * Math.PI * 2,
    drift:  (Math.random() - 0.5) * 0.3
  }))
}

const echoGroupAngles  = [0, 0, 0]
const echoGroupTargets = [0, 0, 0]
const echoGroupTimers  = [0, 0, 0]

function drawEchoFish(ctx, x, y, size, angle, alpha) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha * 0.35
  ctx.beginPath()
  ctx.ellipse(0, 0, size * 2, size * 0.7, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(165, 243, 252, 1)'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-size * 2, 0)
  ctx.lineTo(-size * 3, -size * 0.8)
  ctx.lineTo(-size * 3,  size * 0.8)
  ctx.closePath()
  ctx.fillStyle = 'rgba(165, 243, 252, 1)'
  ctx.fill()
  ctx.restore()
}

function drawEchoJelly(ctx, x, y, size, pulseOffset, t, alpha) {
  const pulse = Math.sin(t * 0.002 + pulseOffset) * 0.18
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = alpha * 0.28

  ctx.beginPath()
  ctx.ellipse(0, 0, size, size * (0.7 + pulse), 0, Math.PI, 0)
  ctx.fillStyle = 'rgba(129, 140, 248, 1)'
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, 0, size * 0.6, size * (0.4 + pulse * 0.5), 0, Math.PI, 0)
  ctx.fillStyle = 'rgba(196, 181, 253, 0.6)'
  ctx.fill()

  for (let i = 0; i < 5; i++) {
    const tx   = (i - 2) * (size * 0.4)
    const wave = Math.sin(t * 0.003 + i * 0.8 + pulseOffset) * 4
    ctx.beginPath()
    ctx.moveTo(tx, 0)
    ctx.bezierCurveTo(tx + wave, size * 1.2, tx - wave, size * 2.2, tx + wave * 0.5, size * 3)
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.7)'
    ctx.lineWidth   = 0.8
    ctx.globalAlpha = alpha * 0.35
    ctx.stroke()
  }

  ctx.restore()
  ctx.globalAlpha = 1
}

function animateEcho(t) {

  const centerX = echoCanvas.width / 2
const centerY = echoCanvas.height / 2

  requestAnimationFrame(animateEcho)
  ectx.clearRect(0, 0, echoCanvas.width, echoCanvas.height)

  if (!echoActive && echoAlpha <= 0) return

  if (echoActive) {
    echoProgress = Math.min(echoProgress + 0.008, 1)
    echoAlpha    = Math.min(echoAlpha + 0.025, 1)

    const maxR = Math.sqrt(echoCanvas.width ** 2 + echoCanvas.height ** 2)
    const r    = echoProgress * maxR

    ectx.beginPath()
    ectx.arc(echoCanvas.width / 2, echoCanvas.height / 2, r, 0, Math.PI * 2)
    ectx.strokeStyle = `rgba(165, 243, 252, ${(1 - echoProgress) * 0.5})`
    ectx.lineWidth   = 2
    ectx.stroke()

    if (echoProgress >= 1) {
      echoActive  = false
      echoFading  = true
    }
  }

  if (echoFading) {
    echoAlpha = Math.max(echoAlpha - 0.004, 0)
    if (echoAlpha <= 0) echoFading = false
  }

  echoGroupTimers.forEach((_, i) => {
    echoGroupTimers[i]++
    if (echoGroupTimers[i] > 200) {
      echoGroupTargets[i] = (Math.random() - 0.5) * Math.PI * 0.5
      echoGroupTimers[i]  = 0
    }
    echoGroupAngles[i] += (echoGroupTargets[i] - echoGroupAngles[i]) * 0.006
  })

  echoFishes.forEach(f => {
    const angle = echoGroupAngles[f.group]
    f.x += Math.cos(angle) * f.speed
    f.y += Math.sin(angle) * f.speed + Math.sin(t * 0.001 + f.offset) * 0.3

    if (f.x > echoCanvas.width  + 20) f.x = -20
    if (f.x < -20)                    f.x = echoCanvas.width + 20
    if (f.y > echoCanvas.height + 20) f.y = -20
    if (f.y < -20)                    f.y = echoCanvas.height + 20

    drawEchoFish(ectx, f.x, f.y, f.size, angle, echoAlpha)
  })

  echoJellies.forEach(j => {
    j.y -= j.speed
    j.x += Math.sin(t * 0.001 + j.wobble) * j.drift

    if (j.y < -j.size * 4)            j.y = echoCanvas.height + j.size * 4
    if (j.x > echoCanvas.width  + 50) j.x = -50
    if (j.x < -50)                    j.x = echoCanvas.width + 50

    drawEchoJelly(ectx, j.x, j.y, j.size, j.pulse, t, echoAlpha)
  })
}
requestAnimationFrame(animateEcho)

echoBtn.addEventListener('click', () => {
  if (echoActive) return
  resizeEchoCanvas()
  spawnEchoCreatures()
  echoActive   = true
  echoFading   = false
  echoProgress = 0
  echoAlpha    = 0
  echoBtn.classList.add('pulsing')
  setTimeout(() => echoBtn.classList.remove('pulsing'), 2000)

  if (typeof audioCtx !== 'undefined') {
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const osc  = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type   = 'sine'
    osc.frequency.setValueAtTime(800, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 1.5)
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 2)
  }
})


const hintObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const hints = entry.target.querySelectorAll('.zone-hint')
      hints.forEach((hint, i) => {
        setTimeout(() => hint.classList.add('visible'), i * 150)
      })
      hintObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.3 })

document.querySelectorAll('.zone-hints').forEach(el => hintObserver.observe(el))


const fishHintObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.getElementById('fish-hint').classList.add('visible')
      fishHintObserver.disconnect()
    }
  })
}, { threshold: 0.4 })

const fishHintEl = document.getElementById('fish-hint')
if (fishHintEl) fishHintObserver.observe(document.getElementById('sunlight'))

const siphoCanvas = document.getElementById('siphonophore-canvas')
const sctxS = siphoCanvas.getContext('2d')

function resizeSipho() {
  siphoCanvas.width  = siphoCanvas.offsetWidth
  siphoCanvas.height = siphoCanvas.offsetHeight
}
resizeSipho()
window.addEventListener('resize', resizeSipho)

const siphonophores = Array.from({ length: 6 }, (_, i) => ({
  x:       -400 + i * 600,
  y:       80 + i * 120,
  speed:   0.18 + i * 0.06,
  offset:  i * 2.1,
  length:  260 + i * 60,
  nodes:   18 + i * 4,
  opacity: 0.18 + i * 0.04,
  dir:     i % 2 === 0 ? 1 : -1
}))

function drawSiphonophore(ctx, s, t) {
  const points = []
  for (let i = 0; i <= s.nodes; i++) {
    const pct  = i / s.nodes
    const px   = s.x + pct * s.length * s.dir
    const wave1 = Math.sin(t * 0.0008 + pct * 6 + s.offset) * 18
    const wave2 = Math.sin(t * 0.0005 + pct * 3 + s.offset + 1) * 10
    const py   = s.y + wave1 + wave2
    points.push({ x: px, y: py })
  }

  ctx.save()
  ctx.globalAlpha = s.opacity

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
  }
  ctx.strokeStyle = 'rgba(129, 140, 248, 1)'
  ctx.lineWidth   = 1.5
  ctx.stroke()

  points.forEach((p, i) => {
    if (i % 2 === 0) {
      const bulge = 3 + Math.sin(t * 0.001 + i * 0.5) * 1.5
      ctx.beginPath()
      ctx.arc(p.x, p.y, bulge, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(196, 181, 253, 1)'
      ctx.fill()

      const tentLen = 12 + Math.sin(t * 0.002 + i) * 6
      const tentX   = p.x + Math.sin(t * 0.001 + i * 0.8) * 4
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.bezierCurveTo(
        tentX + 4,  p.y + tentLen * 0.4,
        tentX - 4,  p.y + tentLen * 0.7,
        tentX,      p.y + tentLen
      )
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.5)'
      ctx.lineWidth   = 0.8
      ctx.stroke()
    }
  })

  ctx.restore()
  ctx.globalAlpha = 1
}

function animateSiphonophore(t) {
  requestAnimationFrame(animateSiphonophore)
  sctxS.clearRect(0, 0, siphoCanvas.width, siphoCanvas.height)

  siphonophores.forEach(s => {
    s.x += s.speed * s.dir
    if (s.dir === 1  && s.x > siphoCanvas.width  + 100) s.x = -s.length - 100
    if (s.dir === -1 && s.x < -s.length - 100)          s.x = siphoCanvas.width + 100
    drawSiphonophore(sctxS, s, t)
  })
}
requestAnimationFrame(animateSiphonophore)



});

