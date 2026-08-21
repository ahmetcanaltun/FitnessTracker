import { groupWorkoutDays } from "../lib/workout-history";

let failed = 0;
function check(label: string, got: unknown, expected: unknown) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(expected);
  if (a !== b) {
    failed++;
    console.error(`HATA ${label}: ${a}, beklenen ${b}`);
  }
}

const gunler = groupWorkoutDays([
  { performedAt: "2026-08-20", exerciseName: "Bench Press", sets: 4, reps: 8, weightKg: 60 },
  { performedAt: "2026-08-20", exerciseName: "Bench Press", sets: 1, reps: 6, weightKg: 65 },
  { performedAt: "2026-08-20", exerciseName: "Dips", sets: 3, reps: 10, weightKg: 0 },
  { performedAt: "2026-08-18", exerciseName: "Squat", sets: 5, reps: 5, weightKg: 100 },
]);

check("gün sayısı", gunler.length, 2);
check("en yeni gün başta", gunler[0].date, "2026-08-20");
check("hareket sayısı tekilleşiyor", gunler[0].exerciseCount, 2);
check("toplam set", gunler[0].totalSets, 8);
check("en ağır", gunler[0].topWeightKg, 65);
check("hareket adları", gunler[0].exerciseNames, ["Bench Press", "Dips"]);
check("ikinci gün seti", gunler[1].totalSets, 5);

check("boş girdi", groupWorkoutDays([]), []);

console.log(failed === 0 ? "tüm kontroller geçti" : `${failed} kontrol başarısız`);
process.exit(failed === 0 ? 0 : 1);
