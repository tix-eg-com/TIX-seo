
import { ChevronDownIcon, CheckBadgeIcon, ShieldCheckIcon, HandThumbDownIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon, SparklesIcon, GlobeAltIcon, ArrowTopRightOnSquareIcon, ChatBubbleLeftRightIcon, LightBulbIcon, WrenchScrewdriverIcon, CodeBracketIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ProductAnalysisResponse } from '../types';

interface SeoResultCardProps {
  data: ProductAnalysisResponse;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="text-slate-500 hover:text-emerald-700 text-xs font-medium flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md transition-colors"
    >
      <ClipboardDocumentIcon className="h-3 w-3" />
      {copied ? 'تم النسخ' : 'نسخ'}
    </button>
  );
};

const specKeyMap: Record<string, string> = {
  brand: "العلامة التجارية",
  model: "الموديل",
  category: "التصنيف",
  material_or_build: "الخامة / التصنيع",
  color: "اللون",
  origin: "بلد المنشأ",
};

const renderSpecValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
  }
  return String(value);
};

export const SeoResultCard: React.FC<SeoResultCardProps> = ({ data }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const technicalDerivedData = useMemo(() => {
    if (!data.listing_content) return null;
    const { h1_title, professional_description, technical_specifications } = data.listing_content;
    const url_slug = h1_title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
    const meta_description = professional_description.length > 155 
        ? professional_description.substring(0, 152) + "..." 
        : professional_description;

    const schema_json_ld = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": h1_title,
      "description": meta_description,
      "brand": { "@type": "Brand", "name": technical_specifications.brand || "Generic" },
      "sku": technical_specifications.model || "N/A"
    };
    return { url_slug, meta_description, schema_json_ld };
  }, [data.listing_content]);

  if (data.status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 animate-fade-in text-right" dir="rtl">
         <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mb-4"><HandThumbDownIcon className="h-8 w-8 text-red-600" /></div>
            <h3 className="text-red-900 font-bold text-lg mb-2">تم رفض القائمة</h3>
            <p className="text-red-700 text-sm font-medium">لم يستوفِ المنتج معايير الجودة الخاصة بـ TIX.</p>
         </div>
         {data.merchant_feedback.critical_issues.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-red-100 mb-4 shadow-sm">
                <h4 className="font-bold text-red-800 mb-3 flex items-center justify-end gap-2">مشاكل حرجة <ExclamationTriangleIcon className="h-5 w-5" /></h4>
                <ul className="list-disc pr-5 space-y-1 text-red-700 text-sm">
                    {data.merchant_feedback.critical_issues.map((issue, idx) => (<li key={idx}>{issue}</li>))}
                </ul>
            </div>
         )}
      </div>
    );
  }

  const listing = data.listing_content;
  const feedback = data.merchant_feedback;
  if (!listing || !technicalDerivedData) return null;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      
      {/* Merchant Analysis Banner */}
      <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 right-0 p-4 opacity-10"><SparklesIcon className="h-24 w-24" /></div>
        <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
                 <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-1">تقرير مهندس TIX الذكي</h3>
                 <div className="flex gap-2">
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">SEO: {feedback.seo_score}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/50">GEO: {feedback.geo_score}</span>
                 </div>
            </div>
            <p className="text-base font-bold leading-relaxed arabic-text">{feedback.summary}</p>
        </div>
      </div>

      {/* Title & GEO Answer */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
           <div className="flex justify-between items-center mb-3" dir="rtl"><span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">عنوان المنتج الاحترافي (H1)</span><CopyButton text={listing.h1_title} /></div>
           <h1 className="text-xl font-bold text-slate-900 arabic-text text-right leading-tight" dir="rtl">{listing.h1_title}</h1>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
            <div className="flex justify-between items-center mb-2" dir="rtl"><h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4" /> مقتطف GEO (إجابة AI المباشرة)</h4><CopyButton text={listing.geo_trust_snippet} /></div>
            <p className="text-slate-800 text-sm font-medium arabic-text text-right leading-loose" dir="rtl">{listing.geo_trust_snippet}</p>
        </div>
      </div>

      {/* Description & Features */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
         <div className="space-y-6 arabic-text text-right" dir="rtl">
             <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-emerald-100 pb-2 inline-block">الوصف التسويقي</h3>
                <div className="text-slate-700 leading-8 text-sm whitespace-pre-line">
                   {listing.professional_description}
                </div>
             </div>
             
             <div className="pt-4">
                 <h4 className="text-sm font-bold text-slate-800 mb-4">أبرز المواصفات:</h4>
                 <ul className="space-y-3">
                    {listing.about_this_item.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                            <CheckBadgeIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-6"><ReactMarkdown>{point}</ReactMarkdown></span>
                        </li>
                    ))}
                 </ul>
             </div>
         </div>
      </div>

      {/* Specs & FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-right"><h4 className="text-xs font-bold text-slate-700 uppercase">البيانات التقنية</h4></div>
             <div className="divide-y divide-slate-100" dir="rtl">
                {Object.entries(listing.technical_specifications).map(([key, value], idx) => (
                    <div key={idx} className="flex hover:bg-slate-50">
                        <div className="w-1/3 p-3 text-xs text-slate-500 bg-slate-50/50 arabic-text border-l border-slate-100">{specKeyMap[key] || key}</div>
                        <div className="w-2/3 p-3 text-xs text-slate-900 font-bold arabic-text">{renderSpecValue(value)}</div>
                    </div>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             {listing.seo_geo_extras?.people_also_ask?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                   <div className="flex items-center justify-end gap-2 mb-4"><h4 className="text-xs font-bold text-slate-800 uppercase">أسئلة شائعة (لتقوية AEO)</h4><ChatBubbleLeftRightIcon className="h-4 w-4 text-slate-400" /></div>
                   <div className="space-y-4" dir="rtl">
                      {listing.seo_geo_extras.people_also_ask.map((faq, idx) => (
                         <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                               <QuestionMarkCircleIcon className="h-4 w-4 text-emerald-600" /> {faq.question}
                            </div>
                            <div className="text-xs text-slate-600 leading-relaxed pr-6">{faq.answer}</div>
                         </div>
                      ))}
                   </div>
                </div>
             )}
             
             {listing.maintenance_guide && (
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-4" dir="rtl">
                   <div className="flex items-center gap-2 mb-2 text-amber-700"><WrenchScrewdriverIcon className="h-4 w-4" /><span className="text-xs font-bold uppercase">تعليمات العناية</span></div>
                   <p className="text-xs text-slate-700 arabic-text leading-5">{listing.maintenance_guide}</p>
                </div>
             )}
          </div>
      </div>

      {/* Technical Suite (Hidden from user, available for SEO) */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 shadow-inner">
           <div className="flex justify-between items-center mb-3" dir="rtl"><span className="text-xs font-bold text-slate-500 flex items-center gap-1"><CodeBracketIcon className="h-3 w-3" /> لوحة بيانات السيو التقني (للكود)</span></div>
           <div className="grid grid-cols-1 gap-3">
               <div>
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400" dir="rtl">URL Slug (الرابط الدائم)</div>
                  <div className="bg-white border border-slate-200 p-2 rounded text-[11px] text-emerald-700 font-mono">/{technicalDerivedData.url_slug}</div>
               </div>
               <div>
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400" dir="rtl">Schema JSON-LD (البيانات المهيكلة) <CopyButton text={JSON.stringify(technicalDerivedData.schema_json_ld)} /></div>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[9px] overflow-x-auto" dir="ltr">{JSON.stringify(technicalDerivedData.schema_json_ld, null, 2)}</pre>
               </div>
           </div>
      </div>
    </div>
  );
};
