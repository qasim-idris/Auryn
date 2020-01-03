/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { List } from '../src/components';
import { fromApi } from '../src/adapters/dummyAdapter';

import renderer from 'react-test-renderer';
import { ListType } from '../src/components/list';

const assets = Array.from(Array(10)).map(() => fromApi(false));

test('renders correctly', () => {
  const tree = renderer.create(<List name="Discover" type={ListType.Featured} data={assets} />).toJSON();
  expect(tree).toMatchSnapshot();
});
