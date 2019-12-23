import React, { Component } from 'react';
import { Composition, TextRef, ButtonRef, ImageRef, ViewRef, FormFactor, FocusDirection, FocusManager } from '@youi/react-native-youi';

import { Timeline } from '.';
import { Asset } from '../adapters/asset';
import { ListItemFocusEvent, ListItemPressEvent } from './listitem';

interface LiveListItemProps {
  onPress?: ListItemPressEvent;
  onFocus?: ListItemFocusEvent;
  nextFocusDirection?: FocusDirection;
  data: Asset;
  focusable?: boolean;
  visible?: boolean;
}

export class LiveListItem extends Component<LiveListItemProps> {
  static getRemainingString = (movie?: Asset) => {
    if (!movie?.live) return '0';
    const remaining = movie.live.duration - movie.live.elapsed;

    if (remaining < 60) return `${remaining % 60}min`;

    return `${(remaining - (remaining % 60)) / 60}h ${remaining % 60}min`;
  };

  shouldComponentUpdate(nextProps: LiveListItemProps) {
    return nextProps.focusable !== this.props.focusable;
  }

  componentDidMount() {
    if (this.props.data.live)
      this.progressTimeline?.current?.play(this.props.data.live?.elapsed / this.props.data.live?.duration);
  }

  buttonRef = React.createRef<ButtonRef>();

  progressTimeline = React.createRef<Timeline>();

  onFocus = () => {
    if (this.props.nextFocusDirection === 'right' && this.buttonRef.current) {
      FocusManager.setNextFocus(this.buttonRef.current, this.buttonRef.current, this.props.nextFocusDirection);
    }

    this.props.onFocus?.(this.props.data, this.buttonRef);
  };

  onPress = () => {
    this.props.onPress?.(this.props.data, this.buttonRef);
  };

  getGenresString = () => this.props.data.genres?.map((genre) => genre.name).join(', ');

  render() {
    return (
      <Composition source="Auryn_Live-Asset-Root">
        <ButtonRef
          name="Live-Asset"
          ref={this.buttonRef}
          onFocus={this.onFocus}
          onPress={this.onPress}
          focusable={this.props.focusable}
          visible={this.props.visible}
        >
          <ImageRef name="Image-Dynamic-Live-Asset" source={{ uri: this.props.data.thumbs.Poster }} />
          <TextRef name="Text-Title" text={this.props.data.title} />

          <TextRef name="Text-Detail-1" text={this.getGenresString()} />
          {!FormFactor.isHandset ? <TextRef name="Text-Detail-2" text={this.getGenresString()} /> : null}

          <ViewRef name="Metadata">
            <ImageRef
              style={{ resizeMode: 'contain' }}
              name="Image-Dynamic-Live-Logo"
              source={{ uri: `res://drawable/default/${this.props.data.live?.channel.name}.png` }}
            />
            <TextRef name="Text-TimeRemaining" text={`${LiveListItem.getRemainingString(this.props.data)} remaining`} />
          </ViewRef>
          <ViewRef name="Progress-Bar">
            <Timeline name="ProgressStart" ref={this.progressTimeline} />
          </ViewRef>
        </ButtonRef>
      </Composition>
    );
  }
}
