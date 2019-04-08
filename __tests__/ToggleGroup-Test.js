/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ToggleGroup } from '../components';

import renderer from 'react-test-renderer';

const names = ['Button1', 'Button2', 'Button3'];

test('renders correctly', () => {
  const tree = renderer.create(<ToggleGroup names={names}/>).toJSON();
  expect(tree).toMatchSnapshot();
});
