import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';
import { Recipe } from '../types';

interface QuickRecipeProps {
  scriptUrl: string;
  onSave: (recipe: Recipe) => void;
}

const QuickRecipe: React.FC<QuickRecipeProps> = ({ onSave }) => {
  const [menuName, setMenuName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [extractedData, setExtractedData] = useState<{title: string, ingredients: string, instructions: string, style: string} | null>(null);

  const getSection = (text: string, startMarker: string, endMarker?: string) => {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return '';
    const startPos = startIdx + startMarker.length;
    const endIdx = endMarker ? text.indexOf(endMarker, startPos) : text.length;
    return text.substring(startPos, endIdx === -1 ? text.length : endIdx).trim();
  };

  const fetchRecipe = async () => {
    if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
      alert('⚠️ ไม่พบกุญแจ AI! กรุณาตั้งค่า API_KEY ในระบบ Netlify หรือไฟล์ .env');
      return;
    }

    if (!menuName.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `คุณคือเชฟ เขียนสูตรอาหาร "${menuName}" โดยใช้วัตถุดิบพื้นฐานตามความจริง 
      [TITLE]ชื่อเมนู[/TITLE]
      [STYLE]สไตล์อาหาร[/STYLE]
      [INGREDIENTS]วัตถุดิบ[/INGREDIENTS]
      [METHOD]วิธีทำ[/METHOD]`;

      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      
      const text = response.text || '';
      setAiResult(text);
      
      setExtractedData({
        title: getSection(text, '[TITLE]', '[/TITLE]') || menuName,
        style: getSection(text, '[STYLE]', '[/STYLE]') || "ทั่วไป",
        ingredients: getSection(text, '[INGREDIENTS]', '[/INGREDIENTS]') || "ตามเมนู",
        instructions: text
      });
      setShowResult(true);
    } catch (error: any) {
      console.error("Quick Search Error:", error);
      alert(`ค้นหาไม่ได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLocal = () => {
    if (!extractedData) return;
    setSaveLoading(true);
    
    setTimeout(() => {
      onSave({
        submitter: "ค้นหาด่วน",
        year: "-",
        department: "-",
        title: extractedData.title,
        ingredients: extractedData.ingredients,
        method: "Quick",
        media: "-",
        style: extractedData.style,
        instructions: extractedData.instructions,
        timestamp: new Date().toLocaleString()
      });
      alert('บันทึกในสูตรของฉันเรียบร้อย!');
      setSaveLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8">
        <h2 className="text-xl font-bold mb-4 text-slate-800">ค้นหาสูตรทันใจ</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={menuName} 
            onChange={e => setMenuName(e.target.value)} 
            placeholder="เช่น ต้มยำกุ้ง, กะเพราไก่ไข่ดาว..." 
            className="flex-grow px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-900 font-medium focus:ring-2 focus:ring-orange-200 transition-all" 
          />
          <button onClick={fetchRecipe} disabled={loading} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-md">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'ค้นหาสูตร'}
          </button>
        </div>
      </div>

      {showResult && (
        <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in border border-slate-100">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
            <div>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">AI GENERATED</span>
              <h3 className="font-bold text-2xl text-slate-900">{extractedData?.title}</h3>
            </div>
            <button onClick={handleSaveToLocal} disabled={saveLoading} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-orange-600 transition-all">
              {saveLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-heart mr-2"></i>}
              บันทึกเก็บไว้
            </button>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap text-base text-slate-900 font-light leading-relaxed border border-slate-100">
            {aiResult.replace(/\[\/?TITLE\]|\[\/?STYLE\]|\[\/?INGREDIENTS\]|\[\/?METHOD\]/g, '')}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickRecipe;