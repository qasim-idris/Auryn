/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { PureComponent } from 'react';
import { ButtonRef } from '@youi/react-native-youi';
import PropTypes from 'prop-types';

export default class BackButton extends PureComponent {
  constructor(props) {
    super(props);
    this.hasHardwareBackButton = global.hasHardwareBackButton;
  }

  render = () =>
    <ButtonRef
      {...this.props}
      name="Btn-Back"
      visible={!this.hasHardwareBackButton}
      focusable={this.props.focusable && !this.hasHardwareBackButton}
    />
}

BackButton.propTypes = {
  focusable: PropTypes.bool,
};

