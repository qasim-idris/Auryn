import React from 'react';
import { ImageRef, ViewRef, TextRef, ButtonRef } from '@youi/react-native-youi';
import { VideoContext } from './context';
import { Asset } from './../../adapters/asset';
import { Timeline } from './../timeline';

interface PauseScreenManagerProps {
  onClosed?: () => void;
}

const END_SQUEEZE_MS = 15 * 1000;

class PauseScreenManager extends React.Component<PauseScreenManagerProps> {
  declare context: React.ContextType<typeof VideoContext>;

  static contextType = VideoContext;

  endSqueezeCompressTimeline = React.createRef<Timeline>();

  endSqueezeExpandTimeline = React.createRef<Timeline>();

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
    if (this.context.isCompressed || !this.context.currentTime || this.context.currentTime < 1000) return;

    this.context.setIsCompressed(true);
    this.endSqueezeCompressTimeline.current?.play();
  };

  expandVideo = async () => {
    if (!this.context.isCompressed) return;

    await this.endSqueezeExpandTimeline.current?.play();

    this.context.setIsCompressed(false);
  };

  playOnNext = async (asset: Asset) => {
    this.context.setAsset(asset);
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
    const { currentTime, duration, paused, asset } = this.context;

    const upnext = asset.similar[0] || asset;
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

export default PauseScreenManager;
