/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { Composition, BackHandler, ButtonRef, TextRef, FocusManager } from '@youi/react-native-youi';
import { Timeline, BackButton } from '../components';
import { withNavigationFocus } from 'react-navigation';
import PropTypes from 'prop-types';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { activeButtonIndex: 1 };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.backHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => this.backHandlerListener.remove());
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    this.backHandlerListener.remove();
  }

  navigateBack = async () => {
    this.outPromise = this.outTimeline ? this.outTimeline.play : Promise.resolve;
    await this.outPromise();

    if (global.isRoku)
      this.props.navigation.navigate({ routeName: 'Lander' });
    else
      this.props.navigation.goBack(null);

    return true;
  }

  onPress = i => this.setState({ activeButtonIndex: i })

  render = () => {
    const buttons = new Array(3).fill().map((_, i) =>
      <ButtonRef
        key={i}
        name={`Btn-Profile${i + 1}`}
        onLoad={() => FocusManager.focus(this.activeButton)}
        onPress={() => this.onPress(i + 1)}
        ref={ref => {
          if (i + 1 === this.state.activeButtonIndex) this.activeButton = ref;
        }}
      >
        <TextRef name="Active User" text={this.state.activeButtonIndex === i + 1 ? 'Active User' : ''} />
      </ButtonRef>);

    return (
      <Composition source="Auryn_Profile">
        <BackButton
          focusable={this.props.isFocused}
          onPress={this.navigateBack}
        />
        <Timeline name="ProfileIn" onLoad={timeline => timeline.play()} />
        <Timeline name="ProfileOut" ref={timeline => this.outTimeline = timeline} />
        {buttons}
      </Composition>
    );
  }
}

export default withNavigationFocus(Profile);

Profile.propTypes = {
  navigation: PropTypes.object,
  dispatch: PropTypes.func,
  isFocused: PropTypes.bool,
};
