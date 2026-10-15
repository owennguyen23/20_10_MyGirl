/** Vị trí con trỏ / ngón tay gần nhất (toạ độ viewport). */
export const pointer = { x: 0, y: 0, known: false };

function update(e: PointerEvent) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.known = true;
}

/** Gắn listener toàn cục, trả về hàm gỡ. */
export function trackPointer(): () => void {
  window.addEventListener('pointermove', update, { passive: true });
  window.addEventListener('pointerdown', update, { passive: true });
  return () => {
    window.removeEventListener('pointermove', update);
    window.removeEventListener('pointerdown', update);
  };
}
