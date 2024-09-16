export interface Hymn {
  hymnTitle: string;
  hymnNumber: number;
  verses: string[];
  viewedAt?: Date; // Make viewedAt optional
  image?: string;
  // ... other properties
}
