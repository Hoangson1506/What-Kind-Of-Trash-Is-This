import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitch: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center px-3 py-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
            title={i18n.language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
        >
            <Languages size={20} className="mr-2" />
            <span>{i18n.language === 'en' ? 'VI' : 'EN'}</span>
        </button>
    );
}

export default LanguageSwitch;