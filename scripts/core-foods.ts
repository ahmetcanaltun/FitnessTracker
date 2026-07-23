/**
 * Çekirdek besin listesi (plan.md §6).
 *
 * Open Food Facts paketli/markalı ürünlerde güçlü ama çiğ/temel besinlerde
 * (tavuk göğsü, pirinç, yumurta...) eksik kalıyor. Bu liste o boşluğu kapatır.
 * Besin değerleri USDA FoodData Central referans alınarak derlendi; Türkiye'ye
 * özgü ürünlerde (simit, sucuk, ayran) yaygın ortalama değerler kullanıldı.
 *
 * `unit` porsiyon çarpanının birimidir: kcal/protein/karbonhidrat/yağ hep
 * *bir birim* içindir. Kullanıcı miktar olarak kaç birim yediğini seçer.
 */

export type CoreFood = {
  slug: string;
  name: string;
  nameEn: string | null;
  unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const CORE_FOODS: CoreFood[] = [
  // --- Tahıl / karbonhidrat ---
  { slug: "yulaf-ezmesi", name: "Yulaf Ezmesi", nameEn: "Oats", unit: "100g", kcal: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { slug: "pismis-pirinc", name: "Pişmiş Pirinç", nameEn: "Cooked rice", unit: "100g", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { slug: "pismis-bulgur", name: "Pişmiş Bulgur", nameEn: "Cooked bulgur", unit: "100g", kcal: 83, protein: 3.1, carbs: 18.6, fat: 0.2 },
  { slug: "pismis-makarna", name: "Pişmiş Makarna", nameEn: "Cooked pasta", unit: "100g", kcal: 131, protein: 5, carbs: 25, fat: 1.1 },
  { slug: "tam-bugday-ekmegi", name: "Tam Buğday Ekmeği", nameEn: "Whole wheat bread", unit: "dilim", kcal: 82, protein: 4, carbs: 14, fat: 1.1 },
  { slug: "beyaz-ekmek", name: "Beyaz Ekmek", nameEn: "White bread", unit: "dilim", kcal: 79, protein: 2.7, carbs: 14.8, fat: 1 },
  { slug: "simit", name: "Simit", nameEn: "Simit", unit: "adet", kcal: 280, protein: 8, carbs: 55, fat: 3 },
  { slug: "lavas", name: "Lavaş", nameEn: "Lavash", unit: "adet", kcal: 200, protein: 6, carbs: 40, fat: 1.5 },
  { slug: "haslanmis-patates", name: "Haşlanmış Patates", nameEn: "Boiled potato", unit: "100g", kcal: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { slug: "tatli-patates", name: "Tatlı Patates (Fırın)", nameEn: "Baked sweet potato", unit: "100g", kcal: 90, protein: 2, carbs: 21, fat: 0.1 },
  { slug: "kinoa", name: "Kinoa (Pişmiş)", nameEn: "Cooked quinoa", unit: "100g", kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  { slug: "haslanmis-misir", name: "Haşlanmış Mısır", nameEn: "Boiled corn", unit: "100g", kcal: 96, protein: 3.4, carbs: 21, fat: 1.5 },

  // --- Baklagil ---
  { slug: "pismis-nohut", name: "Pişmiş Nohut", nameEn: "Cooked chickpeas", unit: "100g", kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  { slug: "pismis-mercimek", name: "Pişmiş Mercimek", nameEn: "Cooked lentils", unit: "100g", kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { slug: "pismis-kuru-fasulye", name: "Pişmiş Kuru Fasulye", nameEn: "Cooked white beans", unit: "100g", kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5 },

  // --- Et / balık / yumurta ---
  { slug: "izgara-tavuk-gogsu", name: "Izgara Tavuk Göğsü", nameEn: "Grilled chicken breast", unit: "100g", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { slug: "tavuk-but", name: "Tavuk But (Derisiz)", nameEn: "Skinless chicken thigh", unit: "100g", kcal: 209, protein: 26, carbs: 0, fat: 11 },
  { slug: "hindi-gogsu", name: "Hindi Göğsü", nameEn: "Turkey breast", unit: "100g", kcal: 135, protein: 30, carbs: 0, fat: 1 },
  { slug: "dana-kiyma", name: "Dana Kıyma (Pişmiş)", nameEn: "Cooked ground beef", unit: "100g", kcal: 250, protein: 26, carbs: 0, fat: 15 },
  { slug: "dana-biftek", name: "Dana Biftek (Izgara)", nameEn: "Grilled beef steak", unit: "100g", kcal: 217, protein: 26, carbs: 0, fat: 12 },
  { slug: "kuzu-pirzola", name: "Kuzu Pirzola (Izgara)", nameEn: "Grilled lamb chop", unit: "100g", kcal: 294, protein: 25, carbs: 0, fat: 21 },
  { slug: "somon", name: "Somon (Izgara)", nameEn: "Grilled salmon", unit: "100g", kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { slug: "ton-baligi", name: "Ton Balığı (Suda)", nameEn: "Tuna in water", unit: "100g", kcal: 116, protein: 26, carbs: 0, fat: 0.8 },
  { slug: "levrek", name: "Levrek (Izgara)", nameEn: "Grilled sea bass", unit: "100g", kcal: 124, protein: 24, carbs: 0, fat: 2.6 },
  { slug: "hamsi", name: "Hamsi (Tava)", nameEn: "Fried anchovy", unit: "100g", kcal: 210, protein: 20, carbs: 4, fat: 12 },
  { slug: "haslanmis-yumurta", name: "Haşlanmış Yumurta", nameEn: "Boiled egg", unit: "adet", kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { slug: "yumurta-beyazi", name: "Yumurta Beyazı", nameEn: "Egg white", unit: "adet", kcal: 17, protein: 3.6, carbs: 0.2, fat: 0.1 },
  { slug: "sucuk", name: "Sucuk", nameEn: "Sucuk", unit: "30g", kcal: 130, protein: 6, carbs: 0.5, fat: 11.5 },

  // --- Süt ürünleri ---
  { slug: "suzme-yogurt", name: "Süzme Yoğurt", nameEn: "Greek yogurt", unit: "100g", kcal: 97, protein: 9, carbs: 4, fat: 5 },
  { slug: "yogurt", name: "Yoğurt (Tam Yağlı)", nameEn: "Full-fat yogurt", unit: "100g", kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { slug: "ayran", name: "Ayran", nameEn: "Ayran", unit: "bardak (200ml)", kcal: 60, protein: 3, carbs: 4.5, fat: 3 },
  { slug: "sut", name: "Süt (Yarım Yağlı)", nameEn: "Semi-skimmed milk", unit: "bardak (200ml)", kcal: 100, protein: 6.6, carbs: 9.6, fat: 3.2 },
  { slug: "beyaz-peynir", name: "Beyaz Peynir", nameEn: "White cheese", unit: "30g", kcal: 75, protein: 5.4, carbs: 0.6, fat: 5.7 },
  { slug: "kasar-peyniri", name: "Kaşar Peyniri", nameEn: "Kashar cheese", unit: "30g", kcal: 110, protein: 7.5, carbs: 1, fat: 8.5 },
  { slug: "lor-peyniri", name: "Lor Peyniri", nameEn: "Curd cheese", unit: "100g", kcal: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { slug: "labne", name: "Labne", nameEn: "Labneh", unit: "30g", kcal: 70, protein: 2, carbs: 2, fat: 6 },

  // --- Kuruyemiş / yağ ---
  { slug: "badem", name: "Badem", nameEn: "Almonds", unit: "30g", kcal: 174, protein: 6.4, carbs: 6.1, fat: 15 },
  { slug: "ceviz", name: "Ceviz", nameEn: "Walnuts", unit: "30g", kcal: 196, protein: 4.5, carbs: 4.1, fat: 19.6 },
  { slug: "findik", name: "Fındık", nameEn: "Hazelnuts", unit: "30g", kcal: 189, protein: 4.5, carbs: 5, fat: 18.3 },
  { slug: "yer-fistigi", name: "Yer Fıstığı", nameEn: "Peanuts", unit: "30g", kcal: 170, protein: 7.3, carbs: 4.9, fat: 14.7 },
  { slug: "fistik-ezmesi", name: "Fıstık Ezmesi", nameEn: "Peanut butter", unit: "30g", kcal: 188, protein: 8, carbs: 6, fat: 16 },
  { slug: "tahin", name: "Tahin", nameEn: "Tahini", unit: "30g", kcal: 178, protein: 5.1, carbs: 6.4, fat: 15.5 },
  { slug: "aycicegi-cekirdegi", name: "Ayçiçeği Çekirdeği", nameEn: "Sunflower seeds", unit: "30g", kcal: 175, protein: 5.8, carbs: 6, fat: 15.4 },
  { slug: "zeytinyagi", name: "Zeytinyağı", nameEn: "Olive oil", unit: "yemek kaşığı", kcal: 119, protein: 0, carbs: 0, fat: 13.5 },
  { slug: "tereyagi", name: "Tereyağı", nameEn: "Butter", unit: "10g", kcal: 72, protein: 0.1, carbs: 0.1, fat: 8.1 },
  { slug: "siyah-zeytin", name: "Siyah Zeytin", nameEn: "Black olive", unit: "adet", kcal: 7, protein: 0.1, carbs: 0.4, fat: 0.7 },

  // --- Meyve ---
  { slug: "muz", name: "Muz", nameEn: "Banana", unit: "adet", kcal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { slug: "elma", name: "Elma", nameEn: "Apple", unit: "adet", kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { slug: "portakal", name: "Portakal", nameEn: "Orange", unit: "adet", kcal: 62, protein: 1.2, carbs: 15.4, fat: 0.2 },
  { slug: "armut", name: "Armut", nameEn: "Pear", unit: "adet", kcal: 101, protein: 0.6, carbs: 27, fat: 0.2 },
  { slug: "kivi", name: "Kivi", nameEn: "Kiwi", unit: "adet", kcal: 42, protein: 0.8, carbs: 10, fat: 0.4 },
  { slug: "avokado", name: "Avokado", nameEn: "Avocado", unit: "adet", kcal: 240, protein: 3, carbs: 12, fat: 22 },
  { slug: "cilek", name: "Çilek", nameEn: "Strawberry", unit: "100g", kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { slug: "uzum", name: "Üzüm", nameEn: "Grapes", unit: "100g", kcal: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { slug: "karpuz", name: "Karpuz", nameEn: "Watermelon", unit: "100g", kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
  { slug: "kavun", name: "Kavun", nameEn: "Melon", unit: "100g", kcal: 34, protein: 0.8, carbs: 8.2, fat: 0.2 },
  { slug: "kuru-hurma", name: "Kuru Hurma", nameEn: "Dried date", unit: "adet", kcal: 66, protein: 0.4, carbs: 18, fat: 0.1 },
  { slug: "kuru-kayisi", name: "Kuru Kayısı", nameEn: "Dried apricot", unit: "30g", kcal: 72, protein: 1, carbs: 19, fat: 0.1 },

  // --- Sebze ---
  { slug: "domates", name: "Domates", nameEn: "Tomato", unit: "100g", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { slug: "salatalik", name: "Salatalık", nameEn: "Cucumber", unit: "100g", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { slug: "marul", name: "Marul", nameEn: "Lettuce", unit: "100g", kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { slug: "brokoli", name: "Brokoli (Haşlanmış)", nameEn: "Boiled broccoli", unit: "100g", kcal: 35, protein: 2.4, carbs: 7.2, fat: 0.4 },
  { slug: "ispanak", name: "Ispanak (Haşlanmış)", nameEn: "Boiled spinach", unit: "100g", kcal: 23, protein: 3, carbs: 3.8, fat: 0.3 },
  { slug: "havuc", name: "Havuç", nameEn: "Carrot", unit: "100g", kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  { slug: "kuru-sogan", name: "Kuru Soğan", nameEn: "Onion", unit: "100g", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  { slug: "yesil-biber", name: "Yeşil Biber", nameEn: "Green pepper", unit: "100g", kcal: 20, protein: 0.9, carbs: 4.6, fat: 0.2 },
  { slug: "kabak", name: "Kabak", nameEn: "Zucchini", unit: "100g", kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { slug: "patlican", name: "Patlıcan", nameEn: "Eggplant", unit: "100g", kcal: 25, protein: 1, carbs: 5.9, fat: 0.2 },

  // --- Diğer ---
  { slug: "protein-tozu", name: "Protein Tozu (Whey)", nameEn: "Whey protein", unit: "ölçek (30g)", kcal: 120, protein: 24, carbs: 3, fat: 1.5 },
  { slug: "bal", name: "Bal", nameEn: "Honey", unit: "yemek kaşığı", kcal: 64, protein: 0.1, carbs: 17, fat: 0 },
  { slug: "recel", name: "Reçel", nameEn: "Jam", unit: "yemek kaşığı", kcal: 56, protein: 0.1, carbs: 13.8, fat: 0 },
  { slug: "bitter-cikolata", name: "Bitter Çikolata", nameEn: "Dark chocolate", unit: "30g", kcal: 170, protein: 2.2, carbs: 13, fat: 12 },
  { slug: "sutlu-cikolata", name: "Sütlü Çikolata", nameEn: "Milk chocolate", unit: "30g", kcal: 160, protein: 2.2, carbs: 17, fat: 9 },
  { slug: "portakal-suyu", name: "Portakal Suyu", nameEn: "Orange juice", unit: "bardak (200ml)", kcal: 90, protein: 1.4, carbs: 21, fat: 0.4 },
  { slug: "kola", name: "Kola", nameEn: "Cola", unit: "bardak (200ml)", kcal: 84, protein: 0, carbs: 21, fat: 0 },
  { slug: "turk-kahvesi", name: "Türk Kahvesi (Sade)", nameEn: "Turkish coffee", unit: "fincan", kcal: 5, protein: 0.2, carbs: 1, fat: 0 },
  { slug: "cay", name: "Çay (Şekersiz)", nameEn: "Tea", unit: "bardak", kcal: 2, protein: 0, carbs: 0.4, fat: 0 },
];
