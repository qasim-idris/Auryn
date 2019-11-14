import {  YoutubeApiActions } from '../actions/youtubeActions';
import { VideoUriSource } from '@youi/react-native-youi';

/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

interface YoutubeReducerState {
  videoSource: VideoUriSource;
  videoId: string;
  fetching: boolean;
  fetched: boolean;
  error: Error | null;
}

const initalState: YoutubeReducerState = {
  videoSource: { uri: 'https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans_aes.m3u8', type: 'HLS' },
  videoId: Date.now().toString(),
  fetching: false,
  fetched: false,
  error: null,
};

export const youtubeReducer = (state = initalState, action: YoutubeApiActions): YoutubeReducerState => {
  switch (action.type) {
    case 'YOUTUBE_VIDEO_FULFILLED': {
      const format = action.payload.formats?.find(fmt => {
        const type = fmt.type || fmt.mimeType;
        return type && type.indexOf('mp4') > 0 && fmt.quality === 'hd720';
      });
      if (format) {
        return {
          ...state,
          videoSource: {
            uri: format.url,
            type: 'MP4',
          },
          videoId: action.payload.video_id === 'nO_DIwuGBnA' ? Date.now().toString() : action.payload.video_id,
          fetching: false,
          fetched: true,
        };
      }

      // No viable format found
      return {
        ...state,
        videoSource: initalState.videoSource,
        videoId: Date.now().toString(),
        fetching: false,
        fetched: true,
      };
    }
    case 'YOUTUBE_VIDEO_REJECTED':
      return {
        ...state,
        fetching: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
