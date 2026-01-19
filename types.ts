
export interface Question {
  id: string;
  text: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Response {
  id: string;
  memberId: string;
  questionId: string;
  answer: string;
}

export type Frequency = 'weekly' | 'biweekly' | 'monthly';
export type CollationMode = 'ai' | 'verbatim';

export interface Edition {
  id: string;
  publishDate: string;
  headerImage?: string;
  introText?: string;
  narrativeText?: string;
  responses: Response[];
  collationMode: CollationMode;
  issueNumber: number;
}

export interface Loop {
  id: string;
  name: string;
  description: string;
  category: 'family' | 'friends' | 'work' | 'other';
  frequency: Frequency;
  members: Member[];
  questions: Question[];
  responses: Response[];
  editions: Edition[]; // New: Historical storage
  collationMode: CollationMode;
  lastGeneratedAt?: string;
  headerImage?: string;
  introText?: string;
  narrativeText?: string;
  nextSendDate?: string;
}

export type ViewState = 'dashboard' | 'editor' | 'newsletter' | 'landing' | 'public-read' | 'public-respond';
