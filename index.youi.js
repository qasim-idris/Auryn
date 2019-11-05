/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { AppRegistry, FormFactor } from '@youi/react-native-youi';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import store from './store';
import Stack from './navigation';
import { withOrientation } from './components';
import { RotationMode } from './components/withOrientation';
import { AurynHelper } from './aurynHelper';

export default class YiReactApp extends Component {
  render = () =>
    <Provider store={store}>
      <View style={{ backgroundColor: AurynHelper.isRoku ? 'black' : 'transparent', flex: 1 }}>
        <Stack />
      </View>
    </Provider>
}

// eslint-disable-next-line no-negated-condition
const rotationMode = !FormFactor.isHandset ? RotationMode.Landscape : RotationMode.Portrait;

AppRegistry.registerComponent('YiReactApp', () => withOrientation(YiReactApp, rotationMode));
