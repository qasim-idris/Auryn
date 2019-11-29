/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ToggleButton } from '.';
import { ToggleButtonProps } from './toggleButton';
import { Composition, ScrollRef } from '@youi/react-native-youi';
import { View, StyleSheet, ScrollViewProps } from 'react-native';
import { AurynHelper } from '../aurynHelper';

interface NavigationBarProps extends ScrollViewProps {
  initialToggleIndex: number;
  onPressItem: (index: number) => void;
  name: string;
  focusable?: boolean;
}

export class NavigationBar extends React.PureComponent<NavigationBarProps, { activeButtonIndex: number }> {
  state = { activeButtonIndex: -1 };

  initialToggleIndex = this.props.initialToggleIndex;

  scrollRef = React.createRef<ScrollRef>();

  componentDidMount() {
    AurynHelper.updateCloudScene(this.scrollRef);
  }

  render() {
    // eslint-disable-next-line consistent-return
    const data = React.Children.map(this.props.children, (child, index) => {
      const typedChild = child as React.ReactElement<ToggleButtonProps>;
      if (typedChild.type === ToggleButton) {
        const button = React.cloneElement(typedChild, {
          onPress: () => {
            this.initialToggleIndex = -1;
            if (this.state.activeButtonIndex === index) return;

            this.setState({ activeButtonIndex: index });

            if (this.props.onPressItem)
              this.props.onPressItem(index);
            else if (typedChild.props.onPress)
              typedChild.props.onPress(index);
          },
          toggled: this.initialToggleIndex === index || this.state.activeButtonIndex === index,
          focusOnMount: this.initialToggleIndex === index,
          focusable: this.props.focusable,
          name: 'Btn-Nav-List',
        });
        return <Composition source="Auryn_Container-Btn-Nav-List">{button}</Composition>;
      }
    });

    return <ScrollRef {...this.props} ref={this.scrollRef}>
      <View style={styles.buttonContainer}>
        {data}
      </View>
    </ScrollRef>;
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    minWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
