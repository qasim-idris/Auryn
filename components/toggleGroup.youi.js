/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import ToggleButton from './toggleButton.youi';
import PropTypes from 'prop-types';

export default class ToggleGroup extends React.Component {
  static defaultProps = {
    names: [],
    onPressItem: () => {},
    prefix: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      toggles: [true].concat(new Array(props.names.length - 1).fill(false)),
    };
    this.buttonRefs = [];
  }

  onToggle = index =>
    this.setState({
      toggles: this.props.names.map((_, i) => i === index),
    })

  getButtonRef = index => this.buttonRefs[index]

  render = () => {
    const { focusable, onPressItem, prefix, names } = this.props;
    return [
    names.map((name, index) =>
      <ToggleButton
        focusable={focusable}
        key={name}
        index={index}
        onToggle={this.onToggle}
        name={prefix + name}
        onPress={onPressItem}
        toggled={this.state.toggles[index]}
        isRadio={true}
        ref={ref => this.buttonRefs[index] = ref}
      />),
    ];
  }
}

ToggleGroup.propTypes = {
  focusable: PropTypes.bool,
  onPressItem: PropTypes.func,
  prefix: PropTypes.string,
  names: PropTypes.array.isRequired,
};
