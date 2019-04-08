/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default function cacheReducer(state = { // eslint-disable-line max-lines-per-function
  cache: [],
  fetching: false,
  fetched: false,
}, action) {
  switch (action.type) {
    case 'CACHE_DETAILS_FULFILLED':
      const cache = [...state.cache];
      const { meta: { index } } = action;
      if (index >= 0) {
        const asset = cache[index];
        cache.splice(index, 1);
        cache.unshift(asset);
      } else
       cache.unshift(action.payload);

      if (cache.length > 20) cache.pop();

      return {
        ...state,
        cache,
        fetching: false,
        fetched: true,
      };

    case 'CACHE_DETAILS_REJECTED':
      return {
        ...state,
        fetching: false,
      };

    case 'CACHE_DETAILS':
      return {
        ...state,
        fetching: true,
      };

    default:
      return state;
  }
}
