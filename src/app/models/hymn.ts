export interface Hymn {
  hymnTitle: string;
  hymnNumber: number;
  verses: string[];
  [key: number]: any;
  viewedAt?: Date; // timestamp when the hymn was viewed
  image?: string; // path to the image
}
