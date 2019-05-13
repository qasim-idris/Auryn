/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { ListRef } from '@youi/react-native-youi';
import { DiscoverContainer, ListItem, TvContainer } from '.';
import PropTypes from 'prop-types';
import { isEqual, chunk } from 'lodash';

export default class List extends Component {
  static defaultProps = {
    extraData: [],
  }

  constructor(props) {
    super(props);
    this.imageSettings = this.getImageSettings();
  }

  getImageSettings = () => {
    switch (this.props.type) {
      case 'Movies':
        return { type: 'Poster', size: 'Small', length: 400 };
      case 'Shows':
        return { type: 'Backdrop', size: 'Small', length: 534 };
      case 'Live':
      case 'Discover':
        return { type: 'Backdrop', size: 'Large', length: 1068 };
      default:
        return { type: 'Backdrop', size: 'Small', length: 534 };
    }
  }

  shouldComponentUpdate(nextProps) {
    if (global.isRoku) return true;

    if (!isEqual(nextProps.extraData, this.props.extraData))
      return true;

    return nextProps.focusable !== this.props.focusable;
  }

  getItemLayout = (_, index) => ({
    index,
    length: this.imageSettings.length,
    offset: this.imageSettings.length * index,
  })

  renderItem = ({ item, index }) => {
    if (this.props.type === 'Discover') {
      return (
        <DiscoverContainer
          focusable={this.props.focusable}
          onPress={this.props.onPressItem}
          onFocus={this.props.onFocusItem}
          data={item}
          index={index}
          name={this.props.name}
        />
      );
    }

    if (this.props.type === 'Shows') {
      return (
        <TvContainer
          focusable={this.props.focusable}
          onPress={this.props.onPressItem}
          onFocus={this.props.onFocusItem}
          data={item}
          name={this.props.name}
        />
      );
    }

    return (
      <ListItem
        imageType={this.imageSettings.type}
        size={this.imageSettings.size}
        focusable={this.props.focusable}
        onFocus={this.props.onFocusItem}
        onPress={this.props.onPressItem}
        data={item}
        index={index}
        name={this.props.name}
      />
    );
  }

  render() {
    const { data, name } = this.props;

    let items;
    switch (name.toLowerCase()) {
      case 'discover':
        items = chunk(data, 3);
        break;
      case 'shows':
        items = chunk(data, 2);
        break;
      default:
        items = data;
    }

    return (
      <ListRef
        name={name}
        data={items}
        horizontal={true}
        initialNumToRender={global.isRoku ? 100 : 2}
        getItemLayout={this.getItemLayout}
        renderItem={this.renderItem}
        extraData={this.props.focusable}
      />
    );
  }
}

List.propTypes = {
  type: PropTypes.oneOf(['Discover', 'Movies', 'Shows']).isRequired,
  name: PropTypes.string,
  focusable: PropTypes.bool,
  onPressItem: PropTypes.func,
  onFocusItem: PropTypes.func,
  data: PropTypes.array.isRequired,
  ref: PropTypes.func,
  extraData: PropTypes.any,
};
