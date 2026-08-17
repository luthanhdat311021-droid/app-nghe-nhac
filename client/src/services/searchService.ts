import { api } from './api';
import { SearchResults } from '../types';

export const searchService = {
  async search(query: string): Promise<SearchResults> {
    const res = await api.get('/search', { params: { q: query } });
    return res.data.data;
  },
};
