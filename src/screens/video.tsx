/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View, BackHandler } from 'react-native';
import { VideoUriSource, FormFactor } from '@youi/react-native-youi';
import { connect, DispatchProp } from 'react-redux';
import { withNavigationFocus, NavigationEventSubscription, NavigationFocusInjectedProps } from 'react-navigation';

import { withOrientation } from './../components';
import { Asset } from './../adapters/asset';
import { AurynAppState } from './../reducers/index';
import { RotationMode, OrientationLock } from './../components/withOrientation';
import { VideoPlayer, VideoContextProvider, VideoContext } from './../components/videoPlayer';
import { AurynHelper } from '../aurynHelper';

interface VideoProps extends NavigationFocusInjectedProps, OrientationLock, DispatchProp {
  asset: Asset;
  fetched: boolean;
  videoId: string;
  videoSource: VideoUriSource;
  isLive: boolean;
}

class VideoScreenComponent extends React.Component<VideoProps> {
  declare context: React.ContextType<typeof VideoContext>;

  static contextType = VideoContext;

  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });

    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
    });

    this.context.setVideoSource(this.props.videoSource);

    this.context.setIsLive(this.props.isLive);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();

    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  componentDidUpdate(prevProps: VideoProps) {
    if (this.props.videoId !== prevProps.videoId) {
      this.context.setVideoSource(this.props.videoSource);
    }

    if (!prevProps.fetched && this.props.fetched) {
      this.context.setVideoSource(this.props.videoSource);
    }
  }

  shouldComponentUpdate(nextProps: VideoProps) {
    if (nextProps.videoId !== this.props.videoId) {
      return true;
    }

    if (nextProps.fetched !== this.props.fetched) {
      return true;
    }

    return false;
  }

  navigateBack = () => {
    if (this.context.tvGuideOpen) return true;

    if (AurynHelper.isRoku)
      this.props.navigation.navigate({ routeName: 'PDP' });
    else
      this.props.navigation.goBack(null);

    if (FormFactor.isHandset) this.props.setRotationMode(RotationMode.Portrait);

    return true;
  };

  render() {
    const { fetched, asset, isFocused, isLive } = this.props;

    if (!fetched && !isLive) return <View />;

    return (
      <View style={styles.container}>
        <VideoContextProvider>
          <VideoPlayer
            asset={asset}
            isFocused={isFocused}
            related={asset.similar}
            enablePauseScreen={true}
            onBackButton={this.navigateBack}
          />
        </VideoContextProvider>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
};

const mapStateToProps = (store: AurynAppState, ownProps: VideoProps) => {
  const asset: Asset = ownProps.navigation.getParam('asset');
  return {
    videoSource: asset?.live?.streams?.[0] ?? (store.youtubeReducer.videoSource || { uri: '', type: '' }),
    videoId: store.youtubeReducer.videoId || '',
    asset: store.tmdbReducer.details.data || {},
    fetched: store.youtubeReducer.fetched || false,
    isLive: Boolean(asset?.live),
  };
};

const withNavigationAndRedux = withNavigationFocus(
  connect(mapStateToProps)(VideoScreenComponent as any),
);
export const VideoScreen = withOrientation(withNavigationAndRedux, RotationMode.Landscape);
