export interface TVShows {
  text: string;
  metadata: {
    show: string;
    season: string;
    episode: string;
    title: string;
  };
}

export const shows: TVShows[] = [];
