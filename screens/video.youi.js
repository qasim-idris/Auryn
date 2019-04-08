/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { View, Composition, ViewRef, VideoRef, ButtonRef, TextRef, Input, FocusManager, BackHandler } from '@youi/react-native-youi';
import { Timeline, ToggleButton, BackButton } from '../components';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Video extends Component {
  constructor(props) {
    super(props);
    this.fallbackVideo = {
      uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      type: 'HLS',
    };

    this.state = {
      videoSource: props.fetched ? props.videoSource : {},
      controlsVisible: false,
      formattedTime: '00:00',
      paused: true,
      error: false,
      ready: false,
    };
  }

  mediaKeys = [
    'YI_KEY_SPACE',
    'YI_KEY_PLAY',
    'YI_KEY_MEDIA_PLAY',
    'YI_KEY_MEDIA_PLAY_PAUSE',
  ];

  keys = [
    'YI_KEY_ENTER',
    'YI_KEY_SELECT',
    'YI_KEY_PAGEDOWN',
    'YI_KEY_ARROW_DOWN',
    'YI_KEY_ARROW_UP',
    'YI_KEY_ARROW_LEFT',
    'YI_KEY_ARROW_RIGHT',
    'YI_KEY_ARROW_UP_LEFT',
    'YI_KEY_ARROW_UP_RIGHT',
    'YI_KEY_ARROW_DOWN_LEFT',
    'YI_KEY_ARROW_DOWN_RIGHT',
  ];

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.backHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => this.backHandlerListener.remove());
    this.keys.concat(this.mediaKeys).forEach(key => Input.addEventListener(key, this.registerUserActivity));
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    this.backHandlerListener.remove();
    this.keys.concat(this.mediaKeys).forEach(key => Input.removeEventListener(key, this.registerUserActivity));
  }

  componentDidUpdate(prevProps, prevState) { // eslint-disable-line max-statements
    if (!prevProps.fetched && this.props.fetched)
      this.setState({ videoSource: this.props.videoSource });

    if (this.state.error) {
      this.setState({
        videoSource: this.fallbackVideo,
        error: false,
      });
    }

    if (this.state.percent !== prevState.percent)
      this.scrubberTimeline.play(this.state.percent);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.fetched !== this.props.fetched)
      return true;

    if (nextState.error)
      return true;

    if (nextState.controlsVisible) return true;

    return false;
  }

  inactivityDetected = () => {
    this.controlsHideTimeline.play();
    this.setState({ controlsVisible: false });
  }

  showControls = () => {
    this.setState({ controlsVisible: true });
    FocusManager.focus(this.playButton);
    this.controlsShowTimeline.play();
  }

  registerUserActivity = keyEvent => {
    if (this.mediaKeys.includes(keyEvent.keyCode) && keyEvent.eventType === 'up')
      this.playPause();

    if (!this.state.controlsVisible) this.showControls();

    if (this.activityTimeout)
      clearTimeout(this.activityTimeout);

    // Set our new activity timeout
    this.activityTimeout = setTimeout(() => this.inactivityDetected(), 3000);
  }

  playPause = () => {
    this.state.paused ? this.videoPlayer.play() : this.videoPlayer.pause();
  }

  navigateBack = () => {
    if (this.state.mediaState === 'preparing') return true;
    if (this.activityTimeout)
      clearTimeout(this.activityTimeout);
    this.keys.forEach(key => Input.removeEventListener(key, this.registerUserActivity));
    this.outPromise = this.outTimeline ? this.outTimeline.play : Promise.resolve;
    this.outPromise().then(() => {
      this.videoPlayer.stop();
      if (global.isRoku)
        this.props.navigation.navigate({ routeName: 'PDP' });
      else
        this.props.navigation.goBack(null);
    });

    return true;
  }

  onCurrentTimeUpdated = currentTime => { // eslint-disable-line max-statements
    if (isNaN(currentTime.nativeEvent)) return;
    let sec = Math.floor(currentTime.nativeEvent / 1000);
    let min = Math.floor(sec / 60);
    let hour = Math.floor(sec / 3600);
    sec %= 60;
    min %= 60;
    hour = hour < 1 ? '' : `${hour}:`;
    min = min < 10 ? `0${min}` : min;
    sec = sec < 10 ? `0${sec}` : sec;
    const time = `${hour}${min}:${sec}`;
    this.setState({
      currentTime: currentTime.nativeEvent,
      formattedTime: time,
      percent: currentTime.nativeEvent / this.state.duration,
    });
  }

  onPlayerReady = () => {
    this.setState({ ready: true });
    this.videoPlayer.play();
    this.inTimeline.play();
  };

  onPlayerError = () => this.setState({ error: true, videoSource: this.fallbackVideo });

  onDurationChanged = duration => this.setState({ duration: duration.nativeEvent });

  render() { // eslint-disable-line max-lines-per-function
    const { fetched, asset, isFocused } = this.props;
    if (!fetched)
      return <View />;

    return (
      <Composition source="Auryn_VideoContainer">
        <Timeline name="In" ref={timeline => this.inTimeline = timeline} />
        <Timeline name="Out" ref={timeline => this.outTimeline = timeline} />

        <ButtonRef name="Video" onPress={this.registerUserActivity} visible={isFocused && fetched}>
          <VideoRef
            name="VideoSurface"
            ref={ref => this.videoPlayer = ref}
            onPaused={() => this.setState({ paused: true })}
            onPlaying={() => this.setState({ paused: false })}
            onPlaybackComplete={() => this.navigateBack()}
            onStateChanged={state => this.setState({ playerState: state.nativeEvent.mediaState })}
            onReady={this.onPlayerReady}
            source={this.state.videoSource}
            onErrorOccurred={this.onPlayerError}
            onCurrentTimeUpdated={this.onCurrentTimeUpdated}
            onDurationChanged={this.onDurationChanged}
          />
          <ViewRef name="ActivityIndicator">
            <Timeline name="Show" ref={ref => this.activityShowTimeline = ref} />
            <Timeline name="Hide" ref={ref => this.activityHideTimeline = ref} />
          </ViewRef>
          <ViewRef name="Player-Controls">
            <BackButton
              focusable={isFocused}
              onPress={this.navigateBack}
            />
            <Timeline name="Show"
              ref={ref => this.controlsShowTimeline = ref}
            />
            <Timeline name="Hide"
              ref={ref => this.controlsHideTimeline = ref}
            />
            <ToggleButton name="Btn-PlayPause"
              onPress={this.playPause}
              toggled={!this.state.paused}
              toggle={true}
              focusable={isFocused}
              ref={ref => this.playButton = ref}
            />
            <TextRef name="Duration" text={this.state.formattedTime} />
            <ViewRef name="Bar">
              <Timeline name="ScrollStart" ref={ref => this.scrubberTimeline = ref} />
            </ViewRef>
            <ViewRef name="Video-TextDetails">
              <TextRef name="Title" text={asset.title || asset.name} />
              <TextRef name="Details" text={asset.overview} />
            </ViewRef>
          </ViewRef>
        </ButtonRef>
      </Composition>
    );
  }
}

const mapStateToProps = store => ({
  videoSource: store.youtubeReducer.videoSource,
  asset: store.tmdbReducer.details.data,
  fetched: store.youtubeReducer.fetched,
});

export default withNavigationFocus(connect(mapStateToProps)(Video));
export { Video as VideoTest };

Video.propTypes = {
  navigation: PropTypes.object,
  isFocused: PropTypes.bool,
  asset: PropTypes.object.isRequired,
  fetched: PropTypes.bool,
  videoSource: PropTypes.object,
};
