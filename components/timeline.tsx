/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { TimelineRef, TimelineRefProps } from '@youi/react-native-youi';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface TimelineProps extends Omit<TimelineRefProps, 'onLoad'> {
  onCompleted: () => void;
  name: string;
  playOnLoad: boolean;
};

export class Timeline extends React.PureComponent<TimelineProps> {
  static defaultProps = {
    onCompleted: () => {},
    direction: 'forward',
    playOnLoad: false,
  };

  innerRef = React.createRef<TimelineRef>();

  resolve?: (value?: string) => void;

  componentDidMount() {
    if (this.props.playOnLoad && this.innerRef.current)
      this.innerRef.current.play();
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

  play = (seek: number = 0) =>
    new Promise(resolve => {
      this.resolve = resolve;
      if (this.innerRef.current) {
        if (seek)
          this.innerRef.current.seek(this.props.direction === 'forward' ? seek : 1 - seek);
        else
          this.innerRef.current.play();
      }
    });

  stop = () =>
    new Promise(resolve => {
      this.resolve = resolve;
      if (this.innerRef.current)
        this.innerRef.current.stop();
    });

  onCompleted = () => {
    if (this.resolve && !this.props.loop) this.resolve('onCompleted');

    this.props.onCompleted();
  };
}
