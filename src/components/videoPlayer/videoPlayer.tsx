import React from 'react';
import { Composition, VideoRef, MediaState, ViewRef } from '@youi/react-native-youi';
import {  NativeSyntheticEvent, View } from 'react-native';
import { AurynHelper } from '../../aurynHelper';
import { Timeline } from '..';
import { VideoControls } from './videoControls';
import { VideoContext } from './context';
import PauseScreenManager from './pauseScreenManager';
import { fromApi } from '../../adapters/dummyAdapter';

interface VideoPlayerProps {
  isFocused: boolean;
  enablePauseScreen: boolean;
  onBackButton: () => void;
}

const initialState = {
  hasStartedPlaying: false,
};

const rokuMetadata = { mute: true, BookmarkInterval: 1 }

export default class VideoPlayer extends React.Component<VideoPlayerProps> {
  declare context: React.ContextType<typeof VideoContext>;

  static contextType = VideoContext;

  state = initialState;

  inTimeline = React.createRef<Timeline>();
  outTimeline = React.createRef<Timeline>();
  videoPlayer = React.createRef<VideoRef>();
  videoViewRef = React.createRef<ViewRef>();

  componentDidMount() {
    AurynHelper.togglePointerEvents(this.videoViewRef, false)
  }

  onPlayerReady = () => {
    this.videoPlayer.current?.play();
    this.inTimeline.current?.play();
  };

  onBackButton = async () => {
    if (this.context.tvGuideOpen) return true;

    if (this.context.mediaState === 'preparing') return true;

    await this.outTimeline.current?.play();

    this.videoPlayer.current?.stop();

    this.props.onBackButton();
  };

  onPlayerError = () => this.context.setAsset(fromApi(true));
  onPaused = () => this.context.setPaused();
  onPlaying = () => this.context.setPlaying();
  onDurationChanged = (value: number) => this.context.setDurationChanged(value);
  onCurrentTimeUpdated = (currentTime: number) => this.context.setCurrentTimeUpdated(currentTime);

  onStateChanged = (playerState: NativeSyntheticEvent<MediaState>) => {
    const { mediaState, playbackState } = playerState.nativeEvent;
    if (!this.state.hasStartedPlaying && mediaState === 'ready' && playbackState === 'playing') {
      this.setState({ hasStartedPlaying: true });
      this.context.setPlayerState(mediaState, playbackState);
    } else if (!this.state.hasStartedPlaying) {
      this.context.setPlayerState(mediaState, 'playing');
    } else {
      this.context.setPlayerState(mediaState, playbackState);
    }
  };

  render() {
    const { isFocused, onBackButton } = this.props;
    const { videoSource } = this.context;
    if (!videoSource) return <View/>;

    return (
      <Composition source="Auryn_VideoContainer">
        <Timeline name="In" ref={this.inTimeline} />
        <Timeline name="Out" ref={this.outTimeline} />

        <PauseScreenManager onClosed={this.videoPlayer.current?.play} />

        {/* TODO Check if we can move the ref to video container */}
        <ViewRef name="Video" ref={this.videoViewRef} />

        <VideoControls
          isFocused={isFocused}
          videoPlayerRef={this.videoPlayer}
          onBackButton={onBackButton}
        >
          <VideoRef
            name="VideoSurface"
            ref={this.videoPlayer}
            source={videoSource}
            onPlaybackComplete={onBackButton}
            onReady={this.onPlayerReady}
            onErrorOccurred={this.onPlayerError}
            onPaused={this.onPaused}
            onPlaying={this.onPlaying}
            onDurationChanged={this.onDurationChanged}
            onCurrentTimeUpdated={this.onCurrentTimeUpdated}
            onStateChanged={this.onStateChanged}
            muted
            metadata={rokuMetadata}
            key={videoSource.uri}
          />
        </VideoControls>


      </Composition>
    );
  }
}
