export interface Asset {
  images: AssetImages;
  thumbs: AssetImages;
  title: string;
  details: string;
  extra: string;
  similar: Asset[];
  key: string;
  id: number | string;
  youtubeId: string;
  type: AssetType;
  genres?: number[];
  live?: Live;
}

interface Live {
  duration: number;
  elapsed: number;
  channel: { name: string; width: number };
  streams: {
    uri: string;
    type: string;
    id: string;
  }[];
}

export interface AssetImages {
  Poster: string;
  Backdrop: string;
}

export enum AssetType {
  TV = 'tv',
  MOVIE = 'movie',
}
