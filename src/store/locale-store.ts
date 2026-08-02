"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { messages, type Locale, type MessageKey } from "@/i18n/messages";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "sq",
      setLocale: (locale) => set({ locale }),
      t: (key) => messages[get().locale][key] ?? key,
    }),
    { name: "mrrs-locale" },
  ),
);
