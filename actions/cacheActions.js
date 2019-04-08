/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { tmdbApiKey } from '../secrets';

export const saveDetailsByIdAndType = (id, type) => (dispatch, getState) => {
  const { cacheReducer: { cache, fetching } } = getState();
  if (fetching || !cache)
    return dispatch({ type: 'NOOP' });

  const index = cache.findIndex(it => it.id === id && it.type === type);
  if (index !== -1) {
    return dispatch({
      type: 'CACHE_DETAILS',
      payload: Promise.resolve(),
      meta: {
        index,
      },
    });
  }

  return dispatch({
    type: 'CACHE_DETAILS',
    meta: {
      debounce: {
        time: 500,
        key: 'CACHE_DETAILS',
      },
    },
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
