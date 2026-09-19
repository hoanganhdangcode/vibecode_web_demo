// Default config khi sheet "Config" lỗi hoặc biến chưa có trong sheet.
// Giá trị ở tab Config của Google Sheets sẽ ghi đè các giá trị này (xem hooks/useConfig.js).
export const DEFAULT_CONFIG = Object.freeze({
  // false: cho phép gieo lại trong ngày (card kết quả hiện nút "Rút lại")
  // true: mỗi ngày chỉ gieo đúng 1 lần (reload không gieo lại)
  DENY_RETRY_SAME_DAY: false,
  // true: hiện quảng cáo trên web, false: tắt hẳn
  SHOW_ADS: false,
})