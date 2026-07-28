export interface Word {
  word: string;
  definition: string;
  translations: string[];
  info?: string;
  filename: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  words: Word[];
}

export interface AudioState {
  Spanish: { [word: string]: HTMLAudioElement };
  english: { [word: string]: HTMLAudioElement };
}
