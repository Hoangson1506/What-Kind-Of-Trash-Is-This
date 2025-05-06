import React from 'react';
import { Recycle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Recycle size={32} className="text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              What kind trash is this?
            </h1>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li className="hidden md:block">
                <a 
                  href="#" 
                  className="text-white hover:text-green-100 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li className="hidden md:block">
                <a 
                  href="#" 
                  className="text-white hover:text-green-100 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;