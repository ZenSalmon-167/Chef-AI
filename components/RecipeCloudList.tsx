
import React from 'react';
import { Recipe } from '../types';

interface RecipeCloudListProps {
  recipes: Recipe[];
  loading: boolean;
  onRefresh: () => void;
}

const RecipeCloudList: React.FC<RecipeCloudListProps> = ({ recipes, loading, onRefresh }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ฐานข้อมูล 8 คอลัมน์ (Google Sheets)</h2>
          <p className="text-xs text-slate-400">แสดงผลข้อมูลตามลำดับที่อาจารย์กำหนด</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="p-2 px-4 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-orange-500 transition-all active:scale-95 flex items-center gap-2 text-sm font-bold shadow-sm"
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin text-orange-500' : ''}`}></i>
          ดึงข้อมูลใหม่
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">วัน/เวลา</th>
                <th className="px-6 py-4">ชื่อ</th>
                <th className="px-6 py-4">ชั้น/แผนก</th>
                <th className="px-6 py-4">ชื่ออาหาร</th>
                <th className="px-6 py-4">วัตถุดิบ</th>
                <th className="px-6 py-4">วิธีการ (AI)</th>
                <th className="px-6 py-4 text-center">STYLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && recipes.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-300">กำลังโหลด...</td></tr>
              ) : recipes.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-[10px] text-slate-400 whitespace-nowrap">{r.timestamp}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{r.submitter}</td>
                  <td className="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">{r.year} / {r.department}</td>
                  <td className="px-6 py-4 font-bold text-orange-600">{r.title}</td>
                  <td className="px-6 py-4 text-slate-500 text-[11px] max-w-[120px] truncate">{r.ingredients}</td>
                  <td className="px-6 py-4 text-slate-400 text-[10px] max-w-[150px] truncate">
                    {r.instructions?.replace(/\[.*?\]/g, '')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-800 text-white rounded-full text-[9px] font-bold">
                      {r.style}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecipeCloudList;
