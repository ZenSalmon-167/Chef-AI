
import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  setView: (view: ViewType) => void;
  activeView: ViewType;
}

const Header: React.FC<HeaderProps> = ({ setView, activeView }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-orange-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl text-white shadow-lg">
            <i className="fas fa-hat-chef text-lg"></i>
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">AI Chef <span className="text-orange-500">Master</span></span>
        </div>
        
        <nav className="flex space-x-1">
          <button 
            onClick={() => setView('generate')}
            className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${
              activeView === 'generate' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <i className="fas fa-wand-magic-sparkles mr-1"></i>รังสรรค์
          </button>
          <button 
            onClick={() => setView('quick')}
            className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${
              activeView === 'quick' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <i className="fas fa-bolt mr-1"></i>เมนูทันใจ
          </button>
          <button 
            onClick={() => setView('saved')}
            className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${
              activeView === 'saved' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <i className="fas fa-heart mr-1"></i>สูตรของฉัน
          </button>
          <button 
            onClick={() => setView('cloud')}
            className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${
              activeView === 'cloud' 
              ? 'bg-slate-800 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <i className="fas fa-cloud mr-1"></i>บันทึกระบบ
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
