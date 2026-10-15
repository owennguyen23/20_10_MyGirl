const modules = import.meta.glob('../assets/anhBongBay/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Danh sách ảnh bóng bay (tự động gom mọi file .jpg trong src/assets/anhBongBay). */
export const balloonImages: string[] = Object.values(modules).sort();
