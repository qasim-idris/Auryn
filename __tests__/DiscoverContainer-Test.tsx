/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { DiscoverContainer } from '../src/components';
import { fromApi } from '../src/adapters/dummyAdapter';

import renderer from 'react-test-renderer';

const data = [fromApi(false), fromApi(false), fromApi(false)];

test('renders correctly', () => {
  const tree = renderer.create(<DiscoverContainer data={data} index={0} />).toJSON();
  expect(tree).toMatchSnapshot();
});
