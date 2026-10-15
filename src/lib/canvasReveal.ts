/** Kiểm tra điểm (x, y) có nằm trong hình chữ nhật bo góc hay không. */
function insideRoundedRect(x: number, y: number, w: number, h: number, r: number): boolean {
  const rad = Math.min(r, w / 2, h / 2);
  if (rad <= 0) return true;
  const cx = Math.min(Math.max(x, rad), w - rad);
  const cy = Math.min(Math.max(y, rad), h - rad);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

/**
 * Đo tỉ lệ phần đã bị phủi của canvas overlay.
 *
 * `radiusPx` là bán kính bo góc (theo pixel thật của canvas): 4 góc bo bị khung
 * cha cắt đi nên không nhận được sự kiện chạm — phải loại khỏi mẫu, nếu không
 * người chơi không bao giờ đạt được ngưỡng.
 */
export function clearedRatio(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step = 8,
  radiusPx = 0,
): number {
  if (!width || !height) return 0;

  const { data } = ctx.getImageData(0, 0, width, height);
  let clear = 0;
  let total = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (!insideRoundedRect(x, y, width, height, radiusPx)) continue;
      total += 1;
      // coi như đã phủi khi pixel gần như trong suốt (không bắt phủi sạch tuyệt đối)
      if (data[(y * width + x) * 4 + 3] < 130) clear += 1;
    }
  }

  return total ? clear / total : 0;
}
