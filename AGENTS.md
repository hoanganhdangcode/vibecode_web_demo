oke # AGENTS.md — MIẾU ÔNG TRƯỜNG CON: Gieo quẻ hôm nay ăn gì?

## 1. Tổng quan dự án

Static web experience 3D: người dùng đứng trước một ngôi miếu 3D và thực hiện nghi thức gieo quẻ.
Interactive element chính là **HŨ QUẺ 3D** — KHÔNG dùng nút "GIEO QUẺ" lớn ở giữa màn hình.

Không cần database, không backend, không API, không auth, không state management library ngoài React state/context.

## 2. Core experience

- Không gian miếu 3D: hũ quẻ, 3 nén hương, altar, ánh sáng ấm, khói/haze, fog.
- Hũ quẻ: glowing border/aura, subtle pulse, hover effect, floating instruction "✦ Click gieo quẻ ✦".
- User click trực tiếp vào hũ.

## 3. Ritual flow (bắt buộc theo thứ tự)

1. **Start ritual**: disable further click, glow fade out, instruction biến mất, camera cinematic movement nhẹ.
2. **Hand lights incense**: bàn tay đưa vào 3 nén hương. QUAN TRỌNG: CẢ 3 NÉN HƯƠNG THẮP CÙNG LÚC, không châm từng cây. Flame flicker + 3 nguồn sáng nhỏ từ hương.
3. **Smoke**: khói particle/smoke shader bay lên, chuyển động sang trái/phải, opacity thay đổi, scale tăng dần. KHÔNG dùng ảnh khói đứng yên.
4. **Fortune jar shake**: idle → subtle → stronger → very strong → **dừng đột ngột**. Không dùng physics engine nếu không cần, ưu tiên GSAP timeline.
5. **Draw fortune**: fortune paper xuất hiện từ miệng hũ → emerge → rise → rotation → move toward camera → center screen.
6. **Reveal**: flip animation, hiển thị "QUẺ BÚN ĐẬU MẮM TÔM" + mô tả. Có thể thêm particle/glow/bloom nhẹ.

## 4. Daily fortune logic

- Data hard-code trong `src/data/fortunes.js` (array object có `id`, `name`, `description`).
- Random đúng MỘT lần, lưu vào localStorage, KHÔNG random lại khi reload.
- Key: `fortune-date`, `fortune-result`. Date tính theo browser ngày hiện tại.
- Cùng ngày reload: không random lại. Sang ngày mới: cho phép gieo mới.

## 5. Tech stack

- React, Vite, React Three Fiber (R3F), Three.js, Drei, GSAP, `@react-three/postprocessing` (nếu cần), localStorage.

## 6. Asset architecture

```text
src/
├── components/
│   ├── scene/
│   │   ├── ShrineScene.jsx, Shrine.jsx, FortuneJar.jsx, Incense.jsx, Smoke.jsx, RitualHand.jsx, FortunePaper.jsx
│   ├── effects/
│   │   ├── Glow.jsx, Particles.jsx, Atmosphere.jsx
│   └── ui/
│       ├── Instruction.jsx, FortuneResult.jsx
├── data/fortunes.js
├── hooks/useDailyFortune.js
├── animations/ritualTimeline.js
├── assets/models/ (shrine.glb, fortune-jar.glb, incense.glb, fortune-paper.glb, ritual-hand.glb)
└── App.jsx
```

Assets chưa tồn tại → dùng abstraction/interface để dễ thay `.glb`, placeholder primitive cho development.

## 7. Visual style

- Vietnamese traditional shrine, mystical, warm, slightly dark, cinematic, atmospheric.
- Không fantasy, không neon cyberpunk, không cartoon, không quá realistic.
- Colors: dark wood, aged red, warm gold, incense orange, dark brown, subtle fog.
- Lighting: warm point light từ hương, warm light altar, subtle ambient, directional/moon light, fog/haze, bloom vừa phải (không lạm dụng).

## 8. Hũ quẻ 3 trạng thái

- **IDLE**: subtle floating, subtle glow, instruction visible, hover scale ≈ 1.02.
- **RITUAL**: glow disabled/faded, no interaction, shake.
- **RESULT**: normal scene, result revealed.
- Chống double-click, không cho trigger nhiều ritual cùng lúc.

## 9. Animation architecture

- KHÔNG setTimeout rải rác. Dùng ritual timeline rõ ràng:
  `IDLE → LIGHTING_INCENSE → SMOKE → SHAKE_JAR → DRAWING_FORTUNE → REVEALING → RESULT`
- GSAP timeline quản lý và cleanup đúng cách. Khi unmount: kill timeline, cleanup animation, event listeners, Three.js resources.

## 10. Performance

- Lazy load GLB, reuse geometry/material, không tạo particle vô hạn, hạn chế shadow map nặng, không physics engine, hạn chế postprocessing, mobile chạy mức hợp lý.
- Ưu tiên 60 FPS/mobile performance hơn visual effect đẹp hơn một chút.

## 11. Responsive

- Desktop primary, mobile vẫn hoạt động: camera tự điều chỉnh, hũ vùng dễ nhìn, instruction không che hũ, result không vượt viewport, giảm particle nếu cần.

## 12. Development rules

- Không rewrite toàn bộ project vì một feature nhỏ.
- Trước khi sửa: inspect → hiểu structure → reuse components → thay đổi nhỏ nhất → run/build/test → báo cáo.
- Không tự ý đổi framework, package manager, xóa source đang hoạt động, thay config không liên quan, thêm backend/database/API/auth.
- Architectural issue lớn: DỪNG và báo user trước khi rewrite.

## 13. Implementation phases

PHASE 0 (Inspect) → PHASE 1 (Foundation: R3F + Drei + GSAP, placeholder scene chạy được) → PHASE 2 (Shrine scene) → PHASE 3 (Jar interaction) → PHASE 4 (Incense ritual) → PHASE 5 (Jar shake) → PHASE 6 (Fortune draw) → PHASE 7 (Reveal) → PHASE 8 (Daily persistence) → PHASE 9 (Polish).

## 14. Workflow rules

- Làm từng phase, không làm toàn bộ một lần.
- Sau mỗi phase báo: Completed / Files changed / Dependencies added / How to test / Known issues / Next phase, rồi DỪNG chờ approval.
- Build/test fail: debug nguyên nhân, sửa nhỏ nhất, chạy lại, không che giấu lỗi.