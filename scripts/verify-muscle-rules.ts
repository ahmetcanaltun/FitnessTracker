import { refineMuscle } from "./muscle-rules";

const CASES: Array<[string, string, string]> = [
  // [beklenen, girdi kası, hareket adı]
  ["yan_omuz", "on_omuz", "Cable Seated Lateral Raise"],
  ["yan_omuz", "on_omuz", "Dumbbell One-Arm Upright Row"],
  ["arka_omuz", "on_omuz", "Barbell Rear Delt Row"],
  ["arka_omuz", "on_omuz", "Cable Rear Delt Fly"],
  // Sıra tuzağı: hem "rear lateral" hem "lateral raise" kalıbına uyuyor.
  ["arka_omuz", "on_omuz", "Dumbbell Lying Rear Lateral Raise"],
  ["on_omuz", "on_omuz", "Barbell Shoulder Press"],
  ["yan_karin", "karin", "Barbell Side Bend"],
  ["yan_karin", "karin", "Decline Oblique Crunch"],
  ["karin", "karin", "Barbell Ab Rollout"],
  // Kural yalnızca omuz/karın kovalarında çalışır:
  ["gogus", "gogus", "Dumbbell Lateral Raise On Chest Day"],
];

let failed = 0;
for (const [expected, input, name] of CASES) {
  const got = refineMuscle(input as never, name);
  if (got !== expected) {
    failed++;
    console.error(`HATA: "${name}" -> ${got}, beklenen ${expected}`);
  }
}
console.log(failed === 0 ? `${CASES.length} vaka geçti` : `${failed} vaka başarısız`);
process.exit(failed === 0 ? 0 : 1);
