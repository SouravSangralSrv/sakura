
export enum Language {
  HINDI = 'Hindi',
  ENGLISH = 'English',
  HINGLISH = 'Hinglish'
}

export enum Gender {
  FEMALE = 'Female',
  MALE = 'Male'
}

export enum LLMProvider {
  GEMINI = 'Gemini (Cloud)',
  OLLAMA = 'Ollama (Local)'
}

export interface TranscriptionItem {
  sender: 'user' | 'vtuber';
  text: string;
  imageUrl?: string;
  timestamp: number;
}

export interface VTuberState {
  isSpeaking: boolean;
  isListening: boolean;
  emotion: 'happy' | 'thinking' | 'talking' | 'idle' | 'surprised' | 'sad';
  provider: LLMProvider;
}

export interface DocumentItem {
  id: string;
  name: string;
  content: string;
  size: number;
  isActive: boolean;
}

/**
 * Fix: Added ToolAction interface for command history logging.
 */
export interface ToolAction {
  id: string;
  name: string;
  args: any;
  timestamp: number;
}

/**
 * Fix: Added ModelItem interface for sprite/avatar management.
 */
export interface ModelItem {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
}

/**
 * Fix: Added VoiceProfile interface for voice cloning features.
 */
export interface VoiceProfile {
  id: string;
  name: string;
  description?: string;
  sampleUrl?: string;
  isCustom?: boolean;
}
