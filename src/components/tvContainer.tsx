/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormFactor } from '@youi/react-native-youi';
import { ListItem, ListItemPressEvent, ListItemFocusEvent, ImageType } from './listitem';
import { Asset } from '../adapters/asset';

interface TvContainerProps {
  data: Asset[];
  onPressItem?: ListItemPressEvent;
  onFocusItem?: ListItemFocusEvent;
  focusable?: boolean;
}

export const TvContainer: React.FunctionComponent<TvContainerProps> = ({ data, onPressItem, onFocusItem, focusable }) => {
  if (data.length !== 2) return null;
  const imageType: ImageType = {
    type: FormFactor.isHandset ? 'Poster' : 'Backdrop',
    size: 'Small'
  };
  return (
    <View style={styles.container}>
      <ListItem
        focusable={focusable}
        onPress={onPressItem}
        onFocus={onFocusItem}
        imageType={imageType}
        data={data[0]}
      />
      <ListItem
        focusable={focusable}
        onPress={onPressItem}
        onFocus={onFocusItem}
        imageType={imageType}
        data={data[1]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: FormFactor.isHandset ? 'row' : 'column',
    justifyContent:'center'
  }
})
