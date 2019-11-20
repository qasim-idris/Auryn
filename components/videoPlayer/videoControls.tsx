/* eslint-disable max-lines-per-function */
/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ViewRef, TextRef, SliderRef, Video, FocusManager, Input, InputEventObject, MediaState, VideoProps, ButtonRef } from '@youi/react-native-youi';
import { BackButton, Timeline, ToggleButton } from './../index';
import { debounce } from 'lodash';
import { NativeSyntheticEvent } from 'react-native';
import { Asset } from './../../adapters/asset';
import URLSearchParams from '@ungap/url-search-params';
import { VideoContext } from './index';

interface PlayerControlProps {
  isFocused?: boolean;
  isLive?: boolean;
  asset: Asset;
  onBackButton: () => void;
}

interface PlayerControlState {
  hasStartedPlaying: boolean;
}

const mediaKeys = [
  'Space',
  'Play',
  'MediaPlay',
  'MediaPlayPause',
];

const keys = [
  'Enter',
  'Select',
  'PageDown',
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUpLeft',
  'ArrowUpRight',
  'ArrowDownLeft',
  'ArrowUpRight',
];

const MIN_DURATION = 3000;

export class VideoControls extends React.Component<PlayerControlProps, PlayerControlState> {
  static contextType = VideoContext;

  controlsHideTimeline = React.createRef<Timeline>();

  controlsShowTimeline = React.createRef<Timeline>();

  playButton = React.createRef<ToggleButton>();

  videoPlayer: Video | undefined;

  child: React.ReactElement<VideoProps>;

  constructor(props: PlayerControlProps) {
    super(props);
    this.child = React.Children.only(this.props.children) as React.ReactElement<VideoProps>;

    this.state = { hasStartedPlaying: false };
  }

  componentDidMount() {
    keys.concat(mediaKeys).forEach(key => Input.addEventListener(key, this.registerUserActivity));
  }

  componentWillUnmount() {
    this.onScrub.cancel();
    this.debounceHidingControls.cancel();
    keys.concat(mediaKeys).forEach(key => Input.removeEventListener(key, this.registerUserActivity));
  }

  playPause = () => {
    this.context.paused ? this.videoPlayer?.play() : this.videoPlayer?.pause();

    if(!this.context.paused) {
      this.context.setContext({ scrubbingEngaged: false });
    }
  }

  showControls = () => {
    this.context.setContext({ controlsActive: true});
    if (this.playButton.current)
      FocusManager.focus(this.playButton.current);

    this.controlsShowTimeline.current?.play();
  }

  registerUserActivity = (keyEvent?: InputEventObject) => {
    if (keyEvent) {
      if (mediaKeys.includes(keyEvent.keyCode) && keyEvent.eventType === 'up')
        this.playPause();
    }

    if (!this.context.controlsActive) this.showControls();

    this.debounceHidingControls();
  }

  seekAndResume = (time: number) => {
    if (this.context.mediaState !== 'ready') return;
    this.videoPlayer?.seek(time);

    if (!this.context.pausedByScrubbing) return;

    this.videoPlayer?.play();

    this.context.setContext({ pausedByScrubbing: false });
  };

  onScrub = debounce((value: number) => {
    if (value === this.context.currentTime) return;
    
    this.context.setContext({ scrubbingEngaged: true });

    if (!this.context.paused) {
      this.context.setContext({ pausedByScrubbing: true });
      this.videoPlayer?.pause();
    }

    this.seekAndResume(value);

    this.debounceHidingControls();
  }, 100);

  onSlidingComplete = (value: number) => {
    this.context.setContext({ scrubbingEngaged: false });

    if (this.context.duration <= MIN_DURATION) return;

    this.videoPlayer?.seek(value);
  }

  debounceHidingControls = debounce(() => {
    if (!this.props.isLive && this.playButton.current)
      FocusManager.focus(this.playButton.current);

    this.controlsHideTimeline.current?.play();
    this.context.setContext({ controlsActive: false});
  }, 5000);

  getDurationFromVideoUri = (): number => {
    const sourceParams = new URLSearchParams(this.videoPlayer?.props.source.uri);
    return Math.round(Number(sourceParams.get('dur')) * 1000);
  }

  onDurationChanged = (value: number) => {
    this.child?.props?.onDurationChanged?.(value);
    const duration = value > MIN_DURATION ? value : this.getDurationFromVideoUri();
    this.context.setContext({ duration });
  };

  onCurrentTimeUpdated = (currentTime: number) => { // eslint-disable-line max-statements
    this.child?.props?.onCurrentTimeUpdated?.(currentTime);
    if (isNaN(currentTime)) return;
    let sec = Math.floor(currentTime / 1000);
    let min = Math.floor(sec / 60);
    const hour = Math.floor(sec / 3600);
    sec %= 60;
    min %= 60;
    const hourString = hour < 1 ? '' : `${hour}:`;
    const minSting = min < 10 ? `0${min}` : min;
    const secString = sec < 10 ? `0${sec}` : sec;
    this.context.setContext({
      currentTime,
      formattedTime: `${hourString}${minSting}:${secString}`,
      percent: currentTime / this.context.duration
    });
  }

  onStateChanged = (playerState: NativeSyntheticEvent<MediaState>) => {
    this.child?.props?.onStateChanged?.(playerState);

    const { mediaState, playbackState } = playerState.nativeEvent;

    if(!this.state.hasStartedPlaying && mediaState === 'ready' && playbackState === 'playing') {
      this.setState({ hasStartedPlaying: true });
      this.context.setContext({ mediaState, playbackState });
    } else if(!this.state.hasStartedPlaying) {
      this.context.setContext({ mediaState, playbackState: 'playing' });
    } else {
      this.context.setContext({ mediaState, playbackState });
    }
  }

  onPaused = () => {
    this.child?.props?.onPaused?.();
    this.context.setContext({ paused: true });
  };

  onPlaying = () => {
    this.child?.props?.onPlaying?.();
    this.context.setContext({ paused: false });
  }

  render() {
    const { asset, isFocused } = this.props;

    return (
      <ButtonRef name="Video" onPress={this.registerUserActivity} visible={isFocused}>
        {React.cloneElement(this.child, {
          ref: (node: any) => {
            this.videoPlayer = node;
            // @ts-ignore
            const { ref } = this.child;
            if (typeof ref === 'function')
              ref(node);
            else if (ref !== null)
              ref.current = node;
          },
          onPaused: this.onPaused,
          onPlaying: this.onPlaying,
          onDurationChanged: this.onDurationChanged,
          onCurrentTimeUpdated: this.onCurrentTimeUpdated,
          onStateChanged: this.onStateChanged,
        })}
        <ViewRef name="Player-Controls">
          <BackButton
            focusable={isFocused}
            onPress={this.props.onBackButton}
          />
          <Timeline name="Show" ref={this.controlsShowTimeline} />
          <Timeline name="Hide" ref={this.controlsHideTimeline} />
          <ToggleButton
            name="Btn-PlayPause"
            onPress={this.playPause}
            toggled={!this.context.paused || this.context.pausedByScrubbing}
            focusable={this.props.isFocused}
            ref={this.playButton}
          />
          <TextRef name="Duration" text={this.context.formattedTime} />
          <SliderRef
            visible={this.context.duration > MIN_DURATION}
            name="Bar"
            minimumTrackTintColor="#DA1B5B"
            maximumValue={this.context.duration}
            value={this.context.currentTime}
            thumbImage={{ uri: 'res://drawable/default/Player-Thumb.png' }}
            onSlidingComplete={this.onSlidingComplete}
            onValueChange={this.onScrub}
            step={1}
          />

          <ViewRef name="Video-TextDetails">
            <TextRef name="Title" text={asset.title} />
            <TextRef name="Details" text={asset.details} />
          </ViewRef>
        </ViewRef>
      </ButtonRef>
    );
  }
}
