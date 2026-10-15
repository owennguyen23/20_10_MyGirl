export type Phase = 'intro' | 'peek' | 'shuffling' | 'picking' | 'autoRevealing' | 'done';

/** Chỉ 2 món quà giá trị nhất được hiển thị. */
export type ItemId = 'imac' | 'iphone';

export interface Item {
  name: string;
  img: string;
  color: string;
}

export type CardContent =
  | { kind: 'secret'; title: string; lines: string[] }
  | {
      kind: 'tease';
      item: ItemId;
      /** tỉ lệ phủi bắt đầu hiện dòng trêu */
      showAt: number;
      /** dòng hiện thêm ngay dưới tên món */
      extraText: string;
    }
  | { kind: 'item'; item: ItemId };

export interface Card {
  id: string;
  /** vị trí hiện tại trong lưới (cập nhật sau khi trộn) */
  slot: number;
  /** món quà được "phơi" lúc đầu; null = túi không hiển thị nội dung */
  preview: ItemId | null;
  content: CardContent | null;
  pickOrder: number | null;
  opened: boolean;
  /** tăng lên khi túi bị trả về trạng thái chưa chọn (đổi túi) -> vẽ lại lớp phủ */
  resetCount: number;
}

export type TooltipAlign = 'left' | 'center' | 'right';
export type TooltipPlacement = 'top' | 'bottom';
