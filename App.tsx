
import React, { useState } from 'react';
import { ProductInput, ProductAnalysisResponse, AppTab } from './types';
import { ProductForm } from './components/ProductForm';
import { SeoResultCard } from './components/SeoResultCard';
import { ImageGenerator } from './components/ImageGenerator';
import { generateSeoContent } from './services/geminiService';
import { BookOpenIcon, TagIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SEO);
  const [loading, setLoading] = useState(false);
  
  const [productInput, setProductInput] = useState<ProductInput>({
    name: '',
    description: '',
    image: null,
    imagePreviewUrl: null
  });

  const [seoResult, setSeoResult] = useState<ProductAnalysisResponse | null>(null);

  const handleSeoGeneration = async () => {
    setLoading(true);
    try {
      const result = await generateSeoContent(
        productInput.name,
        productInput.description,
        productInput.image
      );
      setSeoResult(result);
    } catch (error) {
      console.error(error);
      alert("خطأ في توليد المحتوى. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setProductInput({ name: '', description: '', image: null, imagePreviewUrl: null });
    setSeoResult(null);
    setActiveTab(AppTab.SEO);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 arabic-text">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10" dir="rtl">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <TagIcon className="h-5 w-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">TIX <span className="text-emerald-600">SEO</span></h1>
          </div>
          {seoResult && (
            <button onClick={resetApp} className="text-sm text-slate-500 font-medium hover:text-emerald-600 flex items-center gap-1">
              <ArrowPathIcon className="h-4 w-4" /> منتج جديد
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-slate-200 p-1 rounded-xl" dir="rtl">
            <button 
                onClick={() => setActiveTab(AppTab.SEO)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.SEO ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
            >
                <TagIcon className="h-4 w-4" /> جودة المحتوى
            </button>
            <button 
                onClick={() => setActiveTab(AppTab.IMAGES)}
                disabled={!productInput.image}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.IMAGES ? 'bg-white shadow text-emerald-700' : 'text-slate-500 disabled:opacity-50'}`}
            >
                <PhotoIcon className="h-4 w-4" /> ستوديو الصور
            </button>
             <button 
                onClick={() => setActiveTab(AppTab.ARCHITECTURE)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.ARCHITECTURE ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
            >
                <BookOpenIcon className="h-4 w-4" /> الدليل
            </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          
          {activeTab === AppTab.SEO && (
            <>
              {(!seoResult || seoResult.status === 'rejected') && (
                <div className="space-y-6">
                   {seoResult && seoResult.status === 'rejected' && (
                      <SeoResultCard data={seoResult} />
                   )}
                   <ProductForm 
                    input={productInput} 
                    setInput={setProductInput} 
                    onSubmit={handleSeoGeneration} 
                    loading={loading} 
                  />
                </div>
              )}

              {seoResult && seoResult.status === 'approved' && (
                <SeoResultCard data={seoResult} />
              )}
            </>
          )}

          {activeTab === AppTab.IMAGES && productInput.image && (
            <ImageGenerator originalFile={productInput.image} />
          )}

          {activeTab === AppTab.ARCHITECTURE && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 prose prose-slate prose-sm max-w-none text-right" dir="rtl">
                <h3 className="font-bold">نظرة عامة على معمارية TIX</h3>
                <p>يرجى الرجوع إلى ملف <code>architecture.md</code> لمزيد من التفاصيل التقنية حول استراتيجية GEO و AEO.</p>
                <p>تم تصميم هذا المحرك لخدمة التجار في الأسواق الناطقة بالعربية مع تركيز خاص على دقة البيانات وتجربة المستخدم.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
