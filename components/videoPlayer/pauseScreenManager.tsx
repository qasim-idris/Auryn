import React, { RefObject, createRef, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { ImageRef, ViewRef, TextRef, ButtonRef } from '@youi/react-native-youi';

import { getDetailsByIdAndType } from './../../actions/tmdbActions';
import { VideoContext, VideoContextType } from './context';
import { Asset, AssetType } from './../../adapters/asset';
import { Timeline } from './../timeline';
import { withNavigation, NavigationInjectedProps } from 'react-navigation';
import { getVideoSourceByYoutubeId } from '../../actions/youtubeActions';

interface PauseScreenManagerProps extends NavigationInjectedProps{
  related: Asset[],
  getDetailsByIdAndType: (id:string, type:AssetType) => void,
  getVideoSourceByYoutubeId: (youtubeId:string) => void
}

interface PauseScreenManagerState {
  isCompressed: boolean;
}

class PauseScreenManager extends Component<PauseScreenManagerProps, PauseScreenManagerState> {
  context!:VideoContextType;
  static contextType = VideoContext;

  private END_SQUEEZE_MS = 15 * 1000;

  private endSqueezeCompressTimeline: RefObject<Timeline> = createRef();
  private endSqueezeExpandTimeline: RefObject<Timeline> = createRef();

  constructor(props: PauseScreenManagerProps) {
    super(props);

    this.state = {
      isCompressed: false
    }
  }

  shouldComponentUpdate(nextProps:PauseScreenManagerProps, nextState:PauseScreenManagerState) {
    if(nextState.isCompressed !== this.state.isCompressed) return true;

    if(nextProps.related !== this.props.related) return true;

    return false;
  }

  componentDidUpdate() {
    if(this.context.paused && this.context.scrubbingEngaged) return;

    if(this.context.duration! - this.context.currentTime! < this.END_SQUEEZE_MS) {
      this.compressVideo();
    }
    else {
      this.context.paused ? this.compressVideo() : this.expandVideo();
    }
  }

  compressVideo = () => {
    if(this.state.isCompressed) return;

    this.setState({ isCompressed: true });
    this.endSqueezeCompressTimeline.current?.play();
  }

  expandVideo = async () => {
    if(!this.state.isCompressed) return;
  
    await this.endSqueezeExpandTimeline.current?.play();
    
    this.setState({ isCompressed: false });
  }

  playOnNext = async (asset:Asset) => {
    this.props.getDetailsByIdAndType(asset.id.toString(), asset.type);

    this.props.getVideoSourceByYoutubeId(asset.youtubeId);
  }

  render() {
    const { related } = this.props;
    const { isCompressed } = this.state;

    const upnext = related[0];
    const timerText = Math.floor((this.context.duration! - this.context.currentTime!) / 1000).toString();

    return (
      <Fragment>
        <ImageRef name="Image-Background" visible={isCompressed}/>
        <Timeline name="EndSqueeze-Compress" ref={this.endSqueezeCompressTimeline} />
        <Timeline name="EndSqueeze-Expand" ref={this.endSqueezeExpandTimeline} />

        <ViewRef name="UpNext-Countdown" visible={upnext != null}>
          <TextRef
            visible={this.context.duration! - this.context.currentTime! < this.END_SQUEEZE_MS}
            name="Timer" text={timerText}
          />
        </ViewRef>

        <ButtonRef
          name="Button-UpNext-Primary"
          visible={upnext != null}
          onPress={() => this.playOnNext(upnext)}
          focusable={this.context.paused}
        >
          <ImageRef name="Image-UpNext-Primary" source={{ uri: upnext.thumbs.Backdrop  }} />
          <TextRef name="Title" text={upnext && (upnext.title)} />
          <TextRef name="Subhead" text={upnext && (upnext.releaseDate)} />
          <TextRef name="Duration" text={'45m'} />
        </ButtonRef>
      </Fragment>
    );
  }
}

const mapStateToProps = () => {};

const mapDispatchToProps = {
  getDetailsByIdAndType,
  getVideoSourceByYoutubeId
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(PauseScreenManager));
