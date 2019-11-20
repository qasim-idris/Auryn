import React, { Component, createRef, RefObject } from 'react';
import { Composition, ButtonRef } from '@youi/react-native-youi';

import { Timeline } from './../timeline';
import { VideoContext } from './../videoPlayer/index';

interface Props {
  name: string;
  forceShow: boolean;
  onClose: () => void;
}

interface State {
  isShowing: boolean;
}

class PauseAd extends Component<Props, State> {
  static contextType = VideoContext;

  static defaultProps = {
    name: '',
    forceShow: false
  };

  private adInTimeline: RefObject<Timeline> = createRef();
  private adOutTimeline: RefObject<Timeline> = createRef();

  constructor(props: Props) {
    super(props);

    this.state = { isShowing: false };
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidUpdate() {
    const { mediaState, playbackState, scrubbingEngaged } = this.context;

    if(mediaState !== 'ready') return;

    if(scrubbingEngaged) return;

    if(playbackState === 'paused' || this.props.forceShow) {
      this.showAd();
    }

    if(playbackState === 'playing' && !this.props.forceShow) {
      this.hideAd();
    }
  }

  public getIsShowing = () => this.state.isShowing;

  public showAd = () => {
    if(this.state.isShowing) return;
    
    this.setState({ isShowing: true });
    this.adInTimeline.current?.play();
  }

  public hideAd = () => {
    if(!this.state.isShowing) return;

    this.setState({ isShowing: false });
    this.adOutTimeline.current?.play();
  }

  onCloseClick = () => {
    this.hideAd();
    
    this.props.onClose();
  };

  render() {
    const { name } = this.props;

    return (
      <Composition source={name}>
        <Timeline name="Animation" ref={this.adInTimeline} />
        <Timeline name="Out" ref={this.adOutTimeline} />
        <ButtonRef name="Btn-Cap" onPress={this.onCloseClick}/>
      </Composition>
    );
  }
}

export default PauseAd;
