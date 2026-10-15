# Ảnh bóng bay

Bỏ ảnh của bạn vào **chính thư mục này** — web sẽ tự động lấy hết, không cần sửa code.

- Định dạng: **`.jpg`** (chữ thường).
- Vite tự gom mọi file `.jpg` ở đây thành bóng bay.
- Ảnh nên là ảnh chân dung / vuông, **cạnh dài ~480px** là đủ nét cho bóng bay.

> Mẹo: thu nhỏ ảnh trước khi bỏ vào để web nhẹ hơn. Trên macOS:
>
> ```bash
> sips -s format jpeg -s formatOptions 82 -Z 480 anh-goc.jpg --out IMG_ten.jpg
> ```

## Thư mục `originals/`

Chứa các ảnh gốc (độ phân giải đầy đủ) — **không** được đưa lên web, chỉ để giữ lại bản gốc.
Vite chỉ lấy các file `.jpg` nằm trực tiếp trong thư mục này (không lấy trong `originals/`).
