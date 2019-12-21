/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Composition, TextRef, ButtonRef, ImageRef, FormFactor } from '@youi/react-native-youi';
import { Asset } from '../adapters/asset';
import { View, StyleSheet } from 'react-native';

export type ListItemFocusEvent =
  (asset: Asset, innerRef: React.RefObject<ButtonRef>, shouldChangeFocus?: boolean)
  => void | Promise<void>

export type ListItemPressEvent =
  (asset: Asset, innerRef?: React.RefObject<ButtonRef>)
  => void | Promise<void>

interface ListItemProps {
  imageType: ImageType;
  data: Asset;
  shouldChangeFocus?: boolean;
  onFocus?: ListItemFocusEvent;
  onPress?: ListItemPressEvent;
  focusable?: boolean;
}

export interface ImageType {
  type: 'Poster' | 'Backdrop';
  size: 'Basic' | 'Small' | 'Wide' | 'Large';
}

export class ListItem extends React.Component<ListItemProps> {
  buttonName: string;

  compositionName: string;

  innerRef = React.createRef<ButtonRef>();

  constructor(props: ListItemProps) {
    super(props);
    this.buttonName = `Btn-${this.props.imageType.type}-${this.props.imageType.size}`;
    this.compositionName = `Auryn_Container-${this.buttonName}`;
  }

  shouldComponentUpdate(nextProps: ListItemProps) {
    return nextProps.focusable !== this.props.focusable;
  }

  onFocus = () => {
    this.props.onFocus?.(this.props.data, this.innerRef, this.props.shouldChangeFocus);
  }

  onPress = () => {
    this.props.onPress?.(this.props.data, this.innerRef);
  }

  getGenresString = () => this.props.data.genres?.map(genre => genre?.name).join(', ');

  getTileMetadata = () => {
    const metadata = [];
    if (!FormFactor.isHandset && this.props.imageType.type === 'Backdrop') {
      metadata.push(<TextRef name="Text-Metadata" text={this.props.data.type} />);
      metadata.push(<TextRef name="Unfocus-Text-Title" text={this.props.data.title} />);
      if (this.props.imageType.size == 'Large') {
        metadata.push(<TextRef name="Text-Details" text={this.props.data.details} />);
      }
    }

    if(FormFactor.isHandset && this.props.imageType.size === 'Wide'){
      metadata.push(<TextRef name="Text-Metadata" text={`Season ${Math.ceil(Math.random()*6)}`} />);
    }

    if (FormFactor.isHandset && this.props.imageType.size === 'Large' && this.props.imageType.type === 'Backdrop') {
      metadata.push(<TextRef name="Text-Details" text={this.getGenresString()} />);
    }

    if (this.props.imageType.size === 'Small' && this.props.imageType.type === 'Poster') {
      metadata.push(<TextRef name="Text-Details" text={this.getGenresString()} />);
    }

    return <React.Fragment>{metadata}</React.Fragment>
  }
  render() {
    const { data, imageType, focusable } = this.props;

    return (
      <View style={!FormFactor.isHandset && imageType.size === 'Basic' ? styles.listItem : null}>
        <Composition source={this.compositionName}>
          <ButtonRef
            focusable={focusable}
            ref={this.innerRef}
            onFocus={this.onFocus}
            onPress={this.onPress}
            name={this.buttonName}
          >
            <ImageRef
              name="Image-Dynamic"
              source={{ uri: ['Small', 'Basic'].includes(imageType.size) ? data.thumbs[imageType.type] : data.images[imageType.type] }}
            />

            {imageType.size !== 'Basic' ? <TextRef name="Text-Title" text={data.title} style={{ color:'#f6f1ee' }}/> : null}

            {this.getTileMetadata()}
          </ButtonRef>
        </Composition>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    marginRight: 22,
    marginBottom: 22
  }
})
