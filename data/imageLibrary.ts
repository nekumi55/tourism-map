export interface LibraryImage {
  id: string;
  title: string;
  category: 'nature' | 'beaches' | 'culture' | 'cuisine';
  categoryLabel: string;
  url: string;
  thumbnail: string;
  description?: string;
}

export const PRESET_IMAGE_LIBRARY: LibraryImage[] = [
  // --- BIỂN ĐẢO & LÝ SƠN ---
  {
    id: 'img-to-vo-1',
    title: 'Hoàng Hôn Cổng Tò Vò',
    category: 'beaches',
    categoryLabel: 'Biển đảo & Vịnh biển',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80',
    description: 'Vòm đá nham thạch tự nhiên triệu năm tuổi lúc hoàng hôn',
  },
  {
    id: 'img-ly-son-sea',
    title: 'Biển Ngọc Lý Sơn & San Hô',
    category: 'beaches',
    categoryLabel: 'Biển đảo & Vịnh biển',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    description: 'Làn nước biển xanh màu ngọc bích trong vắt nhìn thấy đáy',
  },
  {
    id: 'img-thoi-loi-flag',
    title: 'Đỉnh Núi Thới Lới & Cột Cờ',
    category: 'beaches',
    categoryLabel: 'Biển đảo & Vịnh biển',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80',
    description: 'Vách đá núi lửa sừng sững trông ra đại dương bao la',
  },
  {
    id: 'img-chua-hang',
    title: 'Chùa Hang (Thiên Khổng Thạch Tự)',
    category: 'beaches',
    categoryLabel: 'Biển đảo & Vịnh biển',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80',
    description: 'Ngôi chùa cổ linh thiêng ẩn mình trong hang đá núi lửa',
  },
  {
    id: 'img-khao-le-sea',
    title: 'Lễ Hội Thuyền Biển & Đua Tứ Linh',
    category: 'beaches',
    categoryLabel: 'Biển đảo & Vịnh biển',
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=300&q=80',
    description: 'Không gian văn hóa sông nước và vạn chài biển đảo',
  },
  {
    id: 'img-muoi-sa-huynh',
    title: 'Đồng Muối Sa Huỳnh Lấp Lánh',
    category: 'beaches',
    categoryLabel: 'Biển đảo & Vịnh biển',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
    description: 'Cánh đồng muối hạt truyền thống hơn 100 năm rực rỡ',
  },

  // --- THIÊN NHIÊN SINH THÁI ---
  {
    id: 'img-thien-an',
    title: 'Núi Thiên Ấn & Chùa Cổ',
    category: 'nature',
    categoryLabel: 'Thiên nhiên sinh thái',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=300&q=80',
    description: 'Đệ nhất danh sơn Thiên Ấn Niêm Hà bên dòng sông Trà Khúc',
  },
  {
    id: 'img-mang-den-pine',
    title: 'Rừng Thông Đại Ngàn Măng Đen',
    category: 'nature',
    categoryLabel: 'Thiên nhiên sinh thái',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80',
    description: 'Ngàn thông reo và sương mù bồng bềnh xứ lạnh 1.200m',
  },
  {
    id: 'img-mang-den-lake',
    title: 'Hồ Đăk Ke & Thác Nước Măng Đen',
    category: 'nature',
    categoryLabel: 'Thiên nhiên sinh thái',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=300&q=80',
    description: 'Hồ nước trong biếc phẳng lặng giữa thung lũng xanh',
  },
  {
    id: 'img-chu-mom-ray',
    title: 'Vườn Quốc Gia Chư Mom Ray',
    category: 'nature',
    categoryLabel: 'Thiên nhiên sinh thái',
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=300&q=80',
    description: 'Vườn di sản ASEAN với thảm thực vật nhiệt đới đa dạng',
  },

  // --- DI TÍCH LỊCH SỬ & VĂN HÓA ---
  {
    id: 'img-son-my',
    title: 'Khu Chứng Tích Sơn Mỹ',
    category: 'culture',
    categoryLabel: 'Di tích lịch sử',
    url: 'https://images.unsplash.com/photo-1599827552599-eeddd49733d1?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1599827552599-eeddd49733d1?auto=format&fit=crop&w=300&q=80',
    description: 'Khu tưởng niệm hòa bình và khát vọng yêu chuộng nhân loại',
  },
  {
    id: 'img-nha-tho-go',
    title: 'Nhà Thờ Chính Tòa Kon Tum (Nhà Thờ Gỗ)',
    category: 'culture',
    categoryLabel: 'Di tích lịch sử',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=300&q=80',
    description: 'Kiệt tác kiến trúc gỗ cà chít hơn 100 năm giao thoa Roman & Ba Na',
  },
  {
    id: 'img-kon-klor',
    title: 'Cầu Treo Kon Klor & Nhà Rông',
    category: 'culture',
    categoryLabel: 'Di tích lịch sử',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
    description: 'Cầu treo bắc qua sông Đắk Bla và nhà rông Ba Na sừng sững',
  },
  {
    id: 'img-cong-chieng',
    title: 'Không Gian Văn Hóa Cồng Chiêng Tây Nguyên',
    category: 'culture',
    categoryLabel: 'Di tích lịch sử',
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=300&q=80',
    description: 'Di sản văn hóa phi vật thể của nhân loại được UNESCO vinh danh',
  },
  {
    id: 'img-sa-huynh-relic',
    title: 'Quần Thể Di Tích Khảo Cổ Sa Huỳnh',
    category: 'culture',
    categoryLabel: 'Di tích lịch sử',
    url: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=300&q=80',
    description: 'Cái nôi văn minh khảo cổ mộ chum 3.000 năm và đầm An Khê',
  },

  // --- VĂN HÓA ẨM THỰC ---
  {
    id: 'img-toi-ly-son',
    title: 'Tỏi Cô Đơn Lý Sơn Trứ Danh',
    category: 'cuisine',
    categoryLabel: 'Văn hóa Ẩm thực',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
    description: 'Sản vật đặc trưng canh tác trên cát san hô và đất nham thạch',
  },
  {
    id: 'img-ca-bong',
    title: 'Cá Bống Sông Trà Kho Tộ Đất',
    category: 'cuisine',
    categoryLabel: 'Văn hóa Ẩm thực',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    description: 'Món ăn đặc sản tiêu biểu đậm đà phong vị dòng sông Trà Khúc',
  },
  {
    id: 'img-com-lam',
    title: 'Cơm Lam Nướng Ống Nứa & Gà Đồi Măng Đen',
    category: 'cuisine',
    categoryLabel: 'Văn hóa Ẩm thực',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    description: 'Hương vị núi rừng cao nguyên dẻo thơm ngạt ngào bên bếp than',
  },
  {
    id: 'img-sam-ngoc-linh',
    title: 'Quốc Bảo Sâm Ngọc Linh',
    category: 'cuisine',
    categoryLabel: 'Văn hóa Ẩm thực',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
    description: 'Thảo dược đại ngàn quý giá bậc nhất Việt Nam',
  },
];
