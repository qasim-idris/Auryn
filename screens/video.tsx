/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Composition, VideoRef, BackHandler, VideoUriSource, FormFactor, MediaState } from '@youi/react-native-youi';
import { connect } from 'react-redux';
import { withNavigationFocus, NavigationEventSubscription, NavigationFocusInjectedProps } from 'react-navigation';
import { View, NativeSyntheticEvent } from 'react-native';
import { Timeline, withOrientation, VideoControls } from '../components';
import { AurynHelper } from '../aurynHelper';
import { Asset } from '../adapters/asset';
import { AurynAppState } from '../reducers/index';
import { RotationMode, OrientationLock } from '../components/withOrientation';

interface VideoProps extends NavigationFocusInjectedProps, OrientationLock {
  asset: Asset;
  fetched: boolean;
  videoSource: VideoUriSource;
}

interface VideoState {
  videoSource?: VideoUriSource | {};
  error?: boolean;
  mediaState?: MediaState;
  metadata?: { BookmarkInterval: number };
}

const initialState: VideoState = {
  videoSource: {},
  error: false,
  mediaState: { mediaState: 'unloaded', playbackState: 'paused' },
  metadata: { BookmarkInterval: 1 },
};

class VideoScreenComponent extends React.Component<VideoProps, VideoState> {
  fallbackVideo: VideoUriSource = {
    uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    type: 'HLS',
  };

  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  inTimeline = React.createRef<Timeline>();

  outTimeline = React.createRef<Timeline>();

  videoPlayer = React.createRef<VideoRef>();

  state = {
    ...initialState,
    videoSource: this.props.videoSource || {},
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.navigateBack));
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  componentDidUpdate(prevProps: VideoProps) { // eslint-disable-line max-statements
    if (!prevProps.fetched && this.props.fetched)
      this.setState({ videoSource: this.props.videoSource });

    if (this.state.error) {
      this.setState({
        videoSource: this.fallbackVideo,
        error: false,
      });
    }
  }

  shouldComponentUpdate(nextProps: VideoProps, nextState: VideoState) {
    if (nextProps.fetched !== this.props.fetched) return true;

    if (nextState.error) return true;

    return false;
  }

  navigateBack = async () => {
    if (this.state.mediaState?.mediaState === 'preparing') return true;

    await this.outTimeline.current?.play();

    this.videoPlayer.current?.stop();

    if (AurynHelper.isRoku)
      this.props.navigation.navigate({ routeName: 'PDP' });
    else
      this.props.navigation.goBack(null);

    if (FormFactor.isHandset)
      this.props.setRotationMode(RotationMode.Portrait);

    return true;
  }

  onPlayerReady = () => {
    this.videoPlayer.current?.play();
    this.inTimeline.current?.play();
  };

  onPlayerError = () => this.setState({ error: true, videoSource: this.fallbackVideo });

  onStateChanged = (mediaState: NativeSyntheticEvent<MediaState>) => {
    this.setState({ mediaState: mediaState.nativeEvent });
  }

  render() { // eslint-disable-line max-lines-per-function
    const { fetched, asset, isFocused } = this.props;
    if (!fetched)
      return <View />;

    return (
        <Composition source="Auryn_VideoContainer">
          <Timeline name="In" ref={this.inTimeline} />
          <Timeline name="Out" ref={this.outTimeline} />

          <VideoControls isFocused={isFocused} asset={asset} onBackButton={this.navigateBack}>
            <VideoRef
              name="VideoSurface"
              ref={this.videoPlayer}
              onPlaybackComplete={() => this.navigateBack()}
              onStateChanged={this.onStateChanged}
              onReady={this.onPlayerReady}
              source={this.state.videoSource}
              onErrorOccurred={this.onPlayerError}
            />
          </VideoControls>
        </Composition>
    );
  }
}

const mapStateToProps = (store: AurynAppState, ownProps: VideoProps) => {
  const asset: Asset = ownProps.navigation.getParam('asset');
  return ({
    videoSource: asset?.live?.streams?.[0] ?? (store.youtubeReducer.videoSource || { uri: '', type: '' }),
    videoId: store.youtubeReducer.videoId || '',
    asset: store.tmdbReducer.details.data || {},
    fetched: store.youtubeReducer.fetched || false,
  });
};

const withNavigationAndRedux = withNavigationFocus(connect(mapStateToProps)(VideoScreenComponent as any));
export const VideoScreen = withOrientation(withNavigationAndRedux, RotationMode.Landscape);
