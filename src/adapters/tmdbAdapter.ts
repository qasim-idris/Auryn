/* eslint-disable camelcase */
import { Asset, AssetType } from './asset';
import { genres } from '../data/genres';

interface TmdbCredits {
  crew: TmdbCrew[];
  cast: TmdbCrew[];
}

interface TmdbCrew {
  job: string;
  name: string;
}

export interface TmdbResults<T> {
  results: T[];
}

interface TmdbVideo {
  key: string;
}

export interface TmdbApi {
  poster_path: string;
  backdrop_path: string;
  name: string;
  title: string;
  overview: string;
  credits: TmdbCredits;
  id: number;
  videos: TmdbResults<TmdbVideo>;
  similar: TmdbResults<TmdbApi>;
  original_language: string;
  adult: boolean;
  media_type: 'tv' | 'movie';
  type: 'tv' | 'movie';
  genres: { id: number; name: string }[];
  genre_ids: number[];
  runtime: number;
  number_of_seasons: number;
  number_of_episodes: number;
  release_date?: string;
  first_air_date?: string;
}

const getFeaturedText = (credits: TmdbCredits): string => {
  if (!credits) return '';

  const director = credits.crew.find((it: TmdbCrew) => it.job === 'Director');
  const screenplay = credits.crew.find((it: TmdbCrew) => it.job === 'Screenplay');
  const cast = credits.cast
    .slice(0, 2)
    .map((it: TmdbCrew) => it.name)
    .join('\nStarring\n\n');
  if (director && screenplay) return `${director.name}\nDirector\n\n${screenplay.name}\nScreenplay\n\n${cast}\nStarring`;
  else if (director) return `${director.name}\nDirector\n\n${cast}\nStarring`;
  else if (screenplay) return `${screenplay.name}\nScreenplay\n\n${cast}\nStarring`;

  return `${cast}\nStarring`;
};

const fromApi = (item: TmdbApi): Asset => {
  const type = 'name' in item ? AssetType.TV : AssetType.MOVIE;
  const itemGenres = item.genres || item.genre_ids.map(id => genres[type].find(it => it.id === id));
  return ({
    images: {
      Poster: `http://image.tmdb.org/t/p/w1280/${item.poster_path}`,
      Backdrop: `http://image.tmdb.org/t/p/w1280/${item.backdrop_path}`,
    },
    thumbs: {
      Poster: `http://image.tmdb.org/t/p/w500/${item.poster_path}`,
      Backdrop: `http://image.tmdb.org/t/p/w500/${item.backdrop_path}`,
    },
    title: item.name || item.title,
    details: item.overview,
    extra: getFeaturedText(item.credits),
    similar: item.similar && item.similar.results ? item.similar.results.map((it: TmdbApi) => fromApi(it)) : [],
    key: item.id.toString(),
    id: item.id,
    youtubeId: item.videos && item.videos.results.length ? item.videos.results[0].key : 'nO_DIwuGBnA',
    type,
    genres: itemGenres,
    runtime: item.runtime,
    seasons: item.number_of_seasons,
    episodes: item.number_of_episodes,
    releaseDate: item.release_date || item.first_air_date || ''
  });
}
export { fromApi };
