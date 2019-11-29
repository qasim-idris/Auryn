/* eslint-disable max-lines-per-function */
/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { RefObject } from 'react';
import { ViewRef, TextRef, SliderRef, FocusManager, Input, InputEventObject, ButtonRef, VideoRef } from '@youi/react-native-youi';
import { BackButton, Timeline, ToggleButton } from './../index';
import { debounce } from 'lodash';
import { Asset } from './../../adapters/asset';
import { VideoContext, VideoContextType } from './context';
import { MiniGuide } from './miniGuide';

interface PlayerControlProps {
  isFocused?: boolean;
  isLive?: boolean;
  asset: Asset;
  videoPlayerRef: RefObject<VideoRef>;
  onBackButton: () => void;
}

interface PlayerControlState {
  controlsActive: boolean;
  pausedByScrubbing: boolean;
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
  declare context: React.ContextType<typeof VideoContext>

  static contextType = VideoContext;

  state = {
    controlsActive: false,
    pausedByScrubbing: false
  };

  private controlsHideTimeline = React.createRef<Timeline>();

  private controlsShowTimeline = React.createRef<Timeline>();

  private playButton = React.createRef<ToggleButton>();

  componentDidMount() {
    keys.concat(mediaKeys).forEach(key => Input.addEventListener(key, this.registerUserActivity));
  }

  componentWillUnmount() {
    this.onScrub.cancel();
    this.debounceHidingControls.cancel();
    keys.concat(mediaKeys).forEach(key => Input.removeEventListener(key, this.registerUserActivity));
  }

  componentDidUpdate() {
    if (this.context.miniGuideOpen && this.state.controlsActive) {
      this.debounceHidingControls.cancel();
      this.hideControls();
    }
  }

  playPause = () => {
    this.context.paused ?
      this.props.videoPlayerRef.current?.play():
      this.props.videoPlayerRef.current?.pause();

    if(!this.context.paused) {
      this.context.setScrubbingEngaged(false);
    }
  }

  showControls = () => {
    this.setState({ controlsActive: true});

    if (this.playButton.current)
      FocusManager.focus(this.playButton.current);

    this.controlsShowTimeline.current?.play();
  }

  hideControls = () => {
    if (!this.context.isLive && this.playButton.current)
      FocusManager.focus(this.playButton.current);

    this.controlsHideTimeline.current?.play();
    this.setState({ controlsActive: false});
  }

  registerUserActivity = (keyEvent?: InputEventObject) => {
    if (keyEvent) {
      if (mediaKeys.includes(keyEvent.keyCode) && keyEvent.eventType === 'up')
        this.playPause();
    }

    if (!this.state.controlsActive && !this.context.miniGuideOpen) {
      this.showControls();
      this.debounceHidingControls();
    }
  }

  seekAndResume = (time: number) => {
    if (this.context.mediaState !== 'ready') return;
    this.props.videoPlayerRef.current?.seek(time);

    if (!this.state.pausedByScrubbing) return;

    this.props.videoPlayerRef.current?.play();

    this.setState({ pausedByScrubbing: false });
  };

  onScrub = debounce((value: number) => {
    if (value === this.context.currentTime) return;

    this.context.setScrubbingEngaged(true);

    if (!this.context.paused) {
      this.setState({ pausedByScrubbing: true });
      this.props.videoPlayerRef.current?.pause();
    }

    this.seekAndResume(value);

    this.debounceHidingControls();
  }, 100);

  onSlidingComplete = (value: number) => {
    this.context.setScrubbingEngaged(false);

    if (this.context.duration! <= MIN_DURATION) return;

    this.props.videoPlayerRef.current?.seek(value);
  }

  debounceHidingControls = debounce(this.hideControls, 5000);

  render() {
    const { asset, isFocused } = this.props;

    return (
      <ButtonRef name="Video" onPress={this.registerUserActivity} visible={isFocused}>
        {this.props.children}
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
            toggled={!this.context.paused || this.state.pausedByScrubbing}
            focusable={this.props.isFocused && !this.context.miniGuideOpen}
            ref={this.playButton}
          />
          <TextRef name="Duration" text={this.context.formattedTime} visible={!this.context.isLive} />
          <SliderRef
            visible={this.context.duration! > MIN_DURATION}
            name="Bar"
            minimumTrackTintColor="#DA1B5B"
            maximumValue={this.context.duration}
            value={this.context.currentTime}
            thumbImage={{ uri: 'res://drawable/default/Player-Thumb.png' }}
            onSlidingComplete={this.onSlidingComplete}
            onValueChange={this.onScrub}
            step={1}
          />

          <MiniGuide />

          <ViewRef name="Video-TextDetails">
            <TextRef name="Title" text={asset.title} />
            <TextRef name="Details" text={asset.details} />
          </ViewRef>
        </ViewRef>
      </ButtonRef>
    );
  }
}
