/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default function landerReducer(state = { // eslint-disable-line max-lines-per-function
  currentListIndex: 0,
}, action) {
  switch (action.type) {
    case 'LANDER_CLEAR':
      return {
        currentListIndex: 0,
      };
    case 'LANDER_LIST_INDEX':
      return {
        ...state,
        currentListIndex: action.payload,
      };
    default:
      return state;
  }
}
