
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

/**
 * TIX SEO/GEO CORE MANDATE - VERSION 5.0
 * Optimized for Answer Engine Optimization (AEO) and Mobile Scanability.
 */
const TIX_SEO_ARCHITECT_INSTRUCTION = `
=== TIX SEO/GEO CORE MANDATE ===
أنت رئيس معمارية SEO و GEO و AEO في منصة TIX. مهمتك إنتاج محتوى يتصدر "نتائج البحث الذكية" (Google AI Overviews) ويجيب مباشرة على أسئلة المتسوقين.

=== القواعد غير القابلة للتفاوض ===

1. مقتطف GEO المميز (geo_trust_snippet):
- الهدف: أن يظهر كإجابة مباشرة (Direct Answer) في بحث جوجل.
- الهيكل: 2–3 جمل فقط. جملة تعريفية واحدة قوية ومضغوطة (النوع + الخامة + الاستخدام + الميزة الأساسية) متبوعة بـ 1-2 حقيقة تقنية.
- تجنب التكرار مثل "حقيبة توت هي حقيبة..."؛ ادخل في التفاصيل مباشرة.
- مثال: "حقيبة الظهر ASUS ROG المصنوعة من النايلون المقاوم للماء توفر حماية فائقة للابتوب الألعاب بفضل بطانتها السميكة وجيوبها المتعددة المنظمة."

2. الوصف الاحترافي (Professional Description):
- الطول: 200–250 كلمة.
- التنسيق: **إلزامي** تقسيم الوصف إلى 3 فقرات قصيرة على الأقل. استخدم جمل بسيطة ومباشرة لتحسين القراءة على الموبايل (Scanability).
- افصل بين الفقرات بـ \n\n.

3. الأسئلة الشائعة (FAQ):
- كل عنصر في people_also_ask يجب أن يحتوي على "سؤال" و "إجابة صريحة" (30-50 كلمة).
- يجب أن تكون الإجابة مفيدة لدرجة أن جوجل يقتبسها كـ "Featured Snippet".

4. سياسة اللغة والكلمات المفتاحية:
- اللغة: العربية (مع ماركات ومصطلحات تقنية بالإنجليزية).
- الكلمات المفتاحية: ادمج 10-12 كلمة مفتاحية طبيعياً داخل المحتوى. **لا تضعها في قائمة منفصلة**.

5. بنية العنوان (H1):
- الطول: 80–120 حرفاً.
- التنسيق: [الماركة] [الموديل] | [المواصفة 1] | [المواصفة 2] | [التصنيف].

6. الصيانة والمحاذير:
- الإلكترونيات: ركز على الأتربة والحرارة والسوائل (ممنوع ذكر الغسيل).
- المحظورات: يمنع استخدام "الخيار الأمثل"، "أطلق العنان"، "ارتقِ بمستواك"، "بلا مثيل".

7. الحياد الجغرافي:
- يمنع ذكر "مصر" أو "Egypt" صراحة.

=== التنسيق المطلوب (JSON) ===
{
  "status": "approved" | "rejected",
  "merchant_feedback": {
    "summary": "ملخص بالعربية",
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
    "technical_specifications": { ... },
    "maintenance_guide": "...",
    "seo_geo_extras": {
      "people_also_ask": [{ "question": "...", "answer": "..." }]
    }
  }
}
`;

export const generateSeoContent = async (
  name: string,
  description: string,
  imageFile: File | null
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
            { text: "Analyze product: Category, Brand, Material, Color, Specs. English summary." }
          ]
        }]
      });
      visualContext = visionResponse.text || "";
    }

    const promptText = `
      INPUT DATA:
      Name: ${name}
      Notes: ${description}
      Visual: ${visualContext}
      
      TASK: Execute TIX CORE MANDATE VERSION 5.0. Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        systemInstruction: TIX_SEO_ARCHITECT_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
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
        { text: `High-end lifestyle product photography: ${context}` },
        { inlineData: { mimeType: file.type, data: base64 } }
      ]
    }
  });
  const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imgPart?.inlineData) throw new Error("Image gen failed");
  return `data:image/png;base64,${imgPart.inlineData.data}`;
};

export const generateCleanBackground = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: "Product shot on pure #FFFFFF white background, professional studio lighting." },
        { inlineData: { mimeType: file.type, data: base64 } }
      ]
    }
  });
  const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imgPart?.inlineData) throw new Error("Image gen failed");
  return `data:image/png;base64,${imgPart.inlineData.data}`;
};
