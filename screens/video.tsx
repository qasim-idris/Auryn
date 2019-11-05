/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  Composition,
  ViewRef,
  VideoRef,
  ButtonRef,
  TextRef,
  Input,
  FocusManager,
  BackHandler,
  VideoUriSource,
  InputEventObject,
  FormFactor,
  SliderRef,
} from '@youi/react-native-youi';
import { connect } from 'react-redux';
import {
  withNavigationFocus,
  NavigationEventSubscription,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import { View } from 'react-native';
import { debounce } from 'lodash';
import URLSearchParams from '@ungap/url-search-params';

import { Timeline, ToggleButton, BackButton, withOrientation } from '../components';
import { AurynHelper } from '../aurynHelper';
import { Asset } from '../adapters/asset';
import { AurynAppState } from '../reducers/index';
import { RotationMode, OrientationLock } from '../components/withOrientation';

interface VideoProps extends NavigationFocusInjectedProps, OrientationLock {
  asset: Asset;
  fetched: boolean;
  videoSource: VideoUriSource;
  isLive: boolean;
}

interface VideoState {
  videoSource?: VideoUriSource | {};
  formattedTime?: string;
  paused?: boolean;
  error?: boolean;
  ready?: boolean;
  percent?: number;
  mediaState?: string;
  currentTime?: number;
  duration: number;
  controlsActive: boolean;
  scrubbingEngaged: boolean;
  pausedByScrubbing: boolean;
}

const initialState: VideoState = {
  videoSource: {},
  formattedTime: '00:00',
  paused: true,
  error: false,
  ready: false,
  percent: 0,
  mediaState: '',
  currentTime: 0,
  duration: 1,
  controlsActive: false,
  scrubbingEngaged: false,
  pausedByScrubbing: false,
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

class VideoScreen extends React.Component<VideoProps, VideoState> {
  MIN_DURATION = 3000;

  fallbackVideo: VideoUriSource = {
    uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    type: 'HLS',
  };

  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  inTimeline: React.RefObject<Timeline> = React.createRef();

  outTimeline: React.RefObject<Timeline> = React.createRef();

  scrubberTimeline: React.RefObject<Timeline> = React.createRef();

  controlsHideTimeline: React.RefObject<Timeline> = React.createRef();

  controlsShowTimeline: React.RefObject<Timeline> = React.createRef();

  playButton: React.RefObject<ToggleButton> = React.createRef();

  activityShowTimeline: React.RefObject<Timeline> = React.createRef();

  activityHideTimeline: React.RefObject<Timeline> = React.createRef();

  videoPlayer: React.RefObject<VideoRef> = React.createRef();

  activityTimeout!: NodeJS.Timeout;

  state = {
    ...initialState,
    videoSource: this.props.videoSource || {},
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.navigateBack));
    keys.concat(mediaKeys).forEach(key => Input.addEventListener(key, this.registerUserActivity));
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    this.onScrub.cancel();
    this.debounceHidingControls.cancel();
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
    keys.concat(mediaKeys).forEach(key => Input.removeEventListener(key, this.registerUserActivity));
  }

  componentDidUpdate(prevProps: VideoProps, prevState: VideoState) { // eslint-disable-line max-statements
    if (!prevProps.fetched && this.props.fetched)
      this.setState({ videoSource: this.props.videoSource });

    if (this.state.error) {
      this.setState({
        videoSource: this.fallbackVideo,
        error: false,
      });
    }

    if (this.state.percent !== prevState.percent && this.scrubberTimeline.current)
      this.scrubberTimeline.current.play(this.state.percent);
  }

  shouldComponentUpdate(nextProps: VideoProps, nextState: VideoState) {
    if (nextProps.fetched !== this.props.fetched) return true;

    if (nextState.error) return true;

    if (nextState.controlsActive) return true;

    return false;
  }

  showControls = () => {
    this.setState({ controlsActive: true });
    if (this.playButton.current)
      FocusManager.focus(this.playButton.current);
    if (this.controlsShowTimeline.current)
      this.controlsShowTimeline.current.play();
  }

  registerUserActivity = (keyEvent?: InputEventObject) => {
    if (keyEvent) {
      if (mediaKeys.includes(keyEvent.keyCode) && keyEvent.eventType === 'up')
      this.playPause();
    }

    if (!this.state.controlsActive) this.showControls();

    this.debounceHidingControls();
  }

  playPause = () => {
    if (this.videoPlayer.current)
      this.state.paused ? this.videoPlayer.current.play() : this.videoPlayer.current.pause();
  }

  navigateBack = async () => {
    if (this.state.mediaState === 'preparing') return true;
    if (this.activityTimeout)
      clearTimeout(this.activityTimeout);

    if (this.outTimeline.current)
      await this.outTimeline.current.play();

    if (this.videoPlayer.current)
      this.videoPlayer.current.stop();

    if (AurynHelper.isRoku)
      this.props.navigation.navigate({ routeName: 'PDP' });
    else
      this.props.navigation.goBack(null);

    if (FormFactor.isHandset)
      this.props.setRotationMode(RotationMode.Portrait);

    return true;
  }

  onCurrentTimeUpdated = (currentTime: number) => { // eslint-disable-line max-statements
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

  onPlayerReady = () => {
    this.setState({ ready: true });
    if (this.videoPlayer.current && this.inTimeline.current) {
      this.videoPlayer.current.play();
      this.inTimeline.current.play();
    }
  };

  onPlayerError = () => this.setState({ error: true, videoSource: this.fallbackVideo });

  getDurationFromVideoUri = (): number => {
    const sourceParams = new URLSearchParams(this.props.videoSource.uri);
    return Math.round(Number(sourceParams.get('dur')) * 1000);
  }

  onDurationChanged = (value: number) => {
    const duration = value > this.MIN_DURATION ? value : this.getDurationFromVideoUri();
    this.setState({ duration });
  };

  seekAndResume = (time: number) => {
    if (!this.videoPlayer.current) return;

    this.videoPlayer.current.seek(time);

    if (!this.state.pausedByScrubbing) return;

    this.videoPlayer.current.play();
    this.setState({ pausedByScrubbing: false });
  };

  onScrub = debounce((value: number) => {
    if (!this.videoPlayer.current) return;

    this.setState({ scrubbingEngaged: true });
    const newTime = value * this.state.duration;

    if (!this.state.paused) {
      this.setState({ pausedByScrubbing: true });
      this.videoPlayer.current.pause();
    }

    this.seekAndResume(Number(newTime.toFixed(0)));

    this.debounceHidingControls();
  }, 100);

  onSlidingComplete = (value: number) => {
    this.setState({ scrubbingEngaged: false });

    if (!this.videoPlayer.current) return;

    if (this.state.duration <= this.MIN_DURATION) return;

    this.videoPlayer.current.seek(Math.round(value * this.state.duration));
  }

  debounceHidingControls = debounce(() => {
    if (!this.props.isLive) FocusManager.focus(this.playButton.current);

    if (!this.controlsHideTimeline.current) return;

    this.controlsHideTimeline.current.play();
    this.setState({ controlsActive: false });
  }, 3000);

  render() { // eslint-disable-line max-lines-per-function
    const { fetched, asset, isFocused } = this.props;
    if (!fetched)
      return <View />;

    return (
      <Composition source="Auryn_VideoContainer">
        <Timeline name="In" ref={this.inTimeline} />
        <Timeline name="Out" ref={this.outTimeline} />

        <ButtonRef name="Video" onPress={this.registerUserActivity} visible={isFocused && fetched}>
          <VideoRef
            name="VideoSurface"
            ref={this.videoPlayer}
            onPaused={() => this.setState({ paused: true })}
            onPlaying={() => this.setState({ paused: false })}
            onPlaybackComplete={() => this.navigateBack()}
            onStateChanged={state => this.setState({ mediaState: state.nativeEvent.mediaState })}
            onReady={this.onPlayerReady}
            source={this.state.videoSource}
            onErrorOccurred={this.onPlayerError}
            onCurrentTimeUpdated={this.onCurrentTimeUpdated}
            onDurationChanged={this.onDurationChanged}
          />
          <ViewRef name="ActivityIndicator">
            <Timeline name="Show" ref={this.activityShowTimeline} />
            <Timeline name="Hide" ref={this.activityHideTimeline} />
          </ViewRef>
          <ViewRef name="Player-Controls">
            <BackButton
              focusable={isFocused}
              onPress={this.navigateBack}
            />
            <Timeline name="Show" ref={this.controlsShowTimeline} />
            <Timeline name="Hide" ref={this.controlsHideTimeline} />
            <ToggleButton
              name="Btn-PlayPause"
              onPress={this.playPause}
              toggled={!this.state.paused || this.state.pausedByScrubbing}
              focusable={isFocused}
              ref={this.playButton}
            />
            <TextRef name="Duration" text={this.state.formattedTime} />
            <SliderRef
              visible={this.state.duration > this.MIN_DURATION}
              name="Bar"
              minimumTrackTintColor="#DA1B5B"
              thumbImage={{ uri: 'res://drawable/default/Player-Thumb.png' }}
              onSlidingComplete={this.onSlidingComplete}
              onValueChange={this.onScrub}
            >
              <Timeline name="ScrollStart" ref={this.scrubberTimeline} />
            </SliderRef>

            <ViewRef name="Bar">
              <Timeline name="ScrollStart" ref={this.scrubberTimeline} />
            </ViewRef>
            <ViewRef name="Video-TextDetails">
              <TextRef name="Title" text={asset.title} />
              <TextRef name="Details" text={asset.details} />
            </ViewRef>
          </ViewRef>
        </ButtonRef>
      </Composition>
    );
  }
}

const mapStateToProps = (store: AurynAppState, ownProps: VideoProps) => {
  const live = ownProps.navigation.getParam('live');

  return {
    videoSource: store.youtubeReducer.videoSource || { uri: '', type: '' },
    videoId: store.youtubeReducer.videoId || '',
    asset: store.tmdbReducer.details.data || {},
    fetched: store.youtubeReducer.fetched || false,
    isLive: Boolean(live),
  };
};

const withNavigationAndRedux = withNavigationFocus(connect(mapStateToProps)(VideoScreen as any));
export const Video = withOrientation(withNavigationAndRedux, RotationMode.Landscape);
