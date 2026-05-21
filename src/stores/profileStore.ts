import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  name: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  restingHr: number | null;
  setName: (name: string | null) => void;
  setAge: (age: number | null) => void;
  setWeight: (weight: number | null) => void;
  setHeight: (height: number | null) => void;
  setRestingHr: (hr: number | null) => void;
  getMaxHR: () => number;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      name: null,
      age: null,
      weight: null,
      height: null,
      restingHr: null,
      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setWeight: (weight) => set({ weight }),
      setHeight: (height) => set({ height }),
      setRestingHr: (restingHr) => set({ restingHr }),
      getMaxHR: () => {
        const { age } = get();
        return age ? 220 - age : 190;
      },
    }),
    { name: 'cardio-profile' }
  )
);
