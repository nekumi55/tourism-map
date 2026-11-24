import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-nature',
    name: 'Thiên nhiên sinh thái',
    slug: 'thien-nhien-sinh-thai',
    description: 'Vườn quốc gia Chư Mom Ray, Khu du lịch sinh thái – văn hóa Măng Đen, Núi Thiên Ấn – Chùa Thiên Ấn',
    icon: 'Trees',
    color: 'emerald',
    count: 3,
  },
  {
    id: 'cat-beaches',
    name: 'Biển đảo & Vịnh biển',
    slug: 'bien-dao-vinh-bien',
    description: 'Chùa Hang (Thiên Khổng Thạch Tự), Cổng Tò Vò, Cột cờ Tổ quốc Đảo Lý Sơn, Lễ hội biển đảo và Nghề muối Sa Huỳnh',
    icon: 'Palmtree',
    color: 'cyan',
    count: 5,
  },
  {
    id: 'cat-culture',
    name: 'Di tích lịch sử',
    slug: 'di-tich-lich-su',
    description: 'Khu chứng tích Sơn Mỹ, Khu lưu niệm Thủ tướng Phạm Văn Đồng, Nhà ngục Kon Tum, Cầu treo Kon Klor, Nhà thờ gỗ Kon Tum, Quần thể Sa Huỳnh, Cồng chiêng Tây Nguyên',
    icon: 'Landmark',
    color: 'amber',
    count: 8,
  },
  {
    id: 'cat-cuisine',
    name: 'Văn hóa Ẩm thực',
    slug: 'van-hoa-am-thuc',
    description: 'Sâm Ngọc Linh, Tỏi Lý Sơn, Cá bống sông Trà, Bánh sừng trâu của người Gié Triêng, Cơm lam – gà nướng',
    icon: 'Utensils',
    color: 'rose',
    count: 4,
  },
];
