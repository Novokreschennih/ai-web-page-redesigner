
export interface DesignVariation {
  name: string;
  html: string;
}

export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash';

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalCode: string;
  style: string;
  model: GeminiModel;
  designs: DesignVariation[];
}
