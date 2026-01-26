
import React, { useState, useEffect } from 'react';
import { ProductInput, ProductAnalysisResponse, AppTab, HistoryRecord } from './types';
import { ProductForm } from './components/ProductForm';
import { SeoResultCard } from './components/SeoResultCard';
import { ImageGenerator } from './components/ImageGenerator';
import { generateSeoContent } from './services/geminiService';
import { BookOpenIcon, TagIcon, PhotoIcon, ArrowPathIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SEO);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  
  const [productInput, setProductInput] = useState<ProductInput>({
    merchantId: localStorage.getItem('tix_merchant_name') || '',
    name: '',
    description: '',
    image: null,
    imagePreviewUrl: null
  });

  const [seoResult, setSeoResult] = useState<ProductAnalysisResponse | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tix_generation_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save merchant ID preference
  useEffect(() => {
    if (productInput.merchantId) {
      localStorage.setItem('tix_merchant_name', productInput.merchantId);
    }
  }, [productInput.merchantId]);

  const handleSeoGeneration = async () => {
    setLoading(true);
    try {
      // Get previous versions for this merchant and product to avoid repetition
      const previousVersions = history
        .filter(h => h.merchantId === productInput.merchantId && h.productName === productInput.name)
        .map(h => h.description)
        .slice(0, 3);

      const result = await generateSeoContent(
        productInput.name,
        productInput.description,
        productInput.image,
        previousVersions
      );

      setSeoResult(result);

      // Save to history if approved
      if (result.status === 'approved' && result.listing_content) {
        const newRecord: HistoryRecord = {
          merchantId: productInput.merchantId,
          productName: productInput.name,
          h1_title: result.listing_content.h1_title,
          description: result.listing_content.professional_description,
          timestamp: Date.now(),
        };
        const updatedHistory = [newRecord, ...history].slice(0, 50); // Keep last 50
        setHistory(updatedHistory);
        localStorage.setItem('tix_generation_history', JSON.stringify(updatedHistory));
      }

    } catch (error) {
      console.error(error);
      alert("خطأ في توليد المحتوى. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setProductInput(prev => ({ ...prev, name: '', description: '', image: null, imagePreviewUrl: null }));
    setSeoResult(null);
    setActiveTab(AppTab.SEO);
  };

  const clearHistory = () => {
    if (window.confirm("هل تريد مسح سجل التاجر بالكامل؟")) {
      setHistory([]);
      localStorage.removeItem('tix_generation_history');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 arabic-text">
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
        
        <div className="flex mb-6 bg-slate-200 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide" dir="rtl">
            <button 
                onClick={() => setActiveTab(AppTab.SEO)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.SEO ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
            >
                <TagIcon className="h-4 w-4" /> المحتوى
            </button>
            <button 
                onClick={() => setActiveTab(AppTab.IMAGES)}
                disabled={!productInput.image}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.IMAGES ? 'bg-white shadow text-emerald-700' : 'text-slate-500 disabled:opacity-50'}`}
            >
                <PhotoIcon className="h-4 w-4" /> الصور
            </button>
            <button 
                onClick={() => setActiveTab(AppTab.HISTORY)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.HISTORY ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
            >
                <ClockIcon className="h-4 w-4" /> السجل
            </button>
             <button 
                onClick={() => setActiveTab(AppTab.ARCHITECTURE)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === AppTab.ARCHITECTURE ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
            >
                <BookOpenIcon className="h-4 w-4" /> الدليل
            </button>
        </div>

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

          {activeTab === AppTab.HISTORY && (
            <div className="space-y-4" dir="rtl">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><ClockIcon className="h-5 w-5 text-emerald-600" /> سجل عمليات التاجر</h3>
                <button onClick={clearHistory} className="text-xs text-red-500 hover:underline">مسح السجل</button>
              </div>
              
              {history.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>لا يوجد تاريخ عمليات بعد.</p>
                </div>
              ) : (
                history.map((record, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 transition">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] text-slate-400">{new Date(record.timestamp).toLocaleString('ar-EG')}</span>
                       <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 flex items-center gap-1">
                         <UserCircleIcon className="h-3 w-3" /> {record.merchantId || "تاجر عام"}
                       </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{record.productName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{record.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === AppTab.ARCHITECTURE && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-right" dir="rtl">
                <h3 className="font-bold text-lg mb-4">ذاكرة TIX الذكية</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  تم تطوير هذا النظام لضمان **التفرد الرقمي**. عندما يقوم التاجر بطلب وصف لنفس المنتج مرتين، يقوم النظام بـ:
                </p>
                <ul className="list-disc pr-5 space-y-2 text-sm text-slate-600">
                  <li>استرجاع آخر 3 نسخ تم إنتاجها لنفس التاجر.</li>
                  <li>تمرير هذه النسخ لنموذج Gemini كـ "نسخ محظورة".</li>
                  <li>إصدار أمر بتغيير زاوية التسويق (Angle Shift) لضمان عدم التكرار.</li>
                </ul>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
