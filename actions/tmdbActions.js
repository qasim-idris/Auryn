/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { tmdbApiKey } from '../secrets';

const familyFilter = false;
const familyGenre = 10751;

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
      .then(tv => movies.concat(tv.results.slice(0, 12)).sort(() => 0.5 - Math.random())),
  });
};

export const getMovies = () => dispatch => dispatch({
  type: 'TMDB_MOVIES',
  payload: fetch(`http://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&with_original_language=en`)
    .then(response => response.json()),
});

export const getTv = () => dispatch => dispatch({
  type: 'TMDB_TV',
  payload: fetch(`http://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&with_original_language=en`)
    .then(response => response.json()),
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
    .then(response => response.json()),
});
