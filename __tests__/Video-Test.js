/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Video } from '../screens';
import renderer from 'react-test-renderer';
import { fromApi } from '../adapters/dummyAdapter';
import { Provider } from 'react-redux';
import store from '../store';

const asset = fromApi(false);

test('renders correctly', () => {
  const tree = renderer.create(<Provider store={store}>
      <Video
        asset={asset}
        navigation={global.navigation}
      />
    </Provider>).toJSON();
  expect(tree).toMatchSnapshot();
});
