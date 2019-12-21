/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { AppRegistry } from 'react-native';
import { FormFactor } from '@youi/react-native-youi';
import YiReactApp from './src/App';

import { withOrientation } from './src/components';
import { RotationMode } from './src/components/withOrientation';

const rotationMode = !FormFactor.isHandset ? RotationMode.Landscape : RotationMode.Portrait;

AppRegistry.registerComponent('YiReactApp', () => withOrientation(YiReactApp, rotationMode));
