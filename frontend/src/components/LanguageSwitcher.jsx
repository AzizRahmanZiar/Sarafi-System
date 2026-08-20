import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { changeLanguage, isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English'},
        { code: 'ps', name: 'پښتو'},
        { code: 'dr', name: 'دری'},
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLanguageChange = (lng) => {
        changeLanguage(lng);
        setIsOpen(false);
    };

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];
    const isRtl = isRTL || document.documentElement.dir === 'rtl';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRtl ? 'flex-row-reverse' : ''}`}
                title="Select Language"
            >
                <FaGlobe className="w-4 h-4 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50 animate-fadeIn`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            } ${isRtl ? 'text-right flex-row-reverse' : 'text-left'}`}
                        >
                            
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}