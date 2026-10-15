import { create } from 'zustand';
import {
  MAX_PICKS,
  REVEAL_ITEMS,
  REVEAL_SCRIPT,
  SWITCH_WINDOW_MS,
  TAUNTS,
  TOTAL_BAGS,
} from '../config/game';
import type { Card, CardContent, ItemId, Phase } from '../types';

export interface Toast {
  id: number;
  text: string;
}

let toastSeq = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCards(): Card[] {
  // 2 túi ngẫu nhiên chứa 2 món giá trị, các túi còn lại không hiển thị nội dung
  const picked = shuffle(Array.from({ length: TOTAL_BAGS }, (_, i) => i)).slice(
    0,
    REVEAL_ITEMS.length,
  );
  const previewByIndex = new Map<number, ItemId>();
  picked.forEach((cardIndex, k) => previewByIndex.set(cardIndex, REVEAL_ITEMS[k]));

  return Array.from({ length: TOTAL_BAGS }, (_, i) => ({
    id: `c${i}`,
    slot: i,
    preview: previewByIndex.get(i) ?? null,
    content: null,
    pickOrder: null,
    opened: false,
    resetCount: 0,
  }));
}

interface GameState {
  phase: Phase;
  cards: Card[];
  picks: number;
  toast: Toast | null;
  /** còn được đổi túi ở lượt 1 tới mốc thời gian này (null = không đổi được nữa) */
  switchDeadline: number | null;
  /** người chơi đã từng đổi túi ở lượt 1 chưa */
  switched: boolean;
  start: () => void;
  beginShuffle: () => void;
  commitOrder: (order: number[]) => void;
  finishShuffle: () => void;
  beginPick: (id: string) => void;
  completeOpen: (id: string) => void;
  revealRemaining: () => void;
  finishAutoReveal: () => void;
  expireSwitchWindow: () => void;
  showToast: (text: string) => void;
  hideToast: (id: number) => void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'intro',
  cards: makeCards(),
  picks: 0,
  toast: null,
  switchDeadline: null,
  switched: false,

  start: () => {
    if (get().phase !== 'intro') return;
    set({ phase: 'peek' });
  },

  beginShuffle: () => {
    if (get().phase !== 'peek') return;
    set({ phase: 'shuffling' });
  },

  /** order[slotIndex] = cardIndex — ghi lại vị trí sau khi trộn */
  commitOrder: (order) => {
    set((s) => ({
      cards: s.cards.map((c, i) => {
        const slot = order.indexOf(i);
        return slot >= 0 ? { ...c, slot } : c;
      }),
    }));
  },

  finishShuffle: () => {
    if (get().phase !== 'shuffling') return;
    set({ phase: 'picking' });
  },

  /**
   * Bắt đầu phủi một túi. Trong SWITCH_WINDOW_MS đầu của lượt 1, nếu người chơi
   * chuyển sang túi khác thì túi cũ được trả về nguyên trạng (chưa chọn, phủi lại từ đầu).
   */
  beginPick: (id) => {
    const state = get();
    const { phase, picks, cards } = state;
    if (phase !== 'picking' || picks >= MAX_PICKS) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.opened) return;

    const now = Date.now();
    const windowOpen = state.switchDeadline !== null && now < state.switchDeadline;

    // chạm lại đúng túi đang chờ chốt -> giữ túi này, ẩn đếm ngược
    if (card.content) {
      if (windowOpen) set({ switchDeadline: null });
      return;
    }

    const pending = cards.find((c) => c.pickOrder !== null && !c.opened);

    // trong lúc chờ chốt mà chạm sang túi khác -> đổi túi, ẩn đếm ngược
    if (windowOpen && pending && pending.pickOrder === 1) {
      const content = REVEAL_SCRIPT[0];
      set({
        switched: true,
        switchDeadline: null,
        cards: cards.map((c) => {
          if (c.id === pending.id) {
            return { ...c, content: null, pickOrder: null, resetCount: c.resetCount + 1 };
          }
          if (c.id === id) return { ...c, content, pickOrder: 1 };
          return c;
        }),
      });
      get().showToast(TAUNTS.switchCard);
      return;
    }

    // đang còn túi chưa phủi xong -> bắt phủi xong đã mới cho sang túi khác
    if (pending) {
      get().showToast(TAUNTS.mustFinish);
      return;
    }

    const pickOrder = picks + 1;
    const content: CardContent = REVEAL_SCRIPT[picks] ?? REVEAL_SCRIPT[REVEAL_SCRIPT.length - 1];

    set({
      picks: pickOrder,
      switchDeadline: pickOrder === 1 ? now + SWITCH_WINDOW_MS : null,
      cards: cards.map((c) => (c.id === id ? { ...c, content, pickOrder } : c)),
    });

    get().showToast(
      pickOrder === 1
        ? TAUNTS.firstPick
        : state.switched
          ? TAUNTS.secondPickSwitched
          : TAUNTS.secondPick,
    );
  },

  completeOpen: (id) => {
    const state = get();
    const next = state.cards.map((c) => (c.id === id ? { ...c, opened: true } : c));
    const order = next.find((c) => c.id === id)?.pickOrder;
    set({ cards: next, switchDeadline: order === 1 ? null : state.switchDeadline });

    if (order === 1) get().showToast(state.switched ? TAUNTS.switchedOpened : TAUNTS.firstOpened);
    else if (order === 2) get().showToast(TAUNTS.secondOpened);
  },

  showToast: (text) => set({ toast: { id: ++toastSeq, text } }),

  hideToast: (id) => {
    if (get().toast?.id === id) set({ toast: null });
  },

  /**
   * Hết lượt: chỉ mở đúng 2 túi chứa món giá trị nhất để "chỉ chỗ",
   * hiện thẳng nội dung (không hiệu ứng). Các túi còn lại vẫn úp.
   */
  revealRemaining: () => {
    const { cards, phase } = get();
    if (phase !== 'picking') return;

    const remaining = shuffle(
      cards.map((c, i) => (c.pickOrder === null ? i : -1)).filter((i) => i >= 0),
    );
    const items = shuffle([...REVEAL_ITEMS]);
    const chosen = new Map<number, ItemId>();
    remaining.slice(0, items.length).forEach((cardIndex, k) => {
      chosen.set(cardIndex, items[k]);
    });

    set({
      phase: 'autoRevealing',
      cards: cards.map((c, i) => {
        const item = chosen.get(i);
        return item ? { ...c, content: { kind: 'item', item } as CardContent, opened: true } : c;
      }),
    });
  },

  finishAutoReveal: () => {
    if (get().phase !== 'autoRevealing') return;
    set({ phase: 'done' });
  },

  /** hết thời gian đếm ngược -> chốt luôn túi đang chọn, cho cạo */
  expireSwitchWindow: () => {
    if (get().switchDeadline !== null) set({ switchDeadline: null });
  },
}));
