import React, { Component } from 'react';
import { Composition, TextRef, ButtonRef, ImageRef, ViewRef } from '@youi/react-native-youi';
import { movieGenres } from '../data/live';
import { Timeline } from '.';
import { Asset } from '../adapters/asset';
import { ListItemFocusEvent, ListItemPressEvent } from './listitem';


interface LiveListItemProps {
  onPress?: ListItemPressEvent;
  onFocus?: ListItemFocusEvent;
  shouldChangeFocus: boolean;
  data: Asset;
  focusable?: boolean;
}

export class LiveListItem extends Component<LiveListItemProps> {
  static getRemainingString = (movie: Asset) => {
    if (!movie.live) return '0';
    const remaining = movie.live.duration - movie.live.elapsed;

    if (remaining < 60)
      return `${remaining % 60}min`;

    return `${(remaining - (remaining % 60)) / 60}h ${remaining % 60}min`;
  }

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
    this.props.onFocus?.(this.props.data.id, this.props.data.type, this.buttonRef, this.props.shouldChangeFocus);
  }

  onPress = () => {
    this.props.onPress?.(this.props.data.id, this.props.data.type, this.buttonRef);
  }

  getGenresString = () => this.props.data.genres?.map(id => movieGenres.find(genre => genre.id === id)?.name).join(', ');

  render() {
    return (
      <Composition source="Auryn_Live-Asset-Root">
        <ButtonRef
          name="Live-Asset"
          ref={this.buttonRef}
          onFocus={this.onFocus}
          onPress={this.onPress}
          focusable={this.props.focusable}
        >
          <ImageRef
            name="Image-Dynamic-Live-Asset"
            source={ { uri: this.props.data.thumbs.Backdrop } } />
          <TextRef name="Text-Title" text={this.props.data.title} />
          <ViewRef name="Details">
            <TextRef name="Text-Detail-1" visible={false} />
            <TextRef name="•" visible={false} />
            <TextRef name="Text-Detail-2" text={this.getGenresString()} />
          </ViewRef>
          <ViewRef name="Metadata">
            <ImageRef
              style={{ resizeMode: 'contain' }}
              name="Image-Dynamic-Live-Logo"
              source={ { uri: `res://drawable/default/${this.props.data.live?.channel.name}.png` } } />
            <TextRef
              name="Text-TimeRemaining"
              text={`${LiveListItem.getRemainingString(this.props.data)} remaining`} />
          </ViewRef>
          <ViewRef name="Progress-Bar">
            <Timeline name="ProgressStart" ref={this.progressTimeline} />
          </ViewRef>
        </ButtonRef>
      </Composition>
    );
  }
}
