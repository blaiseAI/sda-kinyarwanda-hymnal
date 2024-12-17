export interface Hymn {
  number: string;
  title: {
    kinyarwanda: string;
    english: string;
  };
  verses: {
    count: number;
    text: Verse[];
    chorus: Chorus | null;
  };
  viewedAt?: Date;
  image?: string;
}

export interface Verse {
  verse: number;
  text: string;
}

export interface Chorus {
  kinyarwanda: string;
  subtext: string[];
}
