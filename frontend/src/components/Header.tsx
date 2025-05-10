import React from 'react';
import { Recycle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Recycle size={32} className="text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('header.title')}
            </h1>
          </div>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header;