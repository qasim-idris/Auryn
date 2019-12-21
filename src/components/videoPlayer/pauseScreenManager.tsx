import React from 'react';
import { connect } from 'react-redux';
import { ImageRef, ViewRef, TextRef, ButtonRef } from '@youi/react-native-youi';

import { getDetailsByIdAndType } from './../../actions/tmdbActions';
import { VideoContext } from './context';
import { Asset } from './../../adapters/asset';
import { Timeline } from './../timeline';
import { withNavigation, NavigationInjectedProps } from 'react-navigation';
import { getVideoSourceByYoutubeId } from '../../actions/youtubeActions';

type PauseScreenDispatchProps = typeof mapDispatchToProps;

interface PauseScreenManagerProps extends NavigationInjectedProps, PauseScreenDispatchProps {
  related: Asset[];
  onClosed: () => void;
}

const END_SQUEEZE_MS = 15 * 1000;

class PauseScreenManager extends React.Component<PauseScreenManagerProps> {
  declare context: React.ContextType<typeof VideoContext>;

  static contextType = VideoContext;

  endSqueezeCompressTimeline = React.createRef<Timeline>();

  endSqueezeExpandTimeline = React.createRef<Timeline>();

  shouldComponentUpdate(nextProps: PauseScreenManagerProps) {
    return (nextProps.related !== this.props.related)
  }

  componentDidUpdate() {
    const { currentTime, duration, isLive, paused, scrubbingEngaged } = this.context;

    if (isLive) return;

    if (paused && scrubbingEngaged) return;

    if (duration && currentTime && duration - currentTime < END_SQUEEZE_MS) {
      this.context.setIsEnding(true);
      this.compressVideo();
    } else if (this.context.paused) {
      this.context.setIsEnding(true);
      this.compressVideo();
    } else {
      this.context.setIsEnding(false);
      this.expandVideo();
    }
  }

  compressVideo = () => {
    if (this.context.isCompressed) return;

    this.context.setIsCompressed(true);
    this.endSqueezeCompressTimeline.current?.play();
  };

  expandVideo = async () => {
    if (!this.context.isCompressed) return;

    await this.endSqueezeExpandTimeline.current?.play();

    this.context.setIsCompressed(false);
  };

  playOnNext = async (asset: Asset) => {
    this.props.getDetailsByIdAndType(asset.id.toString(), asset.type);

    this.props.getVideoSourceByYoutubeId(asset.youtubeId);
  };

  renderUpNextButton = (upNext: Asset) => {
    if (upNext == null) {
      return <ButtonRef name="Button-UpNext-Primary" visible={false} focusable={false} />;
    }

    const backdropImage =
      upNext.thumbs && upNext.thumbs.Backdrop ? (
        <ImageRef name="Image-UpNext-Primary" source={{ uri: upNext.thumbs.Backdrop }} />
      ) : null;

    return (
      <ButtonRef
        name="Button-UpNext-Primary"
        onPress={() => this.playOnNext(upNext)}
        focusable={this.context.isCompressed}
      >
        {backdropImage}
        <TextRef name="Title" text={upNext.title} />
        <TextRef name="Subhead" text={upNext.releaseDate} />
        <TextRef name="Duration" text={'45m'} />
      </ButtonRef>
    );
  };

  render() {
    const { related } = this.props;
    const { currentTime, duration, paused } = this.context;

    const upnext = related[0];
    const timerText = duration && currentTime ? Math.floor((duration - currentTime) / 1000) : '';
    const isTimerVisible = duration && currentTime ? duration - currentTime < END_SQUEEZE_MS : false;

    return (
      <React.Fragment>
        <ImageRef name="Image-Background" visible={paused} />
        <Timeline name="EndSqueeze-Compress" ref={this.endSqueezeCompressTimeline} />
        <Timeline name="EndSqueeze-Expand" ref={this.endSqueezeExpandTimeline} />

        <ViewRef name="UpNext-Countdown" visible={upnext !== null}>
          <TextRef visible={isTimerVisible} name="Timer" text={timerText.toString()} />
        </ViewRef>

        {this.renderUpNextButton(upnext)}
      </React.Fragment>
    );
  }
}

const mapStateToProps = () => {};

const mapDispatchToProps = {
  getDetailsByIdAndType,
  getVideoSourceByYoutubeId,
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(PauseScreenManager as any));
