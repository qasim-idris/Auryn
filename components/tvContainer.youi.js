/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View } from '@youi/react-native-youi';
import { chunk } from 'lodash';
import ListItem from './listitem.youi';
import PropTypes from 'prop-types';

export default class TvContainer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  groupItems = (array, numPerGroup = 2) =>
    chunk(array, numPerGroup).map((data, index) => ({
      key: index.toString(),
      data,
    }));

  render() { // eslint-disable-line max-lines-per-function
    const { data, onPress, onFocus, focusable } = this.props;

    if (data.length !== 2) return null;
    return (
      <View>
          <ListItem
            focusable={focusable}
            onPress={onPress}
            onFocus={onFocus}
            shouldChangeFocus={false}
            imageType="Backdrop" size="Small"
            data={data[0]}
          />
          <ListItem
            focusable={focusable}
            onPress={onPress}
            onFocus={onFocus}
            shouldChangeFocus={false}
            imageType="Backdrop" size="Small"
            data={data[1]}
          />
      </View>
    );
  }
}

TvContainer.propTypes = {
  data: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  onFocus: PropTypes.func,
  index: PropTypes.number,
  focusable: PropTypes.bool,
};
