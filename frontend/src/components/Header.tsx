import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Recycle size={32} className="text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('header.title')}
            </h1>
          </Link>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`hover:text-white/90 transition-colors ${location.pathname === '/' ? 'font-semibold' : ''
                  }`}
              >
                {t('header.home', 'Home')}
              </Link>
              <Link
                to="/about"
                className={`hover:text-white/90 transition-colors ${location.pathname === '/about' ? 'font-semibold' : ''
                  }`}
              >
                {t('header.about', 'About')}
              </Link>
            </nav>
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;