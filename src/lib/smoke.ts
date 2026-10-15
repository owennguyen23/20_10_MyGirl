import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

const MAX = 2200;

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aShape;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vShape;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vShape = aShape;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vShape;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    if (vShape > 0.5) {
      // mảnh confetti hình vuông
      float d = max(abs(uv.x), abs(uv.y));
      if (d > 0.5) discard;
      float edge = smoothstep(0.5, 0.42, d);
      gl_FragColor = vec4(vColor, vAlpha * edge);
      return;
    }

    // hạt khói tròn, mềm
    float r = length(uv);
    float a = smoothstep(0.5, 0.08, r);
    gl_FragColor = vec4(vColor, vAlpha * a);
  }
`;

export interface BurstOptions {
  count?: number;
  /** màu dạng hex; nếu là mảng thì chọn ngẫu nhiên */
  colors?: number[];
  /** tốc độ bay ra (px/s) */
  speed?: number;
  /** kích thước hạt lúc sinh / lúc tan (px) */
  sizeFrom?: number;
  sizeTo?: number;
  /** thời gian sống (giây) */
  life?: number;
  /** trọng lực (px/s^2), dương = rơi xuống */
  gravity?: number;
  /** 0 = tròn (khói), 1 = vuông (confetti) */
  shape?: number;
  /** vận tốc ban đầu hướng lên (px/s) */
  rise?: number;
}

export class ParticleFX {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(0, 1, 0, 1, -10, 10);
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private points: Points;

  private pos = new Float32Array(MAX * 3);
  private size = new Float32Array(MAX);
  private alpha = new Float32Array(MAX);
  private color = new Float32Array(MAX * 3);
  private shape = new Float32Array(MAX);

  private vel = new Float32Array(MAX * 3);
  private life = new Float32Array(MAX);
  private maxLife = new Float32Array(MAX);
  private sizeFrom = new Float32Array(MAX);
  private sizeTo = new Float32Array(MAX);
  private alphaFrom = new Float32Array(MAX);
  private grav = new Float32Array(MAX);
  private drag = new Float32Array(MAX);

  private cursor = 0;
  private activeCount = 0;
  private raf = 0;
  private lastTime = 0;
  private width = 1;
  private height = 1;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearAlpha(0);

    this.geometry.setAttribute('position', new BufferAttribute(this.pos, 3));
    this.geometry.setAttribute('aSize', new BufferAttribute(this.size, 1));
    this.geometry.setAttribute('aAlpha', new BufferAttribute(this.alpha, 1));
    this.geometry.setAttribute('aColor', new BufferAttribute(this.color, 3));
    this.geometry.setAttribute('aShape', new BufferAttribute(this.shape, 1));

    this.material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: NormalBlending,
    });

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  resize() {
    if (this.disposed) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = w;
    this.height = h;

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);

    this.camera.left = 0;
    this.camera.right = w;
    this.camera.top = 0;
    this.camera.bottom = h;
    this.camera.updateProjectionMatrix();
  }

  burst(x: number, y: number, opts: BurstOptions = {}) {
    if (this.disposed) return;
    const {
      count = 90,
      colors = [0xffffff, 0xdcfce7, 0xbbf7d0],
      speed = 220,
      sizeFrom = 10,
      sizeTo = 46,
      life = 1.1,
      gravity = -30,
      shape = 0,
      rise = 60,
    } = opts;

    const tmp = new Color();

    for (let i = 0; i < count; i++) {
      const idx = this.cursor;
      this.cursor = (this.cursor + 1) % MAX;

      const angle = Math.random() * Math.PI * 2;
      const mag = speed * (0.35 + Math.random() * 0.9);

      this.pos[idx * 3] = x + (Math.random() - 0.5) * 8;
      this.pos[idx * 3 + 1] = y + (Math.random() - 0.5) * 8;
      this.pos[idx * 3 + 2] = 0;

      this.vel[idx * 3] = Math.cos(angle) * mag;
      this.vel[idx * 3 + 1] = Math.sin(angle) * mag - rise;
      this.vel[idx * 3 + 2] = 0;

      const l = life * (0.7 + Math.random() * 0.7);
      this.life[idx] = l;
      this.maxLife[idx] = l;

      const sf = sizeFrom * (0.7 + Math.random() * 0.7);
      const st = sizeTo * (0.7 + Math.random() * 0.7);
      this.sizeFrom[idx] = sf;
      this.sizeTo[idx] = st;
      this.size[idx] = sf;
      this.alphaFrom[idx] = 0.65 + Math.random() * 0.35;
      this.alpha[idx] = this.alphaFrom[idx];

      this.grav[idx] = gravity;
      this.drag[idx] = shape > 0.5 ? 0.4 : 2.4;

      tmp.setHex(colors[(Math.random() * colors.length) | 0]);
      this.color[idx * 3] = tmp.r;
      this.color[idx * 3 + 1] = tmp.g;
      this.color[idx * 3 + 2] = tmp.b;

      this.shape[idx] = shape;
      this.activeCount += 1;
    }
  }

  confetti(opts: BurstOptions = {}) {
    this.burst(0, -20, {
      count: 160,
      colors: [0x22c55e, 0xf59e0b, 0xec4899, 0x7dd3fc, 0xfcd34d, 0x15803d],
      speed: 260,
      sizeFrom: 8,
      sizeTo: 16,
      life: 3.4,
      gravity: 320,
      shape: 1,
      rise: -260,
      ...opts,
    });
  }

  private loop(time: number) {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    const dt = Math.min((time - this.lastTime) / 1000 || 0, 0.05);
    this.lastTime = time;

    if (this.activeCount <= 0) return;
    this.activeCount = 0;

    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) {
        if (this.alpha[i] !== 0) {
          this.alpha[i] = 0;
          this.geometry.attributes.aAlpha.needsUpdate = true;
        }
        continue;
      }

      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.alpha[i] = 0;
        continue;
      }

      this.activeCount += 1;
      const t = 1 - this.life[i] / this.maxLife[i];

      const damp = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i * 3] *= damp;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * damp + this.grav[i] * dt;

      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;

      this.size[i] = this.sizeFrom[i] + (this.sizeTo[i] - this.sizeFrom[i]) * t;
      // vào nhanh, tan chậm
      const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      this.alpha[i] = Math.max(0, this.alphaFrom[i] * fade);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
    this.geometry.attributes.aAlpha.needsUpdate = true;
    this.geometry.attributes.aColor.needsUpdate = true;
    this.geometry.attributes.aShape.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
