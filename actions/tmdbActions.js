/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { chunk } from 'lodash';
import { tmdbApiKey } from '../secrets';

const familyFilter = false;
const familyGenre = 10751;

const groupItems = (array, numPerGroup = 3) =>
  chunk(array, numPerGroup).map((data, index) => ({
    key: index.toString(),
    data,
  }));

const normalize = (array, length = 10, imagePath = 'backdrop_path') =>
  array.filter(asset => asset.original_language === 'en' && asset[imagePath])
    .slice(0, length)
    .map(it => ({ ...it, key: it.id.toString(), type: 'name' in it ? 'tv' : 'movie' }));

export const getDiscover = () => dispatch => {
  let movies = [];

  dispatch({
    type: 'TMDB_DISCOVER',
    payload: fetch(`http://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_original_language=en&with_genres=${familyFilter ? familyGenre : ''}`)
      .then(response => response.json())
      .then(json => {
        movies = json.results.slice(0, 12);
        return fetch(`http://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&with_original_language=en&with_genres=${familyFilter ? familyGenre : ''}`);
      })
      .then(response => response.json())
      .then(tv => movies.concat(tv.results.slice(0, 12)).sort(() => 0.5 - Math.random()))
      .then(json => groupItems(normalize(json, 12), 3)),
  });
};

export const getMovies = () => dispatch => dispatch({
  type: 'TMDB_MOVIES',
  payload: fetch(`http://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&with_original_language=en`)
    .then(response => response.json())
    .then(json => normalize(json.results, 10, 'poster_path')),
});

export const getTv = () => dispatch => dispatch({
  type: 'TMDB_TV',
  payload: fetch(`http://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&with_original_language=en`)
    .then(response => response.json())
    .then(json => groupItems(normalize(json.results), 2)),
});

export const getDetailsByIdAndType = (id, type) => (dispatch, getState) => {
  const { cacheReducer: { cache } } = getState();
  const cachedPayload = cache.find(it => it.id === id && it.type === type);
  if (cachedPayload) {
    return dispatch({
      type: 'TMDB_DETAILS',
      payload: Promise.resolve(cachedPayload),
    });
  }

  return dispatch({
    type: 'TMDB_DETAILS',
    payload: fetch(`http://api.themoviedb.org/3/${type}/${id}?append_to_response=similar,videos,credits&api_key=${tmdbApiKey}`)
      .then(response => response.json())
      .then(json => {
        json.type = type;
        json.youtubeId = json.videos.results.length ? json.videos.results[0].key : 'nO_DIwuGBnA';
        json.similar.results = json.similar.results.slice(0, 5).map(it => ({ ...it, key: it.id.toString(), type }));
        return json;
      }),
  });
};

export const search = query => dispatch => dispatch({
  type: 'TMDB_SEARCH',
  meta: {
    debounce: {
      time: 500,
    },
  },
  payload: fetch(`http://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${tmdbApiKey}`)
    .then(response => response.json())
    .then(json => ({
        movies: normalize(json.results.filter(it => it.media_type === 'movie'), 10),
        tv: normalize(json.results.filter(it => it.media_type === 'tv'), 10),
    })),
});
