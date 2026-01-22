
import React, { useState, useEffect } from 'react';
import RecipeGenerator from './components/RecipeGenerator';
import QuickRecipe from './components/QuickRecipe';
import RecipeList from './components/RecipeList';
import RecipeCloudList from './components/RecipeCloudList';
import Header from './components/Header';
import { Recipe, ViewType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('generate');
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [cloudRecipes, setCloudRecipes] = useState<Recipe[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymeMOdoATF_dhkBDZvGTHkadcawjZ0W5dPISyQDR-4JZr0gJcKiI2OlraVcQZa3JI/exec';

  useEffect(() => {
    const localData = localStorage.getItem('my_saved_recipes');
    if (localData) {
      try {
        setSavedRecipes(JSON.parse(localData));
      } catch (e) {
        console.error("Failed to parse local recipes", e);
      }
    }
  }, []);

  const fetchCloudData = async () => {
    if (!SCRIPT_URL) return;
    setLoadingCloud(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCloudRecipes(data);
      }
    } catch (error) {
      console.error("Error fetching cloud data:", error);
    } finally {
      setLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (view === 'cloud') {
      fetchCloudData();
    }
  }, [view]);

  const handleSaveToLocal = (recipe: Recipe) => {
    const exists = savedRecipes.some(r => r.title === recipe.title && r.submitter === recipe.submitter);
    if (exists) {
      alert('คุณบันทึกสูตรนี้ไว้เรียบร้อยแล้ว');
      return;
    }
    const newSaved = [recipe, ...savedRecipes];
    setSavedRecipes(newSaved);
    localStorage.setItem('my_saved_recipes', JSON.stringify(newSaved));
  };

  const handleRemoveFromLocal = (index: number) => {
    if (window.confirm('ลบสูตรนี้ออกจากรายการส่วนตัว?')) {
      const newSaved = savedRecipes.filter((_, i) => i !== index);
      setSavedRecipes(newSaved);
      localStorage.setItem('my_saved_recipes', JSON.stringify(newSaved));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Kanit']">
      <Header setView={setView} activeView={view} />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {view === 'generate' && (
          <div className="animate-fade-in">
            <RecipeGenerator 
              scriptUrl={SCRIPT_URL} 
              onSave={(newRecipe) => {
                handleSaveToLocal(newRecipe);
                setView('saved');
              }} 
            />
          </div>
        )}

        {view === 'quick' && (
          <QuickRecipe 
            scriptUrl={SCRIPT_URL}
            onSave={(newRecipe) => {
              handleSaveToLocal(newRecipe);
            }} 
          />
        )}

        {view === 'saved' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <i className="fas fa-heart text-red-500 mr-2"></i>สูตรของฉัน
            </h2>
            <RecipeList 
              recipes={savedRecipes} 
              loading={false} 
              onRefresh={() => {}} 
              onRemove={handleRemoveFromLocal}
              viewType="saved"
            />
          </div>
        )}

        {view === 'cloud' && (
          <RecipeCloudList 
            recipes={cloudRecipes} 
            loading={loadingCloud} 
            onRefresh={fetchCloudData} 
          />
        )}
      </main>
      <footer className="bg-white border-t py-8 text-center mt-12 text-slate-400 text-xs">
        <p>© 2024 AI Chef Master - วิทยาลัยเทคนิค (คอมพิวเตอร์)</p>
      </footer>
    </div>
  );
};

export default App;
