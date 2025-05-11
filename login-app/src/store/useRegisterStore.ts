/**
 * @fileoverview The store for the register page, handle the user data.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RegisterState {
  email: string;
  otpVerified: boolean;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  setUserData: (key: keyof RegisterState, value: string | boolean) => void;
  clearUserData: () => void;
}

// create the global state data store
export const useRegisterStore = create<RegisterState>()(
  persist(
    (set) => ({
      email: "",
      otpVerified: false,
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      setUserData: (key, value) => set((state) => ({ ...state, [key]: value })),
      clearUserData: () =>
        set(() => ({
          email: "",
          otpVerified: false,
          password: "",
          firstName: "",
          lastName: "",
          phone: "",
        })),
    }),
    {
      name: "register-storage", // define the localStorage key
      partialize: (state) => ({
        email: state.email,
        otpVerified: state.otpVerified,
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
      }), // filter out `password`, password is not stored in localStorage
    }
  )
);
