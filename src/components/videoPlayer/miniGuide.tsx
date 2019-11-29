import React, { Fragment } from 'react';
import { ListRef, ListItem, ViewRef, FocusManager, BackHandler, ButtonRef } from '@youi/react-native-youi';
import { connect } from 'react-redux';
import { Timeline, LiveListItem } from '..';
import { View } from 'react-native';
import { AurynAppState } from '../../reducers';
import { ListItemPressEvent } from '../listitem';
import { VideoContext, VideoContextType } from './context';
import { Asset } from '../../adapters/asset';

interface MiniGuideProps {
  liveData: Asset[];
  asset: Asset;
  visible: boolean;
  onPressItem: ListItemPressEvent;
  onOpen: () => void;
  onClose: () => void;
}

const initialState = {
  channelId: 'weather1',
  isOpen: false,
};

class MiniGuideComponent extends React.Component<MiniGuideProps> {
  declare context: React.ContextType<typeof VideoContext>

  static contextType = VideoContext;

  showGuideTimeline = React.createRef<Timeline>();

  hideGuideTimeline = React.createRef<Timeline>();

  firstListItem = React.createRef<LiveListItem>();

  state = initialState;

  componentWillUnmount() {
    if (this.state.isOpen)
      this.hide();
  }

  navigateBack = () => {
    if (this.state.isOpen) {
      this.hide();
      return true;
    }

    return false;
  }

  show = async () => {
    if (this.state.isOpen) return;
    BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    this.setState({ isOpen: true });
    this.context.setMiniGuideOpen(true);
    await this.showGuideTimeline.current?.play();
    this.props.onOpen?.();
    if (this.firstListItem.current)
      FocusManager.focus(this.firstListItem.current);
  }

  hide = async () => {
    if (!this.state.isOpen) return;
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
    this.props.onClose?.();
    this.setState({ isOpen: false });
    this.context.setMiniGuideOpen(false);
    await this.hideGuideTimeline.current?.play();
  }

  openMiniGuide = () => {
    this.state.isOpen ? this.hide() : this.show();
  }

  onPressItem: ListItemPressEvent = (asset: Asset) => {
    this.props.onPressItem(asset);
  }

  renderLiveItem = ({ item, index }: ListItem<Asset>) =>
    <View style={{ marginBottom: 20 }}>
      <LiveListItem
        onPress={this.onPressItem}
        data={item}
        focusable={this.state.isOpen}
        ref={index === 0 ? this.firstListItem : null}
      />
    </View>;

  render() {
    return (
      <Fragment>
        <ButtonRef
          name="Btn-MiniGuide"
          onPress={this.openMiniGuide}
          visible={this.context.isLive}
          focusable={!this.context.miniGuideOpen}
        />

        <ViewRef name="Live-MiniGuide" visible={this.context.isLive}>
          <Timeline name="ShowGuide" ref={this.showGuideTimeline} />
          <Timeline name="HideGuide" ref={this.hideGuideTimeline} />
          <ListRef
            name="Live-MiniGuide-List"
            data={this.props.liveData}
            renderItem={this.renderLiveItem}
            extraData={this.state.isOpen}
          />
        </ViewRef>
      </Fragment>
    );
  }
}

const mapStateToProps = (store: AurynAppState) =>  ({
  liveData: store.tmdbReducer.live.data,
});

export const MiniGuide = connect(mapStateToProps, null, null, { forwardRef: true })(MiniGuideComponent);
