// Kas haritası hesabı — saf fonksiyonlar, veritabanı bilmez.
// Kural: birincil kas tam set, ikincil kas yarım set ("kesirli set").
// Birden fazla birincil kası olan hareket setini BÖLÜŞTÜRMEZ: Dips hem göğse
// hem tricepse tam set yazar.

import { MUSCLE_KEYS, isMuscleKey, type MuscleKey } from "./muscles";

export type MuscleVolume = Record<MuscleKey, number>;

export type RoutineItemVolumeInput = {
  targetSets: number | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

export type RoutineVolumeInput = {
  weekdays: number[];
  items: RoutineItemVolumeInput[];
};

/** Hedef set girilmemiş hareket için varsayım. */
export const DEFAULT_SETS = 3;

const SECONDARY_RATIO = 0.5;

function emptyVolume(): MuscleVolume {
  return Object.fromEntries(MUSCLE_KEYS.map((k) => [k, 0])) as MuscleVolume;
}

function add(volume: MuscleVolume, muscles: string[], amount: number) {
  for (const m of muscles) {
    // Eski wger satırlarında slug olmayan Türkçe etiketler kalmış olabilir;
    // tanınmayan değer sessizce atlanır.
    if (isMuscleKey(m)) volume[m] += amount;
  }
}

/** Tek antrenmanın set eşdeğerleri. */
export function sessionMuscleVolume(items: RoutineItemVolumeInput[]): MuscleVolume {
  const volume = emptyVolume();
  for (const item of items) {
    const sets = item.targetSets ?? DEFAULT_SETS;
    add(volume, item.primaryMuscles, sets);
    add(volume, item.secondaryMuscles, sets * SECONDARY_RATIO);
  }
  return volume;
}

/** Haftalık toplam: her rutin, atandığı gün sayısı kadar sayılır. */
export function weeklyMuscleVolume(routines: RoutineVolumeInput[]): MuscleVolume {
  const total = emptyVolume();
  for (const routine of routines) {
    const times = routine.weekdays.length;
    if (times === 0) continue;
    const session = sessionMuscleVolume(routine.items);
    for (const key of MUSCLE_KEYS) {
      total[key] += session[key] * times;
    }
  }
  return total;
}

export type MuscleLevel = 0 | 1 | 2 | 3;

/** 0 çalışmıyor · 1 az · 2 yeterli · 3 yüksek */
export function muscleLevel(sets: number): MuscleLevel {
  if (sets <= 0) return 0;
  if (sets < 10) return 1;
  if (sets < 20) return 2;
  return 3;
}
