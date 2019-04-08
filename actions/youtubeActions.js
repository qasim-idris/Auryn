/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Youtube from 'youtube-stream-url';

export const getVideoSourceByYoutubeId = key => dispatch => dispatch({
  type: 'YOUTUBE_VIDEO',
  meta: {
    debounce: {
      time: 500,
    },
  },
  payload: Youtube.getInfo({ url: `http://www.youtube.com/watch?v=${key}` }),
});
