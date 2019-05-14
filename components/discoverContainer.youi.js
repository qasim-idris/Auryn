/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View } from '@youi/react-native-youi';
import ListItem from './listitem.youi';
import PropTypes from 'prop-types';

export default class DiscoverContainer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() { // eslint-disable-line max-lines-per-function
    const { data, onPress, onFocus, focusable, index } = this.props;

    if (data.length !== 3) return null;

    const smallItems = <View style={{ flexDirection: 'row' }}>
        <ListItem
          focusable={focusable}
          onPress={onPress}
          onFocus={onFocus}
          shouldChangeFocus={index % 2 !== 0}
          imageType="Backdrop" size="Small"
          data={data[0]}
        />
        <ListItem
          focusable={focusable}
          onPress={onPress}
          onFocus={onFocus}
          shouldChangeFocus={index % 2 !== 0}
          imageType="Backdrop" size="Small"
          data={data[1]}
        />
      </View>;

    const largeItem = <ListItem
      focusable={focusable}
      onPress={onPress}
      onFocus={onFocus}
      shouldChangeFocus={index % 2 === 0}
      imageType="Backdrop" size="Large"
      data={data[2]}
    />;

    if (index % 2) {
      return (
        <View>
          {smallItems}
          {largeItem}
        </View>
      );
    }

    return (
      <View>
        {largeItem}
        {smallItems}
      </View>
    );
  }
}

DiscoverContainer.propTypes = {
  data: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  onFocus: PropTypes.func,
  index: PropTypes.number,
  focusable: PropTypes.bool,
};
