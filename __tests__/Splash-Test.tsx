/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Splash } from '../screens';
import { Provider } from 'react-redux';
import { navigationProp } from '../__mocks__/navigation';
import store from '../store';
import renderer from 'react-test-renderer';

test('renders correctly with error', () => {
  const tree = renderer
    .create(<Provider store={store}>
      <Splash {...navigationProp} error="Splash Screen with Error"/>
    </Provider>)
    .toJSON();

  expect(tree).toMatchSnapshot();
});

test('renders correctly', () => {
  const tree = renderer
    .create(<Provider store={store}>
      <Splash {...navigationProp} />
    </Provider>)
    .toJSON();

  expect(tree).toMatchSnapshot();
});


