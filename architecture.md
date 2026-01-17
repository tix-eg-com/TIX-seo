# SouqSEO Architecture & Roadmap

## 1. Technical Architecture

### Frontend (The Merchant Touchpoint)
*   **Recommendation:** **React Native** (if mobile app priority) or **React PWA** (Progressive Web App).
*   **Reasoning:** React ecosystem offers the fastest iteration speed. For this prototype, we used React Web (PWA ready). A PWA avoids app store friction for small merchants.
*   **Styling:** Tailwind CSS for rapid UI development and consistent "clean" aesthetics.

### Backend (The Brain)
*   **Recommendation:** **Python (FastAPI)** or **Node.js (Express)**.
*   **Reasoning:** Python is superior for future AI integration if you decide to host custom models. However, since we are using Gemini API, a lightweight Node.js wrapper or even a Serverless (Firebase Functions/AWS Lambda) architecture is best to reduce cost.
*   **Database:** PostgreSQL (Product data) + Redis (Rate limiting/Caching).

### AI Stack (The "GEO" Core)
*   **Text/Logic:** **Google Gemini 2.5 Flash**. It performs exceptionally well on Arabic nuances and is cost-effective for high volume.
*   **Image Processing:** 
    *   *White Background:* **Photoroom API** (Industry standard) or **Gemini 2.5 Flash Image**.
    *   *Lifestyle:* **Gemini 2.5 Flash Image** or **Stability AI**.
*   **Geolocation:** Browser Geolocation API + Google Maps Place API for hyper-local targeting validation.

## 2. The "GEO" (Generative Engine Optimization) Strategy
(Implemented in `services/geminiService.ts`)

**Definition:** Optimizing content to rank in **AI Overviews (SGE, Gemini, ChatGPT)** rather than just traditional search links.

*   **Persona:** "GEO & Egyptian Market Specialist".
*   **Tactics:**
    1.  **Direct Answers:** Start with a clear definition.
    2.  **Structure:** Use lists and headers (AI parsers love structure).
    3.  **Entity Salience:** Connect the product to specific entities (e.g., "Made in Damietta", "Compatible with Vodafone Cash").
    4.  **Trust:** High-quality Arabic (MSA + Masri).

## 3. Data Structure (JSON)
We structure the output to be immediately usable by the UI and strictly typed:

```json
{
  "metaTitle": "Samsung A54 5G - Best Price in Egypt | 128GB Black",
  "metaDescription": "Buy Samsung A54 now with lowest price in Cairo. Original warranty, fast shipping to Alexandria & Giza. Shop now!",
  "keywords": ["Samsung A54 price Egypt", "Samsung mobiles Cairo", "سامسونج A54"],
  "faqs": [
    { "question": "What is the price of Samsung A54 in Egypt?", "answer": "..." }
  ]
}
```

## 4. UI/UX Guidelines for Non-Tech Merchants
1.  **One Thumb Rule:** Primary actions (Upload, Generate) must be reachable with one thumb.
2.  **Visual Feedback:** Use skeleton loaders and "Magic sparkles" animations during AI processing to hide latency.
3.  **Jargon Free:** Don't say "SEO Meta Description". Say "What shows up on Google".
4.  **Copy-Paste is King:** Merchants often sell on Facebook/Instagram/WooCommerce. Provide huge "Copy" buttons.