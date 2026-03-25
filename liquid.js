import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js'

const canvas = document.getElementById('liquid-canvas')
if (!canvas) throw new Error('no canvas')

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0)

const scene  = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

const mouse = new THREE.Vector2(0.5, 0.5)
const target = new THREE.Vector2(0.5, 0.5)

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect()
  mouse.x = (e.clientX - r.left) / r.width
  mouse.y = 1 - (e.clientY - r.top)  / r.height
})

window.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect()
  mouse.x = (e.clientX - r.left) / r.width
  mouse.y = 1 - (e.clientY - r.top)  / r.height
})

const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const frag = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uResolution;

  vec3 oceanColor(float depth) {
    vec3 surface = vec3(0.05, 0.42, 0.65);
    vec3 deep    = vec3(0.01, 0.18, 0.38);
    return mix(deep, surface, depth);
  }

  float wave(vec2 uv, float t) {
    float w  = sin(uv.x * 6.0 + t * 1.2) * 0.5 + 0.5;
        w += sin(uv.x * 12.0 - t * 0.8 + uv.y * 4.0) * 0.25;
        w += sin(uv.y * 8.0  + t * 1.5) * 0.25;
    return w / 2.0;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

    target += (uMouse - target) * 0.05;
    vec2 dist = (uv - uMouse) * aspect;
    float ripple = exp(-dot(dist, dist) * 18.0)
                 * sin(length(dist) * 60.0 - uTime * 5.0)
                 * 0.018;

    uv.x += ripple;
    uv.y += ripple * 0.6;

    float w  = wave(uv, uTime);
    float w2 = wave(uv * 1.4 + vec2(0.3, 0.1), uTime * 0.7);
    float w3 = wave(uv * 0.6 + vec2(0.5, 0.4), uTime * 1.3);
    float combined = (w + w2 + w3) / 3.0;

    vec3  col    = oceanColor(combined);
    float spec   = pow(max(0.0, wave(uv + vec2(0.01), uTime) - combined + 0.02), 3.0);
    col += spec * vec3(0.5, 0.85, 1.0) * 0.6;

    float alpha = smoothstep(0.0, 0.12, vUv.y)
                * smoothstep(0.0, 0.08, 1.0 - vUv.y);

    gl_FragColor = vec4(col, alpha * 0.92);
  }
`

const uniforms = {
  uTime:       { value: 0 },
  uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
  uResolution: { value: new THREE.Vector2(1, 1) }
}

const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: false })
)
scene.add(mesh)

function resize() {
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  renderer.setSize(w, h, false)
  uniforms.uResolution.value.set(w, h)
}
resize()
window.addEventListener('resize', resize)

function tick(t) {
  requestAnimationFrame(tick)
  uniforms.uTime.value  = t * 0.001
  uniforms.uMouse.value.lerp(mouse, 0.06)
  renderer.render(scene, camera)
}
requestAnimationFrame(tick)