/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { combineReducers } from 'redux';

import { tmdbReducer } from './tmdbReducer';
import { youtubeReducer } from './youtubeReducer';
import { TmdbReducerState } from './../typings/tmdbReduxTypes';
import { YoutubeReducerState } from './../reducers/youtubeReducer';

export const rootReducer = combineReducers({
  tmdbReducer,
  youtubeReducer,
});

export type StoreState = {
  tmdbReducer: TmdbReducerState;
  youtubeReducer: YoutubeReducerState;
};

export type AurynAppState = ReturnType<typeof rootReducer>
