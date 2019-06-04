/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { NavigationBar, ToggleButton } from '../components';

import renderer from 'react-test-renderer';

test('renders correctly', () => {
  const tree = renderer.create(<NavigationBar name="Nav-List"
  scrollEnabled={false}
  horizontal={true}
  focusable={true}
  onPressItem={jest.fn()}
  initialToggleIndex={0}>
      <ToggleButton/>
      <ToggleButton/>
      <ToggleButton/>
    </NavigationBar>).toJSON();
  expect(tree).toMatchSnapshot();
});
