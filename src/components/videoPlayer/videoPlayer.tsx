import React, { Component } from 'react';
import PauseScreenManager from './pauseScreenManager';
import { Composition, VideoRef, VideoUriSource, MediaState } from '@youi/react-native-youi';
import { Timeline } from '..';
import { VideoControls } from './videoControls';
import { Asset } from '../../adapters/asset';
import { VideoContext, VideoContextType } from './context';
import { View, NativeSyntheticEvent } from 'react-native';

interface Props {
  asset: Asset;
  isFocused: boolean;
  enablePauseScreen: boolean;
  related: Asset[];
  onBackButton: () => void;
}

interface State {
  hasStartedPlaying: boolean;
}

export class VideoPlayer extends Component<Props, State> {
  context!: VideoContextType;

  static contextType = VideoContext;
  static defaultProps: Pick<Props, 'onBackButton'> = {
    onBackButton: () => {}
  };

  private fallbackVideo: VideoUriSource = {
    uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    type: 'HLS',
  };

  private inTimeline = React.createRef<Timeline>();
  private outTimeline = React.createRef<Timeline>();
  private videoPlayer = React.createRef<VideoRef>();

  constructor(props: Props) {
    super(props);

    this.state = {
      hasStartedPlaying: false
    };
  }

  onBackButton = async () => {
    if (this.context.mediaState === 'preparing') return true;

    await this.outTimeline.current?.play();

    this.videoPlayer.current?.stop();

    this.props.onBackButton();
  };

  onPlayerReady = () => {
    this.videoPlayer.current?.play();
    this.inTimeline.current?.play();
  };

  onPlayerError = () => this.context.setVideoSource(this.fallbackVideo);

  onPaused = () => this.context.setPaused();
  onPlaying = () => this.context.setPlaying();
  onDurationChanged = (value: number) => this.context.setDurationChanged(value);
  onCurrentTimeUpdated = (currentTime: number) => this.context.setCurrentTimeUpdated(currentTime);

  onStateChanged = (playerState: NativeSyntheticEvent<MediaState>) => {
    const { mediaState, playbackState } = playerState.nativeEvent;

    if(!this.state.hasStartedPlaying && mediaState === 'ready' && playbackState === 'playing') {
      this.setState({ hasStartedPlaying: true });
      this.context.setPlayerState(mediaState, playbackState);
    } else if(!this.state.hasStartedPlaying) {
      this.context.setPlayerState(mediaState, 'playing');
    } else {
      this.context.setPlayerState(mediaState, playbackState);
    }
  }

  render() {
    const { 
      asset,
      isFocused,
      enablePauseScreen,
      related,
      onBackButton
    } = this.props;

    if(!this.context.videoSource) return <View />;

    return (
      <Composition source="Auryn_VideoContainer">
        <Timeline name="In" ref={this.inTimeline} />
        <Timeline name="Out" ref={this.outTimeline} />

        { enablePauseScreen ? <PauseScreenManager related={related} /> : null }

        <VideoControls
          isFocused={isFocused}
          asset={asset}
          videoPlayerRef={this.videoPlayer}
          onBackButton={onBackButton}
        >
          <VideoRef
            name="VideoSurface"
            ref={this.videoPlayer}
            source={this.context.videoSource}
            onPlaybackComplete={onBackButton}
            onReady={this.onPlayerReady}
            onErrorOccurred={this.onPlayerError}
            onPaused={this.onPaused}
            onPlaying={this.onPlaying}
            onDurationChanged={this.onDurationChanged}
            onCurrentTimeUpdated={this.onCurrentTimeUpdated}
            onStateChanged={this.onStateChanged}
          />
        </VideoControls>
      </Composition>
    );
  }
}

export default VideoPlayer;
