import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeGeneratorProps {
  scriptUrl: string;
  onSave: (recipe: Recipe) => void;
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ scriptUrl, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedRecipes, setGeneratedRecipes] = useState<Partial<Recipe>[]>([]);
  
  const [formData, setFormData] = useState({
    submitter: '',
    year: 'ปวช.1',
    department: 'แผนกเทคนิคคอมพิวเตอร์',
    ingredients: '',
    method: 'ทอด',
    media: 'น้ำมัน',
    style: 'ไทย'
  });

  const departments = [
    "แผนกช่างยนต์", "แผนกช่างกลโรงงาน", "แผนกช่างเชื่อมโลหะ", "แผนกช่างไฟฟ้า",
    "แผนกช่างอิเล็กทรอนิกส์", "แผนกเมคคาทรอนิกส์", "แผนกเทคนิคคอมพิวเตอร์",
    "แผนกการบัญชี", "แผนกการตลาด", "แผนกธุรกิจค้าปลีก", "แผนกโลจิสติกส์",
    "แผนกธุรกิจดิจิทัล", "แผนกการโรงแรม", "แผนกการท่องเที่ยว", "แผนกอาหารและโภชนาการ"
  ];

  const getSection = (text: string, startMarker: string, endMarker?: string) => {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return '';
    const startPos = startIdx + startMarker.length;
    const endIdx = endMarker ? text.indexOf(endMarker, startPos) : text.length;
    return text.substring(startPos, endIdx === -1 ? text.length : endIdx).trim();
  };

  const generateRecipes = async () => {
    // ดึงค่าจาก process.env ที่ Vite ฉีดเข้ามาให้
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey.length < 10) {
      alert('⚠️ ไม่พบกุญแจ AI!\n\nวิธีแก้:\n1. หากรันในเครื่อง: ตรวจสอบไฟล์ .env ว่าพิมพ์ API_KEY=... (ห้ามมีเว้นวรรค)\n2. หากรันบน Netlify: ไปที่ Site Configuration > Environment variables แล้วเพิ่ม API_KEY\n3. สำคัญ: หลังจากแก้ .env ต้องปิด Terminal แล้วรัน npm run dev ใหม่');
      return;
    }

    if (!formData.submitter || !formData.ingredients) {
      alert('กรุณากรอกชื่อและวัตถุดิบให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `คุณคือเชฟที่เชี่ยวชาญ รังสรรค์เมนู 3 สูตรที่แตกต่างกันจากวัตถุดิบ: ${formData.ingredients} 
      โดยใช้วิธี: ${formData.method} และใช้ ${formData.media} เป็นตัวกลาง 
      สไตล์: ${formData.style}
      
      ตอบกลับด้วยรูปแบบนี้สำหรับทุกเมนู (รวม 3 ชุด):
      [START_RECIPE]
      [TITLE]ชื่อเมนู[/TITLE]
      [INGREDIENTS]รายการวัตถุดิบ[/INGREDIENTS]
      [METHOD]ขั้นตอนการทำ[/METHOD]
      [END_RECIPE]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const fullText = response.text || '';
      const recipeBlocks = fullText.split('[START_RECIPE]').filter(b => b.includes('[END_RECIPE]'));
      
      const parsedRecipes = recipeBlocks.slice(0, 3).map(block => ({
        title: getSection(block, '[TITLE]', '[/TITLE]'),
        ingredients: getSection(block, '[INGREDIENTS]', '[/INGREDIENTS]'),
        instructions: getSection(block, '[METHOD]', '[/METHOD]'),
        style: formData.style,
        method: formData.method,
        media: formData.media
      }));

      if (parsedRecipes.length === 0) throw new Error("AI ส่งข้อมูลกลับมาไม่ตรงรูปแบบ");
      
      setGeneratedRecipes(parsedRecipes);
      setStep(2);
    } catch (error: any) {
      console.error("AI Error:", error);
      alert(`เกิดข้อผิดพลาด: ${error.message || 'AI ไม่ตอบสนอง'}`);
    } finally {
      setLoading(false);
    }
  };

  const saveToSheet = async (recipe: Partial<Recipe>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('submitter', formData.submitter);
      params.append('year', formData.year);
      params.append('department', formData.department);
      params.append('title', recipe.title || "");
      params.append('ingredients', recipe.ingredients || "");
      params.append('instructions', recipe.instructions || "");
      params.append('style', recipe.style || "");

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      onSave({
        submitter: formData.submitter,
        year: formData.year,
        department: formData.department,
        title: recipe.title || "เมนูจาก AI",
        ingredients: recipe.ingredients || formData.ingredients,
        method: formData.method,
        media: formData.media,
        style: recipe.style || formData.style,
        instructions: recipe.instructions || '',
        timestamp: new Date().toLocaleString()
      });
      alert('บันทึกลงระบบสำเร็จ!');
    } catch (error) {
      alert('บันทึกผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">เลือกสูตรที่คุณชอบที่สุด</h2>
            <p className="text-slate-400 text-sm italic">รังสรรค์มาให้ 3 แบบ สำหรับเด็ก{formData.department}</p>
          </div>
          <button onClick={() => setStep(1)} className="px-6 py-2 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all">
            เริ่มใหม่
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {generatedRecipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col hover:shadow-2xl transition-all group">
              <div className="bg-slate-900 p-6 text-white text-center group-hover:bg-orange-600 transition-colors">
                <span className="text-[10px] font-bold text-orange-400 group-hover:text-white uppercase tracking-widest block mb-2">ทางเลือกที่ {index + 1}</span>
                <h3 className="text-xl font-bold leading-tight">{recipe.title}</h3>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">วัตถุดิบ</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{recipe.ingredients}</p>
                </div>
                <div className="flex-grow">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">ขั้นตอนการทำ</h4>
                  <div className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-6 leading-relaxed">
                    {recipe.instructions}
                  </div>
                </div>
                <button 
                  onClick={() => saveToSheet(recipe)} 
                  disabled={loading} 
                  className="mt-6 w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-600 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'เลือกบันทึกสูตรนี้'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
      <div className="bg-orange-500 p-8 text-white">
        <h2 className="text-2xl font-bold"><i className="fas fa-magic mr-2"></i> รังสรรค์เมนูอัจฉริยะ</h2>
        <p className="opacity-90 text-sm mt-1 font-light">กรอกวัตถุดิบ แล้ว AI จะสร้าง 3 เมนูให้คุณเลือก</p>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">ชื่อผู้รังสรรค์</label>
            <input 
              type="text" 
              placeholder="ระบุชื่อของคุณ" 
              value={formData.submitter} 
              onChange={e => setFormData({...formData, submitter: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-900 font-medium focus:ring-2 focus:ring-orange-200 transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">ระดับชั้น</label>
            <select 
              value={formData.year} 
              onChange={e => setFormData({...formData, year: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-orange-200 transition-all"
            >
              <option>ปวช.1</option>
              <option>ปวช.2</option>
              <option>ปวช.3</option>
              <option>ปวส.1</option>
              <option>ปวส.2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">แผนกวิชา</label>
            <select 
              value={formData.department} 
              onChange={e => setFormData({...formData, department: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-orange-200 transition-all"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">วัตถุดิบและเครื่องปรุงที่มี</label>
          <textarea 
            rows={3} 
            placeholder="เช่น ไข่ไก่ 2 ฟอง, กะหล่ำปลี, พริกแห้ง..." 
            value={formData.ingredients} 
            onChange={e => setFormData({...formData, ingredients: e.target.value})} 
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-900 font-light focus:ring-2 focus:ring-orange-200 transition-all" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">วิธีการหลัก</label>
            <div className="grid grid-cols-3 gap-1">
              {['ต้ม', 'นึ่ง', 'ทอด', 'ผัด', 'ย่าง', 'อบ'].map(m => (
                <button key={m} type="button" onClick={() => setFormData({...formData, method: m})} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${formData.method === m ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">ตัวกลาง (Media)</label>
            <div className="grid grid-cols-3 gap-1">
              {['น้ำมัน', 'เนย', 'น้ำ', 'กะทิ', 'ไม่ใช้'].map(media => (
                <button key={media} type="button" onClick={() => setFormData({...formData, media: media})} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${formData.media === media ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{media}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">สไตล์อาหาร</label>
            <select 
              value={formData.style} 
              onChange={e => setFormData({...formData, style: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none cursor-pointer focus:ring-2 focus:ring-orange-200 transition-all"
            >
              <option value="ไทย">ไทย (Thailand)</option>
              <option value="ญี่ปุ่น">ญี่ปุ่น (Japan)</option>
              <option value="จีน">จีน (China)</option>
              <option value="เกาหลี">เกาหลี (Korea)</option>
              <option value="อิตาลี">อิตาลี (Italy)</option>
              <option value="ฝรั่งเศส">ฝรั่งเศส (France)</option>
              <option value="อินเดีย">อินเดีย (India)</option>
              <option value="เม็กซิโก">เม็กซิโก (Mexico)</option>
              <option value="อเมริกา">อเมริกา (USA)</option>
            </select>
          </div>
        </div>

        <button onClick={generateRecipes} disabled={loading} className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl text-lg transition-all active:scale-95 disabled:bg-slate-300 hover:bg-orange-600">
          {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'เริ่มรังสรรค์ 3 สูตรพร้อมกัน'}
        </button>
      </div>
    </div>
  );
};

export default RecipeGenerator;