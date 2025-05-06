import React from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import TrashDetectionPage from './pages/TrashDetectionPage';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-grow">
        <TrashDetectionPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;