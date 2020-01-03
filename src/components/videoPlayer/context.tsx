import React from 'react';
import { MediaStateOptions, PlaybackStateOptions, VideoUriSource } from '@youi/react-native-youi';
import URLSearchParams from '@ungap/url-search-params';
import { Asset } from '../../adapters/asset';
import { fromApi } from '../../adapters/dummyAdapter';
import { connect } from 'react-redux';
import { AurynAppState } from '../../reducers';
import { prefetchDetails, getDetailsByIdAndType } from '../../actions/tmdbActions';
import { getVideoSourceByYoutubeId } from '../../actions/youtubeActions';

type ContextDispatchProps = typeof mapDispatchToProps;

interface ContextProps extends ContextDispatchProps {
  videoSource: VideoUriSource;
  asset: Asset;
  videoId: string;
}

interface VideoContextState {
  asset: Asset;
  duration?: number;
  currentTime?: number;
  formattedTime?: string;
  mediaState?: MediaStateOptions;
  playbackState?: PlaybackStateOptions;
  paused: boolean;
  scrubbingEngaged: boolean;
  videoSource: VideoUriSource;
  error?: boolean;
  metadata?: { BookmarkInterval: number };
  tvGuideOpen: boolean;
  isLive: boolean;
  isEnding: boolean;
  isCompressed: boolean;

  setPaused: () => void;
  setPlaying: () => void;
  setDurationChanged: (value: number) => void;
  setCurrentTimeUpdated: (currentTime: number) => void;
  setPlayerState: (mediaState: MediaStateOptions, playbackState: PlaybackStateOptions) => void;
  setScrubbingEngaged: (scrubbingEngaged: boolean) => void;
  setTvGuideOpen: (tvGuideOpen: boolean) => void;
  setIsLive: (isLive: boolean) => void;
  setIsEnding: (isEnding: boolean) => void;
  setAsset: (asset: Asset) => void;
  setIsCompressed: (isCompressed: boolean) => void;
}

const initialState: VideoContextState = {
  asset: fromApi(true),
  paused: false,
  scrubbingEngaged: false,
  error: false,
  mediaState: 'unloaded',
  metadata: { BookmarkInterval: 1 },
  playbackState: 'paused',
  tvGuideOpen: false,
  isLive: false,
  isEnding: false,
  isCompressed: false,
  videoSource: {uri: '', type: ''},

  setPaused: () => {},
  setPlaying: () => {},
  setDurationChanged: () => {},
  setCurrentTimeUpdated: () => {},
  setPlayerState: () => {},
  setScrubbingEngaged: () => {},
  setTvGuideOpen: () => {},
  setIsLive: () => {},
  setIsEnding: () => {},
  setAsset: () => {},
  setIsCompressed: () => {},
};

const VideoContext = React.createContext<VideoContextState>(initialState);

const MIN_DURATION = 3000;

class VideoContextProvider extends React.PureComponent<ContextProps, VideoContextState> {
  constructor(props: any) {
    super(props);

    this.state = {
      ...initialState,
      setPaused: this.setPaused,
      setPlaying: this.setPlaying,
      setDurationChanged: this.setDurationChanged,
      setCurrentTimeUpdated: this.setCurrentTimeUpdated,
      setPlayerState: this.setPlayerState,
      setScrubbingEngaged: this.setScrubbingEngaged,
      setTvGuideOpen: this.setTvGuideOpen,
      setIsLive: this.setIsLive,
      setIsEnding: this.setIsEnding,
      setAsset: this.setAsset,
      setIsCompressed: this.setIsCompressed,
    };
  }

  getDurationFromVideoUri = (): number => {
    const sourceParams = new URLSearchParams(this.state.videoSource?.uri);

    return Math.round(Number(sourceParams.get('dur')) * 1000);
  };

  componentDidMount() {
    this.setAsset(this.props.asset)
  }

  componentDidUpdate(prevProps: ContextProps) {
    if (this.props.asset.youtubeId !== prevProps.asset.youtubeId) {
      this.props.getVideoSourceByYoutubeId(this.props.asset.youtubeId);
      this.setState({videoSource: { uri:'', type: ''}});
    }

    if (this.props.videoSource !== this.state.videoSource) {
      this.setState({videoSource: this.props.videoSource});
    }

    if (this.props.asset !== prevProps.asset) {
      this.setState({asset: this.props.asset});
    }

    if (this.props.videoId !== prevProps.videoId) {
      this.setState({ videoSource: this.props.videoSource});
    }
  }

  setPaused = () => this.setState({ paused: true });
  setPlaying = () => this.setState({ paused: false });
  setPlayerState = (mediaState: MediaStateOptions, playbackState: PlaybackStateOptions) =>
    this.setState({ mediaState, playbackState });

  setDurationChanged = (value: number) => {
    const duration = value > MIN_DURATION ? value : this.getDurationFromVideoUri();
    this.setState({ duration });
  };

  setAsset = (asset: Asset) => {
    if (!asset && this.props.asset) {
      this.setState({asset: this.props.asset});
    } else {
      this.props.getDetailsByIdAndType(asset.id, asset.type);
    }
  };

  setCurrentTimeUpdated = (currentTime: number) => {
    if (isNaN(currentTime)) return;

    let sec = Math.floor(currentTime / 1000);
    let min = Math.floor(sec / 60);
    const hour = Math.floor(sec / 3600);
    sec %= 60;
    min %= 60;
    const hourString = hour < 1 ? '' : `${hour}:`;
    const minSting = min < 10 ? `0${min}` : min;
    const secString = sec < 10 ? `0${sec}` : sec;

    this.setState({
      currentTime,
      formattedTime: `${hourString}${minSting}:${secString}`,
    });
  };

  setScrubbingEngaged = (scrubbingEngaged: boolean) => this.setState({ scrubbingEngaged });

  setTvGuideOpen = (tvGuideOpen: boolean) => this.setState({ tvGuideOpen });

  setIsLive = (isLive: boolean) => this.setState({ isLive });

  setIsEnding = (isEnding: boolean) => this.setState({ isEnding });

  setIsCompressed = (isCompressed: boolean) => this.setState({ isCompressed });

  render() {
    return <VideoContext.Provider value={this.state}>{this.props.children}</VideoContext.Provider>;
  }
}

const VideoContextConsumer = VideoContext.Consumer;

const mapStateToProps = (store: AurynAppState) => {
  return {
    fetched: store.youtubeReducer.fetched,
    videoSource: store.youtubeReducer.videoSource,
    videoId: store.youtubeReducer.videoId,
    asset: store.tmdbReducer.details.data
  };
};

const mapDispatchToProps = {
  getVideoSourceByYoutubeId,
  prefetchDetails,
  getDetailsByIdAndType,
};

const ConnectedVideoContextProvider = connect(mapStateToProps, mapDispatchToProps)(VideoContextProvider as any);


export { VideoContext, ConnectedVideoContextProvider as VideoContextProvider, VideoContextConsumer };
