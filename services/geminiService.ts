
import { GoogleGenAI } from "@google/genai";
import { ProductAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const TIX_SEO_ARCHITECT_INSTRUCTION = `
=== TIX SEO/GEO CORE MANDATE V7.0 (AEO & MOBILE OPTIMIZED) ===
أنت رئيس معمارية SEO و GEO في TIX. مهمتك إنتاج محتوى مضغوط، قوي، وفريد تماماً لكل تاجر.

=== القواعد الهيكلية الجديدة (إلزامية) ===

1. مقتطف GEO (geo_trust_snippet):
- الطول: 2-3 جمل فقط (ماكس 45 كلمة).
- الصيغة: إجابة مباشرة على "ما هو هذا المنتج وما يميزه؟".
- القاعدة الذهبية: ابدأ بالقيمة المضافة فوراً. ممنوع التكرار مثل "حقيبة X هي حقيبة..". 
- التنسيق: [اسم المنتج] + [الخامة] المصمم لـ [الاستخدام الرئيسي] يتميز بـ [الميزة التقنية الأهم].

2. الوصف الاحترافي (Professional Description):
- التنسيق: يجب تقسيم النص إلى 3 فقرات قصيرة جداً (جملتان لكل فقرة).
- الهدف: تحسين القراءة السريعة (Scanability) على الموبايل.
- ادمج الكلمات المفتاحية (Keywords) داخل السياق بشكل طبيعي (Natural Language Processing).

3. الأسئلة الشائعة (FAQ):
- يجب توليد 3 أسئلة شائعة مع إجابات صريحة وقصيرة (30 كلمة للإجابة).
- الإجابة يجب أن تكون تحت السؤال مباشرة بصيغة قابلة للاقتباس.

4. الكلمات المفتاحية (Focus Keywords):
- قم بتوليد 10-12 كلمة مفتاحية قوية (ماركة، مواصفات، سعر، جودة).
- **ملاحظة:** سيتم إخفاء هذه القائمة عن المستخدم، لذا ادمجها في النص الأساسي أيضاً.

=== قواعد الذاكرة وعدم التكرار ===
- إذا تم تزويدك بـ "نصوص سابقة" (previous_versions)، غيّر "الزاوية التسويقية" (مثلاً: من التركيز على السعر إلى التركيز على المتانة أو الرفاهية).

=== التنسيق المطلوب (JSON) ===
{
  "status": "approved" | "rejected",
  "merchant_feedback": {
    "summary": "...",
    "seo_score": 0-100,
    "geo_score": 0-100,
    "critical_issues": [],
    "clarification_needed": [],
    "recommendations": []
  },
  "listing_content": {
    "h1_title": "...",
    "geo_trust_snippet": "...",
    "professional_description": "فقرة 1...\n\nفقرة 2...\n\nفقرة 3...",
    "about_this_item": ["...", "...", "...", "...", "..."],
    "technical_specifications": { 
        "brand": "...",
        "model": "...",
        "category": "...",
        "material_or_build": "...",
        "color": "..."
    },
    "maintenance_guide": "...",
    "seo_geo_extras": {
      "people_also_ask": [{ "question": "...", "answer": "..." }],
      "focus_keywords": ["...", "..."]
    }
  }
}
`;

export const generateSeoContent = async (
  name: string,
  description: string,
  imageFile: File | null,
  previousVersions: string[] = []
): Promise<ProductAnalysisResponse> => {
  try {
    let visualContext = "";
    if (imageFile) {
      const base64Data = await fileToBase64(imageFile);
      const visionResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: imageFile.type, data: base64Data } },
            { text: "Detailed technical analysis for merchant listing. Focus on brand, materials, and unique selling points." }
          ]
        }]
      });
      visualContext = visionResponse.text || "";
    }

    const previousVersionsText = previousVersions.length > 0 
      ? `PREVIOUS OUTPUTS TO AVOID: \n${previousVersions.join('\n---\n')}`
      : "First time generating for this product.";

    const promptText = `
      MERCHANT DATA:
      Name: ${name}
      Notes: ${description}
      Visual: ${visualContext}
      
      ${previousVersionsText}
      
      TASK: Generate high-intent SEO/GEO content using Mandate V7.0. Integrate high-intent keywords like (سعر، أفضل، قوي، ماركة، مواصفات).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        systemInstruction: TIX_SEO_ARCHITECT_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      }
    });

    let cleanText = response.text.trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    const result = JSON.parse(jsonMatch[0]);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    result.grounding_sources = groundingChunks?.flatMap(c => c.web ? [{ title: c.web.title, uri: c.web.uri }] : []) || [];
    
    return result as ProductAnalysisResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateLifestyleImage = async (file: File, context: string): Promise<string> => {
  const base64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: `Professional product lifestyle shot: ${context}` },
        { inlineData: { mimeType: file.type, data: base64 } }
      ]
    }
  });
  const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imgPart?.inlineData) throw new Error("Image generation failed");
  return `data:image/png;base64,${imgPart.inlineData.data}`;
};

export const generateCleanBackground = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: "Studio product shot on solid #FFFFFF white background, sharp focus." },
        { inlineData: { mimeType: file.type, data: base64 } }
      ]
    }
  });
  const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imgPart?.inlineData) throw new Error("Background cleanup failed");
  return `data:image/png;base64,${imgPart.inlineData.data}`;
};
