import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Facebook, Recycle } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Recycle size={24} />
              <span className="text-xl font-bold">{t('header.title')}</span>
            </div>
            <p className="text-gray-300 mb-4">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.quickLinks.home')}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.quickLinks.howItWorks')}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.quickLinks.about')}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.quickLinks.privacy')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.connect.title')}</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/Hoangson1506/What-Kind-Of-Trash-Is-This" className="text-gray-300 hover:text-white transition-colors">
                <Github size={24} />
              </a>
              <a href="https://www.facebook.com/hoang.son.519672?locale=vi_VN" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-2 md:mb-0">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="text-gray-400 text-sm">
            {t('footer.poweredBy')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;