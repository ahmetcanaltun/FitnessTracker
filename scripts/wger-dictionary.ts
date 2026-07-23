// wger sabit listeleri için statik Türkçe sözlük (plan.md §5).
// Bu üç liste wger'de küçük ve nadiren değişiyor; egzersiz *isimleri* için
// ise API'nin kendi Türkçe çevirisi (language id 16) kullanılıyor.

/** wger language id — isim çekerken bu sırayla denenir */
export const WGER_LANG_TR = 16;
export const WGER_LANG_EN = 2;

/** exercisecategory.name -> Türkçe. Egzersiz listesindeki filtre chip'leri bunu kullanır. */
export const CATEGORY_TR: Record<string, string> = {
  Abs: "Karın",
  Arms: "Kol",
  Back: "Sırt",
  Calves: "Baldır",
  Cardio: "Kardiyo",
  Chest: "Göğüs",
  Legs: "Bacak",
  Shoulders: "Omuz",
};

/** muscle.name (latince) -> Türkçe */
export const MUSCLE_TR: Record<string, string> = {
  "Anterior deltoid": "Ön Omuz",
  "Biceps brachii": "Biseps",
  "Biceps femoris": "Arka Bacak",
  Brachialis: "Brakialis",
  Gastrocnemius: "Baldır",
  "Gluteus maximus": "Kalça",
  "Latissimus dorsi": "Kanat (Lat)",
  "Obliquus externus abdominis": "Yan Karın",
  "Pectoralis major": "Göğüs",
  "Quadriceps femoris": "Ön Bacak",
  "Rectus abdominis": "Karın",
  "Serratus anterior": "Serratus",
  Soleus: "Solear",
  Trapezius: "Trapez",
  "Triceps brachii": "Triseps",
};

/** equipment.name -> Türkçe */
export const EQUIPMENT_TR: Record<string, string> = {
  Barbell: "Halter",
  Bench: "Sehpa",
  Dumbbell: "Dambıl",
  "Gym mat": "Mat",
  "Incline bench": "Eğimli Sehpa",
  Kettlebell: "Kettlebell",
  "Pull-up bar": "Barfiks Barı",
  "Resistance band": "Direnç Bandı",
  "SZ-Bar": "Z-Bar",
  "Swiss Ball": "Pilates Topu",
  "none (bodyweight exercise)": "Vücut Ağırlığı",
};

export function translate(dict: Record<string, string>, value: string | undefined | null) {
  if (!value) return null;
  return dict[value] ?? value;
}
