/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ListRef, ListItem as ListItemType, FormFactor } from '@youi/react-native-youi';
import { DiscoverContainer, ListItem, TvContainer, LiveContainer } from '.';
import { isEqual, chunk } from 'lodash';
import { ImageType, ListItemPressEvent, ListItemFocusEvent } from './listitem';
import { Asset } from '../adapters/asset';
import { AurynHelper } from '../aurynHelper';
import { View } from 'react-native';

export enum ListType {
  Featured, Poster, Grid, LargeBackdrop, WideBackdrop, SmallBackdrop, Live, Search, None
}

interface ListProps<T>  {
  type: ListType;
  focusable?: boolean;
  onPressItem?: ListItemPressEvent;
  onFocusItem?: ListItemFocusEvent;
  name: string;
  horizontal?: boolean;
  data: T[];
  snapToAlignment?: "start" | "center" | "end";
  numColumns?: number;
  extraData?: any;
}

interface ImageSettings extends ImageType { length: number }

export class List extends React.Component<ListProps<Asset>> {

  listRef = React.createRef<ListRef<Asset>>();

  chunkedListRef = React.createRef<ListRef<Asset[]>>();

  getImageSettings = (): ImageSettings => {
    switch (this.props.type) {
      case ListType.Poster:
        return { type: 'Poster', size: 'Small', length: 400 };
      case ListType.Grid:
        return { type: 'Backdrop', size: 'Small', length: 534 };
      case ListType.LargeBackdrop:
      case ListType.Featured:
        return { type: 'Backdrop', size: 'Large', length: 1068 };
      case ListType.Search:
        return { type: 'Poster', size: 'Basic', length: 366 };
      case ListType.WideBackdrop:
        return { type: 'Backdrop', size: 'Wide', length: 606};
      default:
        return { type: 'Backdrop', size: 'Small', length: 534 };
    }
  };

  scrollToIndex = (index: number) => {
    this.listRef.current?.scrollToIndex({index, animated: !AurynHelper.isRoku});
    this.chunkedListRef.current?.scrollToIndex({index, animated: !AurynHelper.isRoku});
  }

  imageSettings: ImageSettings = this.getImageSettings();

  chunkSize: number = this.props.type === ListType.Featured ? 3 : 2;

  shouldComponentUpdate(nextProps: ListProps<Asset>) {
    if (AurynHelper.isRoku) return true;

    if (!isEqual(nextProps.extraData, this.props.extraData)) return true;

    return nextProps.focusable !== this.props.focusable;
  }

  componentDidUpdate(prevProps: ListProps<Asset>) {
    if (!this.props.focusable || this.props.extraData !== prevProps.extraData) {
      AurynHelper.updateCloudScene(this.listRef);
      AurynHelper.updateCloudScene(this.chunkedListRef);
    }
  }

  getItemLayout = (_: object, index: number) => ({
    length: this.imageSettings.length,
    offset: this.imageSettings.length * index,
    index,
  });

  keyExtractor = (_item: Asset[], index: number) => index.toString();

  renderItem = ({ item }: ListItemType<Asset>) => (
    <ListItem
      focusable={this.props.focusable}
      onFocus={this.props.onFocusItem}
      onPress={this.props.onPressItem}
      data={item}
      imageType={this.getImageSettings()}
    />
  );

  renderHeaderItem = () => {
    if(FormFactor.isHandset) {
      switch (this.props.type) {
        case ListType.Grid:
        case ListType.Live:
          return (<View style={{height:232}} />);
        default:
          return null;
      }
    }

    return null;
  }

  isHorizontal = () => {
    if (this.props.numColumns)
      return false;
    else
      return !FormFactor.isHandset || this.props.type === ListType.SmallBackdrop
  }

  renderMultipleItems = ({ item, index }: ListItemType<Asset[]>) => {
    if (this.props.type === ListType.Featured) {
      return (
        <DiscoverContainer
          focusable={this.props.focusable}
          onPressItem={this.props.onPressItem}
          onFocusItem={this.props.onFocusItem}
          data={item}
          index={index}
        />
      );
    }

    if (this.props.type === ListType.Grid) {
      return (
        <TvContainer
          focusable={this.props.focusable}
          onPressItem={this.props.onPressItem}
          onFocusItem={this.props.onFocusItem}
          data={item}
        />
      );
    }

    if (this.props.type === ListType.Live) {
      return (
        <LiveContainer
          onPress={this.props.onPressItem}
          onFocus={this.props.onFocusItem}
          focusable={this.props.focusable}
          data={item}
        />
      );
    }

    return null;
  };

  render() {
    const { type, name } = this.props;
    const data = this.props.data.filter(it => it.details !== "" || it.images.Backdrop.indexOf('null') === -1);

    if ([ListType.Featured, ListType.Grid, ListType.Live].includes(type)) {
      return (
        <ListRef
          name={name}
          data={chunk(data, this.chunkSize)}
          ref={this.chunkedListRef}
          horizontal={!FormFactor.isHandset && type !== ListType.Live}
          initialNumToRender={AurynHelper.isRoku ? 100 : 2}
          getItemLayout={this.getItemLayout}
          renderItem={this.renderMultipleItems}
          extraData={this.props.focusable}
          keyExtractor={this.keyExtractor}
          snapToAlignment={this.props.snapToAlignment}
        />
      );
    }

    return (
      <ListRef
        name={name}
        data={data}
        ref={this.listRef}
        horizontal={this.isHorizontal()}
        initialNumToRender={AurynHelper.isRoku ? 100 : 2}
        getItemLayout={this.getItemLayout}
        renderItem={this.renderItem}
        ListHeaderComponent={this.renderHeaderItem}
        extraData={this.props.focusable}
        snapToAlignment={this.props.snapToAlignment}
        numColumns={this.props.numColumns}
      />
    );
  }
}
