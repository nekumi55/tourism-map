import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-archaeology',
    name: 'Di sản khảo cổ học',
    slug: 'di-san-khao-co-hoc',
    description:
      'Dấu tích cư dân cổ từ duyên hải đến cao nguyên đại ngàn: Di tích Văn hóa Sa Huỳnh, Di chỉ Xóm Ốc, Di chỉ Suối Chình và Di chỉ khảo cổ Lung Leng.',
    icon: 'Compass',
    color: 'amber',
    count: 4,
  },
  {
    id: 'cat-history',
    name: 'Di sản lịch sử và cách mạng',
    slug: 'di-san-lich-su-va-cach-mang',
    description:
      'Ký ức lịch sử hào hùng Đông – Tây Quảng Ngãi: các di tích lịch sử, phong trào đấu tranh yêu nước, lịch sử cách mạng, kháng chiến và chứng tích chiến tranh.',
    icon: 'Landmark',
    color: 'rose',
    count: 26,
  },
  {
    id: 'cat-architecture',
    name: 'Kiến trúc, nghệ thuật',
    slug: 'kien-truc-nghe-thuat',
    description:
      'Sắc thái văn hóa duyên hải và cao nguyên qua đình làng, chùa, thành cổ, trường lũy đến nhà thờ gỗ và nhà rông văn hóa.',
    icon: 'Building2',
    color: 'indigo',
    count: 12,
  },
  {
    id: 'cat-nature',
    name: 'Danh lam thắng cảnh và sinh thái',
    slug: 'danh-lam-thang-canh-va-sinh-thai',
    description:
      'Từ biển đảo đến đại ngàn: kết nối cảnh quan biển đảo, núi lửa Lý Sơn với hệ sinh thái rừng, núi và cao nguyên Măng Đen, Chư Mom Ray.',
    icon: 'Trees',
    color: 'emerald',
    count: 11,
  },
  {
    id: 'cat-community',
    name: 'Bản sắc văn hóa cộng đồng Đông – Tây',
    slug: 'ban-sac-van-hoa-cong-dong',
    description:
      'Tín ngưỡng, lễ hội truyền thống, nghệ thuật dân gian và di sản văn hóa phi vật thể từ biển đảo Lý Sơn đến cao nguyên Tây Quảng Ngãi.',
    icon: 'Sparkles',
    color: 'cyan',
    count: 6,
  },
  {
    id: 'cat-cuisine',
    name: 'Hương vị Đông – Tây Quảng Ngãi',
    slug: 'huong-vi-dong-tay-quang-ngai',
    description:
      'Văn hóa ẩm thực, tri thức sản xuất và sản vật đặc trưng: Hành tỏi Lý Sơn, Don, Cá bống sông Trà, Quế Trà Bồng, Sâm Ngọc Linh và Gỏi lá Kon Tum.',
    icon: 'Utensils',
    color: 'amber',
    count: 6,
  },
];
