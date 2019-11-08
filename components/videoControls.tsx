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
import { BackButton, Timeline, ToggleButton } from '.';
import { debounce } from 'lodash';
import { NativeSyntheticEvent } from 'react-native';
import { Asset } from '../adapters/asset';
import URLSearchParams from '@ungap/url-search-params';

interface PlayerControlProps {
  isFocused?: boolean;
  isLive?: boolean;
  asset: Asset;
  onBackButton: () => void;
}

const initialState = {
  paused: false,
  pausedByScrubbing: false,
  controlsActive: false,
  duration: 0,
  isLive: false,
  formattedTime: '',
  currentTime: 0,
  mediaState: { mediaState: '', playbackState: '' },
};

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


export class VideoControls extends React.Component<PlayerControlProps> {
  state = initialState;

  controlsHideTimeline = React.createRef<Timeline>();

  controlsShowTimeline = React.createRef<Timeline>();

  playButton = React.createRef<ToggleButton>();

  videoPlayer: Video | undefined;

  child: React.ReactElement<VideoProps>;

  constructor(props: PlayerControlProps) {
    super(props);
    this.child = React.Children.only(this.props.children) as React.ReactElement<VideoProps>;

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
    this.state.paused ? this.videoPlayer?.play() : this.videoPlayer?.pause();
  }

  showControls = () => {
    this.setState({ controlsActive: true });
    if (this.playButton.current)
      FocusManager.focus(this.playButton.current);

    this.controlsShowTimeline.current?.play();
  }

  registerUserActivity = (keyEvent?: InputEventObject) => {
    if (keyEvent) {
      if (mediaKeys.includes(keyEvent.keyCode) && keyEvent.eventType === 'up')
      this.playPause();
    }

    if (!this.state.controlsActive) this.showControls();

    this.debounceHidingControls();
  }

  seekAndResume = (time: number) => {
    if (this.state.mediaState.mediaState !== 'ready') return;
    this.videoPlayer?.seek(time);

    if (!this.state.pausedByScrubbing) return;

    this.videoPlayer?.play();
    this.setState({ pausedByScrubbing: false });
  };

  onScrub = debounce((value: number) => {
    if (value === this.state.currentTime) return;

    this.setState({ scrubbingEngaged: true });

    if (!this.state.paused) {
      this.setState({ pausedByScrubbing: true });
      this.videoPlayer?.pause();
    }

    this.seekAndResume(value);

    this.debounceHidingControls();
  }, 100);

  onSlidingComplete = (value: number) => {
    this.setState({ scrubbingEngaged: false });

    if (this.state.duration <= MIN_DURATION) return;

    this.videoPlayer?.seek(value);
  }

  debounceHidingControls = debounce(() => {
    if (!this.props.isLive && this.playButton.current)
      FocusManager.focus(this.playButton.current);

    this.controlsHideTimeline.current?.play();
    this.setState({ controlsActive: false });
  }, 5000);

  getDurationFromVideoUri = (): number => {
    const sourceParams = new URLSearchParams(this.videoPlayer?.props.source.uri);
    return Math.round(Number(sourceParams.get('dur')) * 1000);
  }

  onDurationChanged = (value: number) => {
    this.child?.props?.onDurationChanged?.(value);
    const duration = value > MIN_DURATION ? value : this.getDurationFromVideoUri();
    this.setState({ duration });
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
    this.setState({
      currentTime,
      formattedTime: `${hourString}${minSting}:${secString}`,
      percent: currentTime / this.state.duration,
    });
  }

  onStateChanged = (mediaState: NativeSyntheticEvent<MediaState>) => {
    this.child?.props?.onStateChanged?.(mediaState);
    this.setState({ mediaState: mediaState.nativeEvent });
  }

  onPaused = () => {
    this.child?.props?.onPaused?.();
    this.setState({ paused: true });
  };

  onPlaying = () => {
    this.child?.props?.onPlaying?.();
    this.setState({ paused: false });
  }

  render() {
    const { asset, isFocused } = this.props;

    return (
      <ButtonRef name="Video" onPress={this.registerUserActivity} visible={isFocused}>
          {React.cloneElement(this.child, {
            // style: [this.child.props.style, { position: 'absolute' }],
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
              toggled={!this.state.paused || this.state.pausedByScrubbing}
              focusable={this.props.isFocused}
              ref={this.playButton}
            />
            <TextRef name="Duration" text={this.state.formattedTime} />
            <SliderRef
              visible={this.state.duration > MIN_DURATION}
              name="Bar"
              minimumTrackTintColor="#DA1B5B"
              maximumValue={this.state.duration}
              value={this.state.currentTime}
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
