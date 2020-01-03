import React, { Fragment } from 'react';

import { View, BackHandler } from 'react-native';
import { ListRef, ListItem, ViewRef, FocusManager, ButtonRef } from '@youi/react-native-youi';
import { connect } from 'react-redux';
import { Timeline, LiveListItem } from '..';
import { AurynAppState } from '../../reducers';
import { ListItemPressEvent } from '../listitem';
import { VideoContext } from './context';
import { Asset } from '../../adapters/asset';
import { getDetailsByIdAndType } from '../../actions/tmdbActions';
import { getVideoSourceByYoutubeId } from '../../actions/youtubeActions';
import { AurynHelper } from '../../aurynHelper';

type TvGuideDispatchProps = typeof mapDispatchToProps;

interface TvGuideProps extends TvGuideDispatchProps {
  liveData: Asset[];
  visible: boolean;
  onPressItem: ListItemPressEvent;
  onOpen: () => void;
  onClose: () => void;
}

const initialState = {
  channelId: 'weather1',
  isOpen: false,
};

class TvGuideComponent extends React.Component<TvGuideProps> {
  declare context: React.ContextType<typeof VideoContext>;

  static contextType = VideoContext;

  tvGuideCloseButtonRef = React.createRef<ButtonRef>();

  showGuideTimeline = React.createRef<Timeline>();

  hideGuideTimeline = React.createRef<Timeline>();

  firstListItem = React.createRef<LiveListItem>();

  state = initialState;

  componentDidMount() {
    if (this.tvGuideCloseButtonRef.current) {
      AurynHelper.togglePointerEvents(this.tvGuideCloseButtonRef, false);
    }
  }

  componentWillUnmount() {
    if (this.state.isOpen) this.hide();
  }

  navigateBack = () => {
    if (this.state.isOpen) {
      this.hide();
      return true;
    }

    return false;
  };

  show = async () => {
    if (this.state.isOpen)
      return;

    BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    this.setState({ isOpen: true });
    this.context.setTvGuideOpen(true);
    AurynHelper.togglePointerEvents(this.tvGuideCloseButtonRef, true);
    await this.showGuideTimeline.current?.play();
    this.props.onOpen?.();
    if (this.firstListItem.current) FocusManager.focus(this.firstListItem.current);
  };

  hide = async () => {
    if (!this.state.isOpen)
      return;

    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
    this.props.onClose?.();
    this.setState({ isOpen: false });
    this.context.setTvGuideOpen(false);
    AurynHelper.togglePointerEvents(this.tvGuideCloseButtonRef, false);
    await this.hideGuideTimeline.current?.play();
  };

  openTvGuide = () => {
    this.state.isOpen ? this.hide() : this.show();
  };

  onPressItem: ListItemPressEvent = (asset: Asset) => {
    this.props.onPressItem?.(asset);

    if (asset.id === this.context.asset.id) return;

    this.context.setAsset(asset);

    this.hide();
  };

  renderLiveItem = ({ item, index }: ListItem<Asset>) => (
    <View style={{ marginBottom: 20, marginTop: index === 0 ? 60 : 0 }}>
      <LiveListItem
        onPress={this.onPressItem}
        data={item}
        focusable={this.state.isOpen}
        ref={index === 0 ? this.firstListItem : null}
      />
    </View>
  );

  render() {
    const { isLive, tvGuideOpen } = this.context;

    return (
      <Fragment>
        <ButtonRef
          name="Btn-TvGuide"
          onPress={this.openTvGuide}
          visible={isLive}
          focusable={!tvGuideOpen}
        />

        <ViewRef name="Live-TvGuide" visible={isLive}>
          <Timeline name="ShowGuide" ref={this.showGuideTimeline} />
          <Timeline name="HideGuide" ref={this.hideGuideTimeline} />
          <ListRef
            name="Live-TvGuide-List"
            data={this.props.liveData}
            renderItem={this.renderLiveItem}
            extraData={this.state.isOpen}
          />
          <ButtonRef name="Btn-TvGuide-Close" onPress={this.hide} ref={this.tvGuideCloseButtonRef} />
        </ViewRef>
      </Fragment>
    );
  }
}

const mapDispatchToProps = {
  getDetailsByIdAndType,
  getVideoSourceByYoutubeId,
};

const mapStateToProps = (store: AurynAppState) => ({
  liveData: store.tmdbReducer.live.data,
});

export const TvGuide = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
  TvGuideComponent as any,
);
