
export interface Recipe {
  id?: string;
  timestamp?: string;
  submitter: string;
  year: string;
  department: string;
  title: string;
  ingredients: string;
  method: string;
  media: string;
  style: string;
  instructions: string;
  sourceUrl?: string;
  imageUrl?: string;
}

export type ViewType = 'generate' | 'saved' | 'cloud' | 'quick';
