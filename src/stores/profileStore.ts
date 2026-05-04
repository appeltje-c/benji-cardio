import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  age: number | null;
  weight: number | null;
  height: number | null;
  setAge: (age: number | null) => void;
  setWeight: (weight: number | null) => void;
  setHeight: (height: number | null) => void;
  getMaxHR: () => number;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      age: null,
      weight: null,
      height: null,
      setAge: (age) => set({ age }),
      setWeight: (weight) => set({ weight }),
      setHeight: (height) => set({ height }),
      getMaxHR: () => {
        const { age } = get();
        return age ? 220 - age : 190;
      },
    }),
    { name: 'cardio-profile' }
  )
);
