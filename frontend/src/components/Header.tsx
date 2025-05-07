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
        </div>
      </div>
    </header>
  );
};

export default Header;