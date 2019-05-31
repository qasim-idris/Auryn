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
import { View, StyleSheet } from 'react-native';

interface ToggleGroupListProps {
  initialToggleIndex: number;
  onPressItem: (index: number) => void;
  name: string;
};

export class ToggleGroupList extends React.PureComponent<ToggleGroupListProps, { activeButtonIndex: number }> {
  state = { activeButtonIndex: -1 };

  initialToggleIndex = this.props.initialToggleIndex;

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
        });
        return <View style={styles.buttonContainer}><Composition source="Auryn_Btn-Nav-List-Container">{button}</Composition></View>;
      };
    });

    return <ScrollRef scrollEnabled={false} name={this.props.name} horizontal={true}>
        {data}
      </ScrollRef>;
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
