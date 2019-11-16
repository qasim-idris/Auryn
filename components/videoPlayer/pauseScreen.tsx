import React, { Component, RefObject, createRef, Fragment } from 'react';

import { VideoContext } from './context';
import { Asset, AssetType } from './../../adapters/asset';
import { Timeline } from './../timeline';
import { ImageRef, ViewRef, TextRef, ButtonRef } from '@youi/react-native-youi';

interface VideoPauseScreenManagerProps {
  related: Asset[],
  onUpNextPress: (id:string, type:AssetType) => void
}

interface VideoPauseScreenManagerState {
  isCompressed: boolean
}

class VideoPauseScreenManager extends Component<VideoPauseScreenManagerProps, VideoPauseScreenManagerState> {
  static contextType = VideoContext;
  
  private END_SQUEEZE_MS = 15 * 1000;

  private endSqueezeCompressTimeline:RefObject<Timeline> = createRef();
  private endSqueezeExpandTimeline:RefObject<Timeline> = createRef();

  constructor(props:VideoPauseScreenManagerProps) {
    super(props);

    this.state = {
      isCompressed: false
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidUpdate() {
    if(this.context.paused && this.context.scrubbingEngaged) return;

    if(this.context.duration - this.context.currentTime < this.END_SQUEEZE_MS) {
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

  expandVideo = () => {
    if(!this.state.isCompressed) return;
  
    this.setState({ isCompressed: false });
    this.endSqueezeExpandTimeline.current?.play();
  }

  playOnNext = async (id:string = '0', type:AssetType = AssetType.MOVIE) => {
    this.expandVideo();

    this.props.onUpNextPress(id, type);
  }

  render() {
    const { related } = this.props;

    const upnext = related[0];
    const timerText = Math.floor((this.context.duration - this.context.currentTime) / 1000).toString();

    return (
      <Fragment>
        <ImageRef name="Image-Background" visible={false}/>
        <Timeline name="EndSqueeze-Compress" ref={this.endSqueezeCompressTimeline} />
        <Timeline name="EndSqueeze-Expand" ref={this.endSqueezeExpandTimeline} />

        <ViewRef name="UpNext-Countdown" visible={upnext != null}>
          <TextRef
            visible={this.context.duration - this.context.currentTime < this.END_SQUEEZE_MS}
            name="Timer" text={timerText}
          />
        </ViewRef>

        <ButtonRef
          name="Button-UpNext-Primary"
          visible={upnext != null}
          onPress={() => this.playOnNext(upnext.id.toString(), upnext.type)}
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

export default VideoPauseScreenManager;
