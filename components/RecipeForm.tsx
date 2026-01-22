
import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeFormProps {
  scriptUrl: string;
  onComplete: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ scriptUrl, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fixed: Added year, method, media, and style to satisfy the Recipe interface requirements
  const [formData, setFormData] = useState<Recipe>({
    submitter: '',
    department: 'ช่างคอมพิวเตอร์ ปวช.1',
    year: 'ปวช.1',
    title: '',
    ingredients: '',
    instructions: '',
    method: 'Manual',
    media: 'N/A',
    style: 'Thai',
    sourceUrl: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Replaced literal string comparison with generic check to avoid TypeScript error
    if (!scriptUrl || scriptUrl.includes('YOUR_APPS_SCRIPT')) {
      alert('กรุณาตั้งค่า Web App URL ใน App.tsx ก่อนใช้งาน');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        // Fix: Explicitly cast value to string to resolve 'unknown' type error on line 39
        body.append(key, (value as string) || '');
      });

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      alert('บันทึกข้อมูลสูตรอาหารสำเร็จ!');
      onComplete();
    } catch (error) {
      console.error('Error submitting:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
      <div className="bg-orange-500 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <i className="fas fa-camera-retro mr-3"></i>
          แบ่งปันสูตรอาหารของคุณ
        </h2>
        <p className="opacity-90 font-light">ข้อมูลของคุณจะถูกบันทึกลงใน Google Sheets โดยตรง</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้แบ่งปัน</label>
            <input 
              required
              type="text"
              value={formData.submitter}
              onChange={(e) => setFormData({...formData, submitter: e.target.value})}
              placeholder="ชื่อ-นามสกุล"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ระดับชั้น</label>
            <select 
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option>ช่างคอมพิวเตอร์ ปวช.1</option>
              <option>ช่างคอมพิวเตอร์ ปวช.2</option>
              <option>ช่างคอมพิวเตอร์ ปวช.3</option>
              <option>ช่างเทคนิคคอมพิวเตอร์ ปวส.1</option>
              <option>ช่างเทคนิคคอมพิวเตอร์ ปวส.2</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อเมนูอาหาร</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="เช่น แกงเขียวหวานไก่"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ลิงก์รูปภาพเมนู (URL)</label>
            <input 
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://example.com/food.jpg"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ลิงก์อ้างอิงสูตร (Wongnai/YouTube)</label>
          <input 
            type="url"
            value={formData.sourceUrl || ''}
            onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
            placeholder="https://www.wongnai.com/..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">วัตถุดิบ (แยกด้วยเครื่องหมาย , )</label>
          <textarea 
            required
            rows={2}
            value={formData.ingredients}
            onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
            placeholder="ไก่ 1/2 ตัว, พริกแกงเขียวหวาน 100ก."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ขั้นตอนการทำ</label>
          <textarea 
            required
            rows={4}
            value={formData.instructions}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            placeholder="1. ผัดพริกแกงกับกะทิ... 2. ใส่ไก่ลงไปผัด..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
            isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i> กำลังบันทึก...</>
          ) : 'ส่งสูตรอาหารเข้า Google Sheets'}
        </button>
      </form>
    </div>
  );
};

export default RecipeForm;
