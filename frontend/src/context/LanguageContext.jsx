import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const { i18n: i18nInstance } = useTranslation();
    const [language, setLanguage] = useState(i18nInstance.language || 'en');
    const [isRTL, setIsRTL] = useState(false);
    const [renderKey, setRenderKey] = useState(0);
    const isChangingRef = useRef(false);

    // Update language state when i18n changes
    useEffect(() => {
        const handleLanguageChange = (lng) => {
            if (isChangingRef.current) return;
            
            const isRTL = ['ps', 'dr', 'ar', 'fa', 'ur'].includes(lng);
            setLanguage(lng);
            setIsRTL(isRTL);
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = lng;
            document.body.dir = isRTL ? 'rtl' : 'ltr';
            // Only update renderKey if it's a real language change
            setRenderKey(prev => prev + 1);
        };

        // Set initial language
        const initialLng = i18nInstance.language || 'en';
        const initialRTL = ['ps', 'dr', 'ar', 'fa', 'ur'].includes(initialLng);
        setIsRTL(initialRTL);
        document.documentElement.dir = initialRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = initialLng;
        document.body.dir = initialRTL ? 'rtl' : 'ltr';

        i18nInstance.on('languageChanged', handleLanguageChange);

        return () => {
            i18nInstance.off('languageChanged', handleLanguageChange);
        };
    }, [i18nInstance]);

    const changeLanguage = useCallback((lng) => {
        if (i18nInstance.language !== lng && !isChangingRef.current) {
            isChangingRef.current = true;
            
            i18nInstance.changeLanguage(lng);
            localStorage.setItem('i18nextLng', lng);
            
            const isRTL = ['ps', 'dr', 'ar', 'fa', 'ur'].includes(lng);
            setIsRTL(isRTL);
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = lng;
            document.body.dir = isRTL ? 'rtl' : 'ltr';
            setRenderKey(prev => prev + 1);
            
            // Reset the flag after a delay
            setTimeout(() => {
                isChangingRef.current = false;
            }, 100);
        }
    }, [i18nInstance]);

    const forceUpdate = useCallback(() => {
        setRenderKey(prev => prev + 1);
    }, []);

    return (
        <LanguageContext.Provider value={{
            language,
            isRTL,
            renderKey,
            changeLanguage,
            forceUpdate
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}