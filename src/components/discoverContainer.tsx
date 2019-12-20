/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem } from '.';
import { Asset } from '../adapters/asset';
import { ListItemPressEvent, ListItemFocusEvent } from './listitem';
import { FormFactor } from '@youi/react-native-youi';

interface DiscoverContainerProps {
  data: Asset[];
  onPressItem?: ListItemPressEvent;
  onFocusItem?: ListItemFocusEvent;
  focusable?: boolean;
  index: number;
}

export const DiscoverContainer: React.FunctionComponent<DiscoverContainerProps> = ({
  data,
  onPressItem,
  onFocusItem,
  focusable,
  index,
}) => {
  if (data.length !== 3) return null;

  const smallItems = (
    <View style={styles.smallContainer}>
      <ListItem
        focusable={focusable}
        onPress={onPressItem}
        onFocus={onFocusItem}
        shouldChangeFocus={index % 2 !== 0}
        imageType={{ type: 'Backdrop', size: 'Small' }}
        data={data[0]}
      />
      <ListItem
        focusable={focusable}
        onPress={onPressItem}
        onFocus={onFocusItem}
        shouldChangeFocus={index % 2 !== 0}
        imageType={{ type: 'Backdrop', size: 'Small' }}
        data={data[1]}
      />
    </View>
  );
  const largeItem = (
    <ListItem
      focusable={focusable}
      onPress={onPressItem}
      onFocus={onFocusItem}
      shouldChangeFocus={index % 2 === 0}
      imageType={{ type: 'Backdrop', size: 'Large' }}
      data={data[2]}
    />
  );
  if (index % 2) {
    return (
      <View style={styles.transparent}>
        {smallItems}
        {largeItem}
      </View>
    );
  }

  return (
    <View style={styles.transparent}>
      {largeItem}
      {smallItems}
    </View>
  );
};

const styles = StyleSheet.create({
  smallContainer: {
    flexDirection: 'row',
    justifyContent: FormFactor.isHandset ? 'space-between' : 'flex-start'
  },
  transparent: {
    backgroundColor: 'transparent'
  }
})
