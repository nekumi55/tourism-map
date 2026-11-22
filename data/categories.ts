import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-beaches',
    name: 'Biển đảo & Vịnh biển',
    slug: 'bien-dao-vinh-bien',
    description: 'Vương quốc biển đảo Lý Sơn, bãi biển Mỹ Khê và ghềnh đá Ba Làng An',
    icon: 'Palmtree',
    color: 'cyan',
    count: 5,
  },
  {
    id: 'cat-nature',
    name: 'Thiên nhiên & Sinh thái',
    slug: 'thien-nhien-sinh-thai',
    description: 'Thác Trắng Minh Long, núi lửa Thới Lới và thảo nguyên Bùi Hui đại ngàn',
    icon: 'Trees',
    color: 'emerald',
    count: 3,
  },
  {
    id: 'cat-culture',
    name: 'Văn hóa & Di tích',
    slug: 'van-hoa-di-tich',
    description: 'Núi thiêng Thiên Ấn, Văn hóa Sa Huỳnh cổ đại và Chùa Hang linh thiêng',
    icon: 'Landmark',
    color: 'amber',
    count: 3,
  },
  {
    id: 'cat-cuisine',
    name: 'Ẩm thực',
    slug: 'am-thuc',
    description: 'Đặc sản Don sông Trà, bún cá ngừ, ram bắp và tỏi cô đơn Lý Sơn trứ danh',
    icon: 'Utensils',
    color: 'rose',
    count: 2,
  },
];
