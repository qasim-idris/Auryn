/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { VideoTest } from '../screens/video.youi';
import renderer from 'react-test-renderer';

test('renders correctly', () => {
  const tree = renderer.create(<VideoTest navigation={global.navigation} dispatch={jest.fn()} />).toJSON();
  expect(tree).toMatchSnapshot();
});
