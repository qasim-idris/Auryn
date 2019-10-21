/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { AppRegistry } from '@youi/react-native-youi';
import { Provider } from 'react-redux';
import store from './store';
import Stack from './navigation';

export default class YiReactApp extends Component {
  render = () =>
    <Provider store={store}>
      <Stack />
    </Provider>
}

AppRegistry.registerComponent('YiReactApp', () => YiReactApp);
