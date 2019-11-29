/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View } from '@youi/react-native-youi';
import { Provider } from 'react-redux';
import store from './store';
import Stack from './navigation';
import { AurynHelper } from './aurynHelper';

class YiReactApp extends React.Component {
  render = () =>
    <Provider store={store}>
      <View style={{ backgroundColor: AurynHelper.isRoku ? 'black' : 'transparent', flex: 1 }}>
        <Stack />
      </View>
    </Provider>
}

export default YiReactApp;
