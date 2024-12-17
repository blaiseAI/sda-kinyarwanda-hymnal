import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Hymn } from '../models/hymn';
import { HymnService } from './hymn.service';
import { BehaviorSubject, Observable, from, map } from 'rxjs';

export interface Favourite {
  id: string;
  name: string;
  hymnIds: string[]; // Update to store hymn numbers as strings to match the new model
}

@Injectable({
  providedIn: 'root',
})
export class FavouriteService {
  private readonly favouritesKey = 'favourites';
  private favouritesSubject = new BehaviorSubject<Favourite[]>([]);
  favourites$: Observable<Favourite[]> = this.favouritesSubject.asObservable();
  private favourites: Favourite[] = [];
  private favouritesLoaded = false;

  constructor(private hymnalService: HymnService) {
    this.loadFavourites();
  }

  getFavourites(): Observable<Favourite[]> {
    return from(this.loadFavourites());
  }

  async addFavourite(favourite: Favourite): Promise<void> {
    this.favourites.push(favourite);
    await this.saveFavourites();
  }

  async addHymnToFavourite(favouriteId: string, hymnId: string): Promise<void> {
    const favourite = this.favourites.find((f) => f.id === favouriteId);
    if (favourite) {
      favourite.hymnIds.push(hymnId);
      await this.saveFavourites();
    }
  }

  async removeHymnFromFavourite(
    favouriteId: string,
    hymnId: string
  ): Promise<void> {
    const favourite = this.favourites.find((f) => f.id === favouriteId);
    if (favourite) {
      favourite.hymnIds = favourite.hymnIds.filter((id) => id !== hymnId);
      await this.saveFavourites();
    }
  }

  async removeFavourite(id: string): Promise<void> {
    const index = this.favourites.findIndex((f) => f.id === id);
    if (index !== -1) {
      this.favourites.splice(index, 1);
      await this.saveFavourites();
    }
  }

  getFavouriteById(id: string): Observable<Favourite | undefined> {
    return this.getFavourites().pipe(
      map((favourites) => favourites.find((f) => f.id === id))
    );
  }

  getHymnsForFavourite(
    favourite: Favourite,
    page = 0,
    pageSize = -1
  ): Observable<Hymn[]> {
    return this.hymnalService.getHymns().pipe(
      map((hymns) => hymns.filter((hymn) => favourite.hymnIds.includes(hymn.number)))
    );
  }

  private async loadFavourites(): Promise<Favourite[]> {
    const storedFavourites = await Preferences.get({ key: this.favouritesKey });
    if (storedFavourites && storedFavourites.value) {
      this.favourites = JSON.parse(storedFavourites.value);
      // Convert any numeric hymnIds to strings for compatibility
      this.favourites = this.favourites.map(fav => ({
        ...fav,
        hymnIds: fav.hymnIds.map(id => id.toString())
      }));
    }
    this.favouritesLoaded = true;
    return this.favourites;
  }

  private async saveFavourites(): Promise<void> {
    await Preferences.set({
      key: this.favouritesKey,
      value: JSON.stringify(this.favourites),
    });
  }
}
