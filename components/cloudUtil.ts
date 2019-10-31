/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { NativeModules, findNodeHandle } from 'react-native';

const { Cloud } = NativeModules;

export const CloudUtil: { isRoku: boolean; updateScene: (component: React.RefObject<any>) => void } = {
  updateScene: component =>
    setTimeout(() => {
      Cloud.exportSubtree(findNodeHandle(component.current), true);
      Cloud.sendFocusMap();
    }, 300),
  isRoku: Cloud.isCloudServer,
};

