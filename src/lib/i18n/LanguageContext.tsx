'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en.json';
import ar from './ar.json';

export type Language = 'en' | 'ar';

const translations = { en, ar };

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
    dir: 'ltr' | 'rtl';
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key) => key,
    dir: 'ltr',
    isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem('axis_lang') as Language | null;
            if (saved === 'ar' || saved === 'en') {
                setLangState(saved);
            }
        } catch { }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', dir);
    }, [lang, mounted]);

    const setLang = useCallback((newLang: Language) => {
        setLangState(newLang);
        try {
            localStorage.setItem('axis_lang', newLang);
        } catch { }
    }, []);

    const t = useCallback((key: string): string => {
        return getNestedValue(translations[lang], key) || getNestedValue(translations['en'], key) || key;
    }, [lang]);

    const isRTL = lang === 'ar';
    const dir: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
