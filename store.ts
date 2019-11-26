/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import promise from 'redux-promise-middleware';
import createDebounce from 'redux-debounced';
import thunk from 'redux-thunk';
import { rootReducer, StoreState } from './reducers';

import { configureStore, ConfigureStoreOptions, AnyAction } from 'redux-starter-kit';

export default configureStore({
  reducer: rootReducer,
  middleware: [createDebounce(), thunk, promise]
} as ConfigureStoreOptions<StoreState, AnyAction>);
