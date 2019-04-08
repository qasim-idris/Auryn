/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { PureComponent } from 'react';
import { ButtonRef } from '@youi/react-native-youi';
import { Timeline } from '.';
import PropTypes from 'prop-types';

export default class ToggleButton extends PureComponent {
  static defaultProps = {
    onFocus: () => { },
    onToggle: () => { },
    onPress: () => { },
  }

  constructor(props) {
    super(props);
    this.state = {
      toggled: props.index === 0,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.toggled !== prevProps.toggled) {
      this.setState({
        toggled: this.props.toggled,
      }, () => {
        this.state.toggled || !global.isRoku ? this.toggleOnTimeline.play() : this.toggleOffTimeline.play();
      });
    }
  }

  render = () => {
    const off = global.isRoku ? <Timeline
      name="Toggle-Off"
      direction={'forward'}
      ref={ref => this.toggleOffTimeline = ref}
    /> : null;

    return <ButtonRef
      focusable={this.props.focusable}
      name={this.props.name}
      ref={ref => this.ref = ref}
      onFocus={() => this.props.onFocus(this.ref)}
      onPress={() => {
        if (this.state.toggled && this.props.isRadio) return;

        this.props.onPress(this.props.index);
        this.props.onToggle(this.props.index);

        this.setState({
          toggled: !this.state.toggled,
        });
      }}
    >
      <Timeline
        name="Toggle-On"
        direction={this.state.toggled || global.isRoku ? 'forward' : 'reverse'}
        ref={ref => this.toggleOnTimeline = ref}
        onLoad={() => {
          if (this.state.toggled)
            this.toggleOnTimeline.play();
        }}
      />
      {off}
    </ButtonRef>;
  }
}

ToggleButton.propTypes = {
  name: PropTypes.string.isRequired,
  focusable: PropTypes.bool,
  toggled: PropTypes.bool,
  isRadio: PropTypes.bool,
  onFocus: PropTypes.func,
  onPress: PropTypes.func,
  onToggle: PropTypes.func,
  index: PropTypes.number,
};
