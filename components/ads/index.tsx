import React, { createContext, createRef, RefObject, Component } from 'react';
import { StyleSheet, View } from 'react-native';

import PauseAd from './pause-ad';
import { VideoContext } from './../videoPlayer/context';

const END_SQUEEZE_MS = 15 * 1000;

interface AdProviderProps {
  pauseAdCompositionName: string | undefined;
  onPauseAdClosed: () => void;
}

interface AdProviderState {}

const Context = createContext<AdProviderState>({});

class AdProvider extends Component<AdProviderProps, AdProviderState> {
  static defaultProps = {
    pauseAdCompositionName: undefined,
    related: [],
    onPauseAdClosed: () => {}
  };

  static contextType = VideoContext;

  private pausAdRef: RefObject<PauseAd> = createRef();

  constructor(props: AdProviderProps) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { children, pauseAdCompositionName, onPauseAdClosed } = this.props;
    
    return (
      <Context.Provider value={this.state}>
        <View style={styles.container}>
          {pauseAdCompositionName !== undefined ?
            <PauseAd
              ref={this.pausAdRef}
              name={pauseAdCompositionName}
              forceShow={this.context.duration - this.context.currentTime < END_SQUEEZE_MS}
              onClose={onPauseAdClosed}
            /> :
            null
          }
        </View>
        {children}
      </Context.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject
  }
});

export default AdProvider;
