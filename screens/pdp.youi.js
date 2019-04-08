/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { withNavigationFocus, NavigationActions } from 'react-navigation';
import {
  BackHandler,
  ButtonRef,
  Composition,
  ImageRef,
  TextRef,
  ViewRef,
  View,
  FocusManager,
} from '@youi/react-native-youi';

import { connect } from 'react-redux';
import { Timeline, List, BackButton } from '../components';
import { youtube, cache, tmdb } from '../actions';
import PropTypes from 'prop-types';

class PDP extends Component {
  constructor(props) {
    super(props);
  }

  navigateBack = () => {
    this.outPromise = this.outTimeline ? this.outTimeline.play : Promise.resolve;
    this.outPromise().then(() => {
      if (global.isRoku)
        this.props.navigation.navigate({ routeName: 'Lander' });
      else
        this.props.navigation.popToTop();
    });
    return true;
  }

  onPressItem = (id, type) => {
    this.props.dispatch(tmdb.getDetailsByIdAndType(id, type));
    this.contentOutTimeline.play()
      .then(() => this.props.navigation.navigate({ routeName: 'PDP', params: { id, type }, key: id }))
      .then(() => {
        FocusManager.focus(this.posterButton);
        this.contentInTimeline.play();
      });
  }

  onFocusItem = (ref, id, type) => this.props.dispatch(cache.saveDetailsByIdAndType(id, type));

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.backHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
      if (this.posterButton)
        setTimeout(() => FocusManager.focus(this.posterButton), 1);

      if (this.videoOutTimeline) this.videoOutTimeline.play();
    });

    this.blurListener = this.props.navigation.addListener('didBlur', () => this.backHandlerListener.remove());
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    this.backHandlerListener.remove();
  }

  shouldComponentUpdate(nextProps) {
    // Re-render if lost/gained focus
    if (nextProps.isFocused !== this.props.isFocused)
      return true;

    if (nextProps.fetched && !this.props.fetched)
      return true;

    // Only render if the asset.id matches the requested pdp asset id
    return nextProps.asset.id === nextProps.navigation.getParam('id');
  }

  playVideo = () => {
    this.videoInTimeline.play().then(() =>
      this.props.navigation.dispatch(NavigationActions.navigate({
          routeName: 'Video',
          params: { videoSource: this.props.asset.videoSource },
        })));
  }

  getFeaturedText = credits => {
    const director = credits.crew.find(it => it.job === 'Director');
    const cast = credits.cast.slice(0, 3).map(it => it.name).join(', ');
    if (director)
      return `Director: ${director.name} | Starring: ${cast}`;

    return `Starring: ${cast}`;
  }

  onFocusPoster = () => {
    this.props.dispatch(youtube.getVideoSourceByYoutubeId(this.props.asset.youtubeId));
  }

  render() { // eslint-disable-line max-lines-per-function
    const { asset, fetched, isFocused } = this.props;

    if (!fetched || !isFocused)
      return <View/>;

    return (
      <Composition source="Auryn_PDP">
        <Timeline name="VideoIn" ref={timeline => this.videoInTimeline = timeline} />
        <Timeline name="VideoOut" ref={timeline => this.videoOutTimeline = timeline} />
        <Timeline name="PDPIn"
          ref={timeline => this.inTimeline = timeline}
          onLoad={timeline => timeline.play()}
        />
        <Timeline name="PDPOut" ref={timeline => this.outTimeline = timeline} />

        <ViewRef name="PDP-Scroller" visible={isFocused && fetched}>
          <BackButton
            focusable={isFocused}
            onPress={this.navigateBack}
          />
          <List
            name="List-PDP"
            data={asset.similar.results}
            focusable={isFocused}
            onPressItem={this.onPressItem}
            onFocusItem={this.onFocusItem}
          />

          <Timeline
            name="ContentIn"
            ref={timeline => this.contentInTimeline = timeline}
            onLoad={ref => ref.play()} />
          <Timeline name="ContentOut" ref={timeline => this.contentOutTimeline = timeline} />

          <ButtonRef
            name="Btn-Poster-Large"
            focusable={isFocused}
            onPress={this.playVideo}
            ref={ref => this.posterButton = ref}
            onLoad={() => FocusManager.focus(this.posterButton)}
            onFocus={this.onFocusPoster}
          >
            <ImageRef
              name="Image-Dynamic"
              source={{ uri: `http://image.tmdb.org/t/p/w500${asset.poster_path}` }}
            />
          </ButtonRef>

          <ImageRef
            name="Image-Dynamic-Background"
            source={{ uri: `http://image.tmdb.org/t/p/w1280${asset.backdrop_path}` }}
          />

          <ViewRef name="Layout-PDP-Meta">
            <TextRef name="Text-Title" text={asset.title || asset.name} />
            <TextRef name="Text-Overview" text={asset.overview} />
            <TextRef name="Text-Featured" text={this.getFeaturedText(asset.credits)} />
            <Timeline name="In2" ref={timeline => this.pdpMetaInTimeline = timeline} onLoad={ref => ref.play()} />
          </ViewRef>

        </ViewRef>
      </Composition>
    );
  }
}

const mapStateToProps = store => ({
  asset: store.tmdbReducer.details.data,
  fetched: store.tmdbReducer.details.fetched,
});

export default withNavigationFocus(connect(mapStateToProps)(PDP));
export { PDP as PdpTest };

PDP.propTypes = {
  navigation: PropTypes.object,
  dispatch: PropTypes.func,
  isFocused: PropTypes.bool,
  asset: PropTypes.object.isRequired,
  fetched: PropTypes.bool,
};
