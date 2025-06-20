export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface VocabularyEntry {
  id: number;
  english: string;
  chinese: string;
}

export interface WordTeachingData {
  english: string;
  chineseCoreMeaning: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  challengePrompt: string;
  isCoreVocab: boolean;
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  teachingCard?: WordTeachingData;
  isLoading?: boolean;
  isError?: boolean;
  isGreeting?: boolean;
  timestamp: number;
}

// For data returned by Gemini Service for teaching a word
export interface GeminiTeachingDetails {
  partOfSpeech: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  challengePrompt: string;
}

// For data returned by Gemini Service for feedback
export interface GeminiFeedback {
  feedbackText: string;
}
