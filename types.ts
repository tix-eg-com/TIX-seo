
export interface ProductInput {
  merchantId: string;
  name: string;
  description: string;
  image: File | null;
  imagePreviewUrl: string | null;
}

export type AnalysisStatus = 'approved' | 'rejected';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MerchantFeedback {
  summary: string;
  seo_score: number;
  geo_score: number;
  critical_issues: string[];
  clarification_needed: string[];
  recommendations: string[];
}

export interface TechnicalSpecs {
  brand?: string;
  model?: string;
  category?: string;
  material_or_build?: string;
  color?: string;
  origin?: string | null;
  [key: string]: string | null | undefined;
}

export interface SeoGeoExtras {
  people_also_ask: FaqItem[];
  focus_keywords: string[];
}

export interface ListingContent {
  h1_title: string;
  geo_trust_snippet: string;
  professional_description: string;
  about_this_item: string[];
  technical_specifications: TechnicalSpecs;
  maintenance_guide: string;
  seo_geo_extras: SeoGeoExtras;
}

export interface ProductAnalysisResponse {
  status: AnalysisStatus;
  merchant_feedback: MerchantFeedback;
  listing_content?: ListingContent;
  grounding_sources?: GroundingSource[];
}

export interface HistoryRecord {
  merchantId: string;
  productName: string;
  h1_title: string;
  description: string;
  timestamp: number;
}

export enum AppTab {
  SEO = 'SEO',
  IMAGES = 'IMAGES',
  HISTORY = 'HISTORY',
  ARCHITECTURE = 'ARCHITECTURE'
}
