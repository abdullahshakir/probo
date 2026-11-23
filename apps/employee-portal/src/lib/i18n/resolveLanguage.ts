// Copyright (c) 2026 Probo Inc <hello@probo.com>.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export const SUPPORTED_LANGUAGES = [
  "en-US",
  "ar-SA",
  "fr-FR",
  "de-DE",
  "es-ES",
  "id-ID",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "nl-NL",
  "pl-PL",
  "pt-PT",
  "tr-TR",
  "uk-UA",
  "zh-CN",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Languages with shipped UI catalogs in this app. The switcher lists these;
// other supported tags still resolve from the navigator and fall back to
// en-US for missing keys.
export const SELECTABLE_LANGUAGES = [
  "en-US",
  "ar-SA",
  "es-ES",
  "fr-FR",
  "nl-NL",
] as const satisfies readonly SupportedLanguage[];

export type SelectableLanguage = (typeof SELECTABLE_LANGUAGES)[number];

// Native-language labels for the locale switcher (not translated via i18n).
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  "en-US": "English",
  "ar-SA": "العربية",
  "fr-FR": "Français",
  "de-DE": "Deutsch",
  "es-ES": "Español",
  "id-ID": "Bahasa Indonesia",
  "it-IT": "Italiano",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
  "nl-NL": "Nederlands",
  "pl-PL": "Polski",
  "pt-PT": "Português",
  "tr-TR": "Türkçe",
  "uk-UA": "Українська",
  "zh-CN": "中文",
};

const PREFERRED_LANGUAGE_KEY = "probo.preferredLanguage";

// Maps a two-letter language prefix (lowercased) to its canonical supported
// tag, e.g. any "de*" browser tag resolves to "de-DE".
const PREFIX_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  en: "en-US",
  ar: "ar-SA",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  nl: "nl-NL",
  pl: "pl-PL",
  pt: "pt-PT",
  tr: "tr-TR",
  uk: "uk-UA",
  zh: "zh-CN",
};

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function isRtlLanguage(language: string): boolean {
  return language === "ar-SA" || language.toLowerCase().startsWith("ar");
}

export function getPreferredLanguage(): SupportedLanguage | null {
  try {
    const stored = localStorage.getItem(PREFERRED_LANGUAGE_KEY);
    if (stored != null && isSupportedLanguage(stored)) {
      return stored;
    }
  } catch {
    // private mode / blocked storage — fall through to navigator
  }
  return null;
}

export function setPreferredLanguage(language: SupportedLanguage): void {
  try {
    localStorage.setItem(PREFERRED_LANGUAGE_KEY, language);
  } catch {
    // Ignore persistence failures; the in-session changeLanguage still applies.
  }
}

// Collapse the browser's preferred languages to one of our supported locales
// by matching the two-letter language prefix (e.g. any "fr*" tag maps to
// fr-FR). Returns null when nothing matches — callers that need a guaranteed
// locale should use resolveLanguage() instead.
export function matchNavigatorLanguage(): SupportedLanguage | null {
  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const tag of candidates) {
    const prefix = tag.toLowerCase().split("-")[0];
    const language = PREFIX_TO_LANGUAGE[prefix];
    if (language) {
      return language;
    }
  }

  return null;
}

// A stored preference wins over the navigator. Falls back to en-US when
// nothing matches. Resolving to a canonical supported tag here means
// i18next is never asked to load an unsupported locale; fallbackLng only
// has to cover missing keys.
export function resolveLanguage(): SupportedLanguage {
  return getPreferredLanguage() ?? matchNavigatorLanguage() ?? "en-US";
}
