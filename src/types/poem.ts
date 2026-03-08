export interface Poem {
  id: string;
  created: number;
  sourceText: string;
  sourceTitle?: string;
  selectedIndices: number[];
  finalPoem: string;
  wordCount: number;
}

export interface AppSettings {
  includeAttribution: boolean;
  includeWatermark: boolean;
}
