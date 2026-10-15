import type { CardContent, Item, ItemId } from '../types';

const asset = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;

/**
 * 2 món quà giá trị nhất — chỉ 2 món này được hiển thị nội dung.
 * Bỏ ảnh vào public/images/ với đúng tên file (PNG nền trong suốt, ~512-800px).
 */
export const ITEMS: Record<ItemId, Item> = {
  imac: { name: 'iMac 24" xanh lá', img: asset('imac.png'), color: '#16a34a' },
  iphone: { name: 'iPhone 18 Pro Max xanh lá', img: asset('iphone.png'), color: '#15803d' },
};

/** 2 món được mở ra sau khi bốc xong, để "chỉ chỗ" chúng nằm ở túi nào. */
export const REVEAL_ITEMS: ItemId[] = ['iphone', 'imac'];

/** Tổng số túi. 2 túi chứa món giá trị, các túi còn lại không hiển thị nội dung. */
export const TOTAL_BAGS = 7;

export const MAX_PICKS = 2;

export const TIMINGS = {
  /** thời gian phơi 2 món quà giá trị trước khi che lại */
  peekMs: 2200,
  /** thời gian trộn qua lại giữa các vị trí */
  gentleMs: 4400,
  /** khung thời gian toả khói dày + trộn lại ngầm (càng nhỏ càng khó theo dõi) */
  mixMs: 260,
  /** tỉ lệ phủi để túi tự mở (càng cao càng phải phủi kỹ) */
  revealThreshold: 0.95,
};

/**
 * Kịch bản reveal theo thứ tự chọn (đã dàn dựng).
 * - Lượt 1: hiện "Quà bí mật".
 * - Lượt 2: vẫn hiện iPhone 18 Pro Max, phủi tới 85% thì hiện thêm dòng trêu,
 *   rõ hẳn cùng lúc túi mở ở 95%.
 */
export const REVEAL_SCRIPT: CardContent[] = [
  {
    kind: 'secret',
    title: 'Quà bí mật',
    lines: ['Em sẽ được nhận vào thứ 7 nhá', 'Hí hí!'],
  },
  {
    kind: 'tease',
    item: 'iphone',
    showAt: 0.85,
    extraText: 'không phải ở túi này =))',
  },
];

/** Câu hướng dẫn hiện trong bong bóng chỉ vào từng túi. */
export const COVER_HINT = 'Phủi lớp phủ';

/** Thời gian hiện mỗi popup trêu (ms). */
export const TOAST_MS = 3000;

/** Các câu trêu hiện bên ngoài túi. */
export const TAUNTS = {
  /** bắt đầu phủi túi ở lượt 1 */
  firstPick: 'Em có chắc chọn cái này không =)))',
  /** trong 10s đầu mà nhảy sang túi khác */
  switchCard: 'Em đổi thật ạ =)))',
  /** còn túi chưa phủi xong đã nhảy sang túi khác */
  mustFinish: 'Em phải cạo xong cái túi kia đã nhá',
  /** bắt đầu phủi túi ở lượt 2 (không đổi túi) */
  secondPick: 'Em chắc chắn rồi đúng không ạ =))), lần 1 anh đã nhắc rồi đấy nhá',
  /** bắt đầu phủi túi ở lượt 2 (sau khi đã đổi túi) */
  secondPickSwitched: 'Anh không gợi ý nữa nhá :>',
  /** mở xong túi lượt 1 (không đổi túi) */
  firstOpened: 'Đấy anh bảo rồi nhá =)))',
  /** mở xong túi lượt 1 (đã đổi túi) */
  switchedOpened: 'Có khi em không đổi thì trúng số rồi nhá =)))',
  /** mở xong túi lượt 2 */
  secondOpened: 'Hí hí',
};

/** Thời gian cho phép đổi túi ở lượt 1 (ms). */
export const SWITCH_WINDOW_MS = 10000;

export const TEXTS = {
  appTitle: 'Vườn quà 20/10',
  startCta: 'Bốc quà',
  peek: 'Hai phần quà giá trị nhất đang nằm đâu đó trong 7 túi này…',
  shuffling: 'Đang trộn các túi quà…',
  picking: 'Chạm vào một túi để chọn',
  pickAgain: 'Chọn thêm 1 lượt nữa nào!',
  opening: 'Phủi sạch lớp phủ để mở túi nhé',
  autoRevealing: 'Hết lượt rồi — chỉ chỗ 2 phần quà giá trị nhất nhé!',
  done: 'Anh yêu em nhiều lắm nhá 💚',
};
