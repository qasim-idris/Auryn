import React from 'react';
import { FormFactor } from '@youi/react-native-youi';
import { View, StyleSheet } from 'react-native';
import { LiveListItem } from '.';
import { Asset } from '../adapters/asset';
import { ListItemPressEvent, ListItemFocusEvent } from './listitem';

interface LiveContainerProps {
  data: Asset[];
  onPress?: ListItemPressEvent;
  onFocus?: ListItemFocusEvent;
  focusable?: boolean;
}

export const LiveContainer: React.FunctionComponent<LiveContainerProps> = ({ data, onPress, onFocus, focusable })  => {
  if (data.length !== 2) return null;

  return (
    <View style={styles.container}>
      <LiveListItem
        onPress={onPress}
        onFocus={onFocus}
        focusable={focusable}
        data={data[0]}
        shouldChangeFocus={false}
      />
      <View style={styles.separator}/>
      <LiveListItem
        onPress={onPress}
        focusable={focusable}
        onFocus={onFocus}
        data={data[1]}
        shouldChangeFocus={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: FormFactor.isHandset ? 'column' : 'row',
    marginBottom: FormFactor.isHandset ? 33 : 20,
    alignItems:'center',
    justifyContent: 'center'
  },
  separator: {
    height: 1,
    width: 20,
    marginTop: FormFactor.isHandset ? 20 : 0
  }
})
