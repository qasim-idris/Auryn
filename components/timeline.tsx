/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { TimelineRef, TimelineRefProps } from '@youi/react-native-youi';

interface TimelineProps extends TimelineRefProps {
  onCompleted: () => void;
  name: string;
  autoplay: boolean;
}

export class Timeline extends React.PureComponent<TimelineProps> {
  static defaultProps = {
    onCompleted: () => {},
    direction: 'forward',
    autoplay: false,
  };

  innerRef = React.createRef<TimelineRef>();

  resolve?: (value?: string) => void;

  componentDidMount() {
    if (this.props.autoplay)
      this.play();
  }

  render() {
    return (
      <TimelineRef
        {...this.props}
        name={this.props.name}
        ref={this.innerRef}
        loop={this.props.loop || this.props.name.toLowerCase() === 'loop'}
        onCompleted={this.onCompleted}
      />
    );
  }

  play = (seek = 0) =>
    new Promise(resolve => {
      this.resolve = resolve;
      if (seek)
        this.innerRef.current?.seek(this.props.direction === 'forward' ? seek : 1 - seek);
      else
        this.innerRef.current?.play();
    });

  stop = () =>
    new Promise(resolve => {
      this.resolve = resolve;
      this.innerRef.current?.stop();
    });

  onCompleted = () => {
    if (!this.props.loop) this.resolve?.('onCompleted');

    this.props.onCompleted();
  };
}
