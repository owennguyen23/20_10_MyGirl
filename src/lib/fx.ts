import { ParticleFX, type BurstOptions } from './smoke';

let instance: ParticleFX | null = null;

export function initFX(canvas: HTMLCanvasElement): ParticleFX {
  instance = new ParticleFX(canvas);
  return instance;
}

export function disposeFX() {
  instance?.dispose();
  instance = null;
}

export function fxBurst(x: number, y: number, opts?: BurstOptions) {
  instance?.burst(x, y, opts);
}

export function fxConfetti(opts?: BurstOptions) {
  instance?.confetti(opts);
}

export function fxResize() {
  instance?.resize();
}

export const smokeColors = [0xffffff, 0xdcfce7, 0xd1fae5, 0xbbf7d0];
