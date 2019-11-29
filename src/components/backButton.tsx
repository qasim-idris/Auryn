/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ButtonRef, ButtonRefProps } from '@youi/react-native-youi';
import { AurynHelper } from '../aurynHelper';

export const BackButton: React.FunctionComponent<Partial<ButtonRefProps>> = ({ focusable, ...otherProps }) => (
  <ButtonRef
    {...otherProps}
    name="Btn-Back"
    visible={!AurynHelper.hasHardwareBackButton}
    focusable={focusable && !AurynHelper.hasHardwareBackButton}
  />
);
