
import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
  onRefresh: () => void;
  onSaveToLocal?: (recipe: Recipe) => void;
  onRemove?: (index: number) => void;
  viewType: 'saved';
}

const RecipeList: React.FC<RecipeListProps> = ({ 
  recipes, 
  onRemove
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const safeRecipes = Array.isArray(recipes) ? recipes : [];
  const filtered = safeRecipes.filter(r => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    
    return (
      (r.title || '').toLowerCase().includes(search) || 
      (r.ingredients || '').toLowerCase().includes(search) ||
      (r.style || '').toLowerCase().includes(search)
    );
  });

  const searchInWongnai = () => {
    const query = encodeURIComponent(searchTerm || 'สูตรอาหาร');
    window.open(`https://www.wongnai.com/recipes?q=${query}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* ส่วนค้นหาในรายการส่วนตัว */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-8">
        <div className="relative flex-grow w-full">
          <input 
            type="text" 
            placeholder="ค้นหาในสูตรของฉัน..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white shadow-sm border border-slate-100 outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-900"
          />
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>
        
        {searchTerm && (
          <button 
            onClick={searchInWongnai}
            className="w-full sm:w-auto bg-[#2196F3] hover:bg-[#1976D2] text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center whitespace-nowrap"
          >
            <i className="fas fa-external-link-alt mr-2"></i> หาใน Wongnai
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 animate-fade-in px-6">
            <i className={`${searchTerm ? 'fas fa-search' : 'fas fa-heart'} text-slate-100 text-6xl mb-4`}></i>
            <p className="text-slate-400 mb-6 font-medium">
              {searchTerm ? `ไม่พบ "${searchTerm}" ในรายการของคุณ` : 'คุณยังไม่มีสูตรที่บันทึกไว้'}
            </p>
            
            {searchTerm && (
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={searchInWongnai}
                  className="bg-[#2196F3] hover:bg-[#1976D2] text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center shadow-md"
                >
                  <i className="fas fa-search mr-2"></i> ค้นหา "{searchTerm}" บน Wongnai
                </button>
              </div>
            )}
          </div>
        ) : (
          filtered.map((recipe, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group animate-fade-in">
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {recipe.style} Style
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {recipe.method}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-2">
                      รังสรรค์เมื่อ: {recipe.timestamp || 'เพิ่งสร้าง'}
                    </p>
                  </div>

                  <button 
                    onClick={() => onRemove?.(idx)}
                    className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> ลบสูตรนี้
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">วัตถุดิบหลัก</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{recipe.ingredients}</p>
                      <p className="text-[10px] text-orange-500 mt-3 font-medium italic">ใช้ {recipe.media} ในการประกอบอาหาร</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ขั้นตอนการทำจาก AI</h4>
                    <div className="text-sm text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                      {recipe.instructions}
                    </div>
                    <button 
                      onClick={() => alert(`--- ${recipe.title} ---\n\n${recipe.instructions}`)}
                      className="mt-4 text-orange-500 text-xs font-bold hover:underline flex items-center"
                    >
                      ดูวิธีทำฉบับเต็ม <i className="fas fa-arrow-right ml-2 text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeList;
