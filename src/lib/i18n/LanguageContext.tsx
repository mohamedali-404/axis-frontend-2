'use client';
/**
 * Language Context — English Only
 * Arabic support removed for stability.
 * t() always returns English text.
 * Kept as a drop-in replacement so no other file needs changes.
 */
import React, { createContext, useContext, useCallback } from 'react';
import en from './en.json';

export type Language = 'en';

// Deep-get a nested key like "cart.title"
function getNestedValue(obj: any, path: string): string {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === undefined || current === null) return path;
        current = current[key];
    }
    return typeof current === 'string' ? current : path;
}

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr';
    isRTL: false;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key) => getNestedValue(en, key) || key,
    dir: 'ltr',
    isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const t = useCallback((key: string): string => {
        return getNestedValue(en, key) || key;
    }, []);

    const setLang = useCallback((_lang: Language) => { }, []);

    return (
        <LanguageContext.Provider value={{
            lang: 'en',
            setLang,
            t,
            dir: 'ltr',
            isRTL: false,
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
