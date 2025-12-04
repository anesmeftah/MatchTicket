import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Search {
  readonly searchTerm = signal<string>('');

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }
}
