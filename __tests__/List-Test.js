/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { List } from '../components';

import renderer from 'react-test-renderer';

test('renders correctly', () => {
  const tree = renderer.create(<List type="Discover" name="List" data={[]}/>).toJSON();
  expect(tree).toMatchSnapshot();
});
