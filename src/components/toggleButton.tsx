/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ButtonRef, RefProps, TextRef, ImageRef, FocusManager, FormFactor } from '@youi/react-native-youi';
import { Timeline } from '.';
import { AurynHelper } from '../aurynHelper';

export type ToggleButtonPress = (index: number) => void;

export interface ToggleButtonProps extends Omit<RefProps, 'name'> {
  name?: string;
  index: number;
  toggled?: boolean;
  onToggle?: (index: number) => void;
  onFocus?: (buttonRef: React.RefObject<ButtonRef>) => void;
  onPress?: ToggleButtonPress;
  isRadio?: boolean;
  icon?: string;
  iconToggled?: string;
  title?: string;
  focusOnMount?: boolean;
}

export class ToggleButton extends React.PureComponent<ToggleButtonProps, { toggled?: boolean }> {
  static defaultProps = {
    onToggle: () => {},
    onFocus: () => {},
    onPress: () => {},
    index: 0,
  };

  state = { toggled: this.props.index === 0 };

  toggleOffTimeline = React.createRef<Timeline>();

  toggleOnTimeline = React.createRef<Timeline>();

  innerRef = React.createRef<ButtonRef>();

  componentDidMount() {
    // setTimeout to get around timing issue when focusing within a ScrollRef
    // The alternative is to use onCompositionDidLoad on the ButtonRef.
    if (this.props.focusOnMount)
      setTimeout(() => FocusManager.focus(this.innerRef.current), 0);
  }

  componentDidUpdate(prevProps: ToggleButtonProps) {
    if (this.props.toggled !== prevProps.toggled) {
      if (this.props.toggled || !AurynHelper.isRoku)
        this.toggleOnTimeline.current?.play();
      else
        this.toggleOffTimeline.current?.play();
    }
  }

  onFocus = () => { this.props.onFocus?.(this.innerRef); };

  onPress = () => {
    this.props.onPress?.(this.props.index);

    this.props.onToggle?.(this.props.index);

    this.setState({ toggled: !this.state.toggled });
  };

  render = () => (
    <ButtonRef
      focusable={this.props.focusable}
      name={this.props.name || 'Btn-Nav-List'}
      ref={this.innerRef}
      onFocus={this.onFocus}
      onPress={this.onPress}
      visible={this.props.visible}
    >
      <Timeline
        name="Toggle-On"
        direction={this.props.toggled || AurynHelper.isRoku ? 'forward' : 'reverse'}
        ref={this.toggleOnTimeline}
        autoplay={this.props.toggled}
      />
      {this.props.title ??
        <React.Fragment>
          <TextRef name="title" text={this.props.title} style={{ color: '#F1F1F1' }} />
          {this.props.name === 'Btn-Nav-List' ??
            <React.Fragment>
              <ImageRef name="Nav-Icon" source={{ uri: this.props.icon }} />
              <ImageRef
                name="Nav-Icon-Toggled"
                style={{ resizeMode: 'contain' }}
                source={{ uri: this.props.iconToggled }}
              />
            </React.Fragment>
          }
          {FormFactor.isTV ?? <TextRef name="title-toggled" text={this.props.title} />}
        </React.Fragment>
      }
      {AurynHelper.isRoku ?? <Timeline name="Toggle-Off" ref={this.toggleOffTimeline} />}
    </ButtonRef>
  );
}
