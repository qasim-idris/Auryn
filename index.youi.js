/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { AppRegistry, DeviceInfo } from '@youi/react-native-youi';
import { Provider } from 'react-redux';
import store from './store';
import Stack from './navigation';
import { BackgroundImage } from './components';

export default class YiReactApp extends Component {
  constructor() {
    super();
    const systemName = DeviceInfo.getSystemName();
    global.hasHardwareBackButton = !['iOS'].includes(systemName);
    global.isRoku = systemName === 'RokuOS';
  }

  render = () =>
    <Provider store={store}>
      <BackgroundImage source={{ 'uri': 'res://drawable/default/Background-Gradient.png' }}>
        <Stack />
      </BackgroundImage>
    </Provider>
}

AppRegistry.registerComponent('YiReactApp', () => YiReactApp);
