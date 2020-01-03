/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View, BackHandler } from 'react-native';
import { FormFactor } from '@youi/react-native-youi';
import { withNavigationFocus, NavigationEventSubscription, NavigationFocusInjectedProps } from 'react-navigation';
import { withOrientation } from './../components';
import { RotationMode, OrientationLock } from './../components/withOrientation';
import { VideoPlayer, VideoContextProvider, VideoContext } from './../components/videoPlayer';
import { AurynHelper } from '../aurynHelper';

interface VideoProps extends NavigationFocusInjectedProps, OrientationLock { }

class VideoScreenComponent extends React.PureComponent<VideoProps> {
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
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();

    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  navigateBack = () => {
    if (AurynHelper.isRoku)
      this.props.navigation.navigate({ routeName: 'PDP' });
    else
      this.props.navigation.goBack(null);

    if (FormFactor.isHandset) this.props.setRotationMode(RotationMode.Portrait);

    return true;
  };

  render() {
    const { isFocused } = this.props;

    return (
      <View style={styles.container}>
        <VideoContextProvider>
          <VideoPlayer
            isFocused={isFocused}
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


const withNavigation = withNavigationFocus(VideoScreenComponent);

export const VideoScreen = withOrientation(withNavigation, RotationMode.Landscape);
