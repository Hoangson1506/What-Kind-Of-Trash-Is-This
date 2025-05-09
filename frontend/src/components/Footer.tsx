import React from 'react';
import { Github, Facebook, Recycle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Recycle size={24} />
              <span className="text-xl font-bold">What kind trash is this?</span>
            </div>
            <p className="text-gray-300 mb-4">
              Helping you identify and properly dispose of waste materials through
              AI-powered image recognition.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
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
            © {new Date().getFullYear()} Trash Detection System. All rights reserved.
          </p>
          <div className="text-gray-400 text-sm">
            Powered by advanced AI technology
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;