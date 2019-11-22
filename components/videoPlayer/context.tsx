import React, { Component } from 'react';
import { MediaStateOptions, PlaybackStateOptions } from '@youi/react-native-youi';

interface ContextProps {}

export interface ContextState {
  duration?: number;
  currentTime?: number;
  formattedTime?: string;
  mediaState?: MediaStateOptions;
  playbackState?: PlaybackStateOptions;
  paused: boolean;
  controlsActive: boolean;
  pausedByScrubbing: boolean;
  scrubbingEngaged: boolean;
  miniGuideOpen: boolean;
  setContext: ({key:ContextKeys, value:any}: any) => void;
}

const Context = React.createContext<Partial<ContextState>>({});

class VideoContextProvider extends Component<ContextProps, ContextState> {
  constructor(props: ContextProps) {
    super(props);

    this.state = {
      paused: false,
      controlsActive: false,
      pausedByScrubbing: false,
      scrubbingEngaged: false,
      miniGuideOpen: false,
      setContext: this.setContext
    }
  }

  shouldComponentUpdate(_nextProps: ContextProps, nextState: ContextState) {
    if(nextState.duration !== this.state.duration) return true;

    if(nextState.currentTime !== this.state.currentTime) return true;

    if(nextState.paused !== this.state.paused) return true;

    if(nextState.scrubbingEngaged !== this.state.scrubbingEngaged) return true;

    if(nextState.pausedByScrubbing !== this.state.pausedByScrubbing) return true;

    // if(nextState.shouldBeCompressed !== this.state.shouldBeCompressed) return true;

    return false;
  }

  setContext = (value: ContextProps) => this.setState(value);

  render() {
    const { children } = this.props;

    return (
      <Context.Provider value={this.state}>
        {children}
      </Context.Provider>
    );
  }
}

export const VideoContext = Context;
export { VideoContextProvider };
export const VideoContextConsumer = Context.Consumer;
