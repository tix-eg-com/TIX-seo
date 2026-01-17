
import React, { useRef } from 'react';
import { ProductInput } from '../types';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProductFormProps {
  input: ProductInput;
  setInput: React.Dispatch<React.SetStateAction<ProductInput>>;
  onSubmit: () => void;
  loading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ input, setInput, onSubmit, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setInput((prev) => ({ ...prev, image: file, imagePreviewUrl: url }));
    }
  };

  const removeImage = () => {
    setInput((prev) => ({ ...prev, image: null, imagePreviewUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 arabic-text" dir="rtl">
      <div className="space-y-6">
        
        {/* Image Upload */}
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            صورة المنتج (ضرورية للتحليل البصري)
          </label>
          
          {!input.imagePreviewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors h-48"
            >
              <PhotoIcon className="h-10 w-10 text-slate-400 mb-2" />
              <span className="text-slate-500 font-medium">اضغط لرفع صورة أو التصوير</span>
              <span className="text-xs text-slate-400 mt-1">يدعم JPG, PNG</span>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden h-48 w-full bg-slate-100 border border-slate-200">
              <img 
                src={input.imagePreviewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Text Inputs */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            اسم المنتج (بالعربية أو الإنجليزية)
          </label>
          <input
            type="text"
            value={input.name}
            onChange={(e) => setInput({ ...input, name: e.target.value })}
            placeholder="مثال: لابتوب أسوس تاف F15"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            ملاحظات إضافية أو وصف قصير
          </label>
          <textarea
            value={input.description}
            onChange={(e) => setInput({ ...input, description: e.target.value })}
            placeholder="مثال: حالة المنتج، أي مواصفات غير واضحة في الصورة..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !input.name || !input.image}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all transform active:scale-95
            ${loading || !input.name || !input.image 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري توليد القائمة السحرية...
            </span>
          ) : (
            'توليد قائمة بيع سحرية ✨'
          )}
        </button>
      </div>
    </div>
  );
};
