# Vườn quà 20/10 💚

Web game nhỏ để bạn gái bốc quà ngẫu nhiên nhân ngày 20/10. Có **7 túi quà** phủ một lớp, người chơi **phủi sạch lớp phủ** để mở túi và được bốc **2 lượt**.

## Luồng chơi

1. Bấm "Bắt đầu bốc quà" → **2 phần quà giá trị nhất** (iPhone 18 Pro Max, iMac 24" xanh lá) hiện ra trong ~2 giây; 5 túi còn lại không hiện nội dung.
2. Lớp phủ che các túi lại, các túi trộn qua lại (rút thẻ này, chuyển sang vị trí kia) trong ~4.4 giây.
3. Khói dày bốc lên ở cả 7 túi và đổi chỗ lần cuối **rất nhanh** (0.26s) để khó theo dõi.
4. Bong bóng hướng dẫn chỉ vào từng túi — phủi lớp phủ để mở (nội dung phía sau mờ dần, phủi xong mới rõ).
5. **Chọn túi lượt 1:** chạm lần đầu chỉ là *chọn* (chưa cạo được) và bắt đầu **đếm ngược 10 giây**.
   - Vẽ/cạo tiếp đúng túi đó → chốt túi, đồng hồ tắt.
   - Chạm sang túi khác → túi cũ trả về nguyên trạng (phủi lại từ đầu), túi mới thành lượt 1, đồng hồ tắt.
   - Hết 10 giây → tự chốt túi đang chọn.
6. Phủi đủ 95% thì túi mở. **Chưa phủi xong túi đang chọn thì không sang túi khác được** (sẽ nhắc "Em phải cạo xong cái túi qua kia đã nhá"). Sau 2 lượt: chỉ mở thêm đúng **2 túi chứa món giá trị nhất** để "chỉ chỗ" (hiện thẳng, không hiệu ứng). 3 túi còn lại vẫn úp.

## Chạy dự án

```bash
npm install          # cài dependencies
npm run dev          # chạy dev server (http://localhost:5173)
npm run build        # build ra dist/
npm run preview      # xem thử bản build
npm run typecheck    # kiểm tra TypeScript
```

> Nếu môi trường có `NODE_ENV=production`, cần cài kèm dev deps: `npm install --include=dev`.

## Thêm ảnh

- **Ảnh quà**: bỏ `imac.png` và `iphone.png` vào `public/images/` (`public/images/README.md`).
- **Ảnh bóng bay**: bỏ ảnh `.jpg` vào `src/assets/anhBongBay/` — web tự gom hết thành bóng bay, xen kẽ dáng bóng bay và hình trái tim (`src/assets/anhBongBay/README.md`).

## Kịch bản (đã dàn dựng)

Kết quả được gán theo **thứ tự chọn** để luôn khớp kịch bản:

| Lượt | Nội dung hiện ra |
| --- | --- |
| Lượt 1 | "Quà bí mật — Em sẽ được nhận vào thứ 7" |
| Lượt 2 | Vẫn hiện ảnh + tên **iPhone 18 Pro Max**; phủi tới **85%** hiện thêm dòng "không phải ở túi này =))", rõ hẳn khi túi mở ở **95%** |
| Sau 2 lượt | Mở thêm 2 túi chứa iMac 24" xanh lá + iPhone 18 Pro Max xanh lá |

Popup trêu (sửa ở `TAUNTS` trong `src/config/game.ts`):

| Thời điểm | Câu |
| --- | --- |
| Chạm túi lượt 1 | "Em có chắc chọn cái này không =)))" |
| Đổi sang túi khác trong 10s | "Em đổi thật ạ =)))" |
| Chưa phủi xong đã nhảy sang túi khác | "Em phải cạo xong cái túi qua kia đã nhá" |
| Mở xong túi lượt 1 (không đổi) | "Đấy anh bảo rồi nhá =)))" |
| Mở xong túi lượt 1 (có đổi) | "Có khi em không đổi thì trúng số rồi nhá =)))" |
| Bắt đầu phủi lượt 2 (không đổi) | "Em chắc chắn rồi đúng không ạ =))), lần 1 anh đã nhắc rồi đấy nhá" |
| Bắt đầu phủi lượt 2 (có đổi) | "Anh không gợi ý nữa nhá :>" |
| Mở xong túi lượt 2 | "Hí hí" |

## Sửa nội dung / thời gian

Mở `src/config/game.ts`:

- `ITEMS` — tên & đường dẫn ảnh 2 món giá trị.
- `REVEAL_ITEMS` — 2 món được mở để "chỉ chỗ" sau khi bốc xong.
- `TOTAL_BAGS` — tổng số túi (mặc định 7).
- `REVEAL_SCRIPT` — chữ hiện ra ở lượt 1, lượt 2.
- `COVER_HINT` — câu trong bong bóng hướng dẫn.
- `TIMINGS` — `peekMs` (phơi quà), `gentleMs` (trộn qua lại), `mixMs` (khói + trộn ngầm, càng nhỏ càng khó theo dõi), `revealThreshold` (% phủi để túi tự mở).

## Công nghệ

Vite · React 19 · TypeScript · Tailwind CSS v4 · GSAP (trộn & đổi chỗ túi) · Three.js (hạt khói & confetti) · Canvas 2D (phủi lớp phủ) · Zustand.

## Cấu trúc

```
src/
  config/game.ts        # nội dung & cấu hình game
  store/gameStore.ts    # state machine
  lib/                  # shuffle (GSAP), hạt (Three.js), đo % phủi, reduced-motion
  components/           # Board, GiftCard, PrizeContent, Hud, EndScreen
    Balloons.tsx        # bóng bay ảnh (tròn + trái tim)
    FarmBackground.tsx  # nền nông trại
    overlays/BrushOverlay.tsx   # lớp phủ phủi để mở
```

## Deploy

`npm run build` → kéo thư mục `dist/` lên Netlify / Vercel / GitHub Pages (đã set `base: './'` nên chạy được ở sub-path).
