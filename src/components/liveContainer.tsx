import React from 'react';
import { FormFactor } from '@youi/react-native-youi';
import { View } from 'react-native';
import { LiveListItem } from '.';
import { Asset } from '../adapters/asset';
import { ListItemPressEvent, ListItemFocusEvent } from './listitem';

interface LiveContainerProps {
  data: Asset[];
  onPress?: ListItemPressEvent;
  onFocus?: ListItemFocusEvent;
  focusable?: boolean;
}

export class LiveContainer extends React.PureComponent<LiveContainerProps> {
  render() { // eslint-disable-line max-lines-per-function
    const { data, onPress, onFocus, focusable } = this.props;
    if (data.length !== 2) return null;
    return (
      <View style={{ flexDirection: FormFactor.isHandset ? 'column' : 'row', marginBottom: 20 }}>
        <LiveListItem
          onPress={onPress}
          onFocus={onFocus}
          focusable={focusable}
          data={data[0]}
          shouldChangeFocus={false}
        />
        <View style={{ height: 1, width: 20, marginTop: FormFactor.isHandset ? 20 : 0 }}/>
        <LiveListItem
          onPress={onPress}
          focusable={focusable}
          onFocus={onFocus}
          data={data[1]}
          shouldChangeFocus={false}
        />
      </View>
    );
  }
}
