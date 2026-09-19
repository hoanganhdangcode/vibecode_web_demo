// TODO(geo): dữ liệu quán + tọa độ hiện là MOCK, chưa phải quán thật quanh user.
// TODO(geo): thay bằng dữ liệu quán thật có lat/lng chính xác; khoảng cách sẽ tính
// từ vị trí hiện tại (navigator.geolocation) bằng công thức haversine ở utils/geo.js.
// `avatar` lưu dưới dạng string (URL/data-URI ảnh quán). `shopee`/`grab` là link điều hướng,
// `phone` là số điện thoại cho nút gọi (tel:). Các field bỏ trống sẽ không hiển thị.
// `intents` = tên quẻ `food` đã CHUẨN HÓA (UPPERCASE, bỏ dấu, bỏ cách) mà quán phục vụ,
// VD: "Bún riêu" -> "BUNRIEU". Quẻ khớp quán khi chuẩn hóa tên quẻ == một token trong intents.

function avatar(label, tone) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${tone}"/><text x="48" y="60" font-size="34" text-anchor="middle" fill="#ffe3b0" font-family="sans-serif" font-weight="bold">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const NEARBY_PLACES = [
  {
    name: 'Quán Bún Đậu Mắm Tôm Cô Hồng',
    avatar: avatar('BD', '#8a2a22'),
    food: ['bún đậu mắm tôm', 'bún đậu', 'mắm tôm'],
    intents: ['BUNDAUMAMTOM'],
    lat: 20.780176,
    lng: 106.217192,
    shopee: 'https://shopeefood.vn/',
    grab: 'https://food.grab.com/vn/vi/',
    phone: '0987654321',
  },
  {
    name: 'Xôi Mặn Bà Tám',
    avatar: avatar('XM', '#b06a1c'),
    food: ['xôi', 'xôi mặn', 'xôi xéo'],
    intents: ['XOIMAN', 'XOIXEO'],
    lat: 20.779176,
    lng: 106.216292,
    shopee: 'https://shopeefood.vn/',
    grab: 'https://food.grab.com/vn/vi/',
  },
  {
    name: 'Cháo Lòng Ông Minh',
    avatar: avatar('CL', '#6b8a2b'),
    food: ['cháo lòng', 'cháo sườn', 'cháo cá', 'lòng'],
    intents: ['CHAOLONG', 'CHAOSUON', 'CHAOCA', 'THITCHO'],
    lat: 20.780776,
    lng: 106.215192,
    grab: 'https://food.grab.com/vn/vi/',
    phone: '0912345678',
  },
  {
    name: 'Phở Bò Gánh Ông Tư',
    avatar: avatar('PB', '#7a3a1e'),
    food: ['phở bò', 'phở gà', 'phở'],
    intents: ['PHOBO', 'PHOGA'],
    lat: 20.778476,
    lng: 106.215392,
    shopee: 'https://shopeefood.vn/',
    grab: 'https://food.grab.com/vn/vi/',
    phone: '0901234567',
  },
  {
    name: 'Hủ Tiếu Nam Vang Cô Út',
    avatar: avatar('HV', '#8a5a1c'),
    food: ['hủ tiếu', 'nam vang', 'bánh canh'],
    intents: ['HUTIEUNAMVANG', 'HUTIEU', 'BANHCANH'],
    lat: 20.781376,
    lng: 106.216892,
    shopee: 'https://shopeefood.vn/',
  },
  {
    name: 'Bún Chả Hàng Quán',
    avatar: avatar('BC', '#a8342a'),
    food: ['bún chả'],
    intents: ['BUNCHA', 'BUNTHITNUONG'],
    lat: 20.777076,
    lng: 106.216492,
    shopee: 'https://shopeefood.vn/',
    grab: 'https://food.grab.com/vn/vi/',
  },
  {
    name: 'Bún Riêu Cô Liên',
    avatar: avatar('BR', '#4d7a4d'),
    food: ['bún riêu', 'bún cá', 'bún mọc', 'bún thang', 'bún hải sản', 'bún', 'bún chả', 'bún thịt nướng', 'bún giả cầy'],
    intents: ['BUNRIEU', 'BUNCACHAM', 'BUNBOHUE', 'BUNMOC', 'BUNTHANG', 'BUNCARODONG', 'BUNHAISAN', 'BUNCACAY', 'BUNMAM', 'BUNGIACAY'],
    lat: 20.776376,
    lng: 106.214292,
    grab: 'https://food.grab.com/vn/vi/',
    phone: '0998765432',
  },
  {
    name: 'Cơm Tấm Ninh Giang 68',
    avatar: avatar('CT', '#a8601c'),
    food: ['cơm tấm', 'cơm hộp', 'cơm rang', 'cơm gà', 'cơm trộn', 'cơm'],
    intents: ['COMHOP', 'COMTAMSUONBICHA', 'COMRANGDUABO', 'COMGAXOIMO', 'COMTRONHANQUOC', 'COMGA'],
    lat: 20.774776,
    lng: 106.216092,
    shopee: 'https://shopeefood.vn/',
    grab: 'https://food.grab.com/vn/vi/',
    phone: '0988111222',
  },
  {
    name: 'Bánh Mì Phượng 2',
    avatar: avatar('BM', '#8a5a2b'),
    food: ['bánh mì', 'bánh mì kẹp', 'bánh mì chảo', 'bánh cuốn', 'bánh đa cua'],
    intents: ['BANHMICHAO', 'BANHMIKEP', 'BANHMITHITNUONG', 'BANHMIBONE', 'BANHDACUA', 'BANHCUONCHA'],
    lat: 20.773576,
    lng: 106.219492,
    shopee: 'https://shopeefood.vn/',
  },
  {
    name: 'Mì Quảng Bà Hai',
    avatar: avatar('MQ', '#7a2b3a'),
    food: ['mì quảng', 'mì trộn', 'mì xào', 'miến', 'mì'],
    intents: ['MIQUANG', 'MITRON', 'MIXAOBO', 'MIENTRON', 'MIENGA', 'MIENLUON'],
    lat: 20.785076,
    lng: 106.217692,
    grab: 'https://food.grab.com/vn/vi/',
  },
]