/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { PureComponent } from 'react';
import { TimelineRef } from '@youi/react-native-youi';
import { PropTypes } from 'prop-types';

export default class Timeline extends PureComponent {
  static defaultProps = {
    onLoad: () => {},
    onCompleted: () => {},
    direction: 'forward',
  }

  render() {
    return (
      <TimelineRef
        {...this.props}
        ref={ref => this.ref = ref}
        onLoad={timeline => {
          this.ref = timeline;
          this.props.onLoad(this);
        }}
        loop={this.props.loop || this.props.name.toLowerCase() === 'loop'}
        onCompleted={() => {
          if (this.resolve && !this.props.loop)
            this.resolve('onCompleted');

          this.props.onCompleted();
        }}
      />
    );
  }

  play = (seek = 0) => new Promise(resolve => {
    this.resolve = resolve;
    if (seek)
      this.ref.seek(this.props.direction === 'forward' ? seek : 1 - seek);
    else
      this.ref.play();
  });

  stop = () => new Promise(resolve => {
    this.resolve = resolve;
    this.ref.stop();
  });
}

Timeline.propTypes = {
  direction: PropTypes.oneOf(['forward', 'reverse']),
  loop: PropTypes.bool,
  name: PropTypes.string,
  onLoad: PropTypes.func,
  onCompleted: PropTypes.func,
};
