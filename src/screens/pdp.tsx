/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  withNavigationFocus,
  NavigationActions,
  NavigationEventSubscription,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import { View, BackHandler } from 'react-native';
import {
  ButtonRef,
  Composition,
  ImageRef,
  TextRef,
  ViewRef,
  FocusManager,
  FormFactor,
} from '@youi/react-native-youi';
import { connect } from 'react-redux';
import { Timeline, List, BackButton } from '../components';
import { Asset } from '../adapters/asset';
import { AurynHelper } from '../aurynHelper';
import { AurynAppState } from '../reducers';
import { ListType } from '../components/list';
import { prefetchDetails, getDetailsByIdAndType } from '../actions/tmdbActions';
import { getVideoSourceByYoutubeId } from '../actions/youtubeActions';
import { ListItemFocusEvent, ListItemPressEvent } from '../components/listitem';

type PdpDispatchProps = typeof mapDispatchToProps;

interface PdpProps extends NavigationFocusInjectedProps, PdpDispatchProps {
  asset: Asset;
  fetched: boolean;
}

class PdpScreen extends React.Component<PdpProps> {
  outTimeline = React.createRef<Timeline>();

  videoOutTimeline = React.createRef<Timeline>();

  videoInTimeline = React.createRef<Timeline>();

  contentOutTimeline = React.createRef<Timeline>();

  contentInTimeline = React.createRef<Timeline>();

  posterButton = React.createRef<ButtonRef>();

  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  navigateBack = async () => {
    await this.outTimeline.current?.play();

    if (AurynHelper.isRoku)
      this.props.navigation.navigate({ routeName: 'Lander' });
    else
      this.props.navigation.popToTop();

    return true;
  };

  onPressItem: ListItemPressEvent = async (asset) => {
    const { id, type } = asset;
    this.props.getDetailsByIdAndType(id, type);
    await this.contentOutTimeline.current?.play();
    this.props.navigation.navigate({ routeName: 'PDP', params: { asset }, key: id.toString() });
    if (this.posterButton.current) FocusManager.focus(this.posterButton.current);
    await this.contentInTimeline.current?.play();
  };

  onFocusItem: ListItemFocusEvent = (asset) => {
    this.props.prefetchDetails(asset.id, asset.type);
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);

      this.videoOutTimeline.current?.play();
    });

    this.blurListener = this.props.navigation.addListener('didBlur', () =>
      BackHandler.removeEventListener('hardwareBackPress', this.navigateBack),
    );

    if (this.posterButton.current) FocusManager.focus(this.posterButton.current);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  shouldComponentUpdate(nextProps: PdpProps) {
    // Re-render if lost/gained focus
    if (nextProps.isFocused !== this.props.isFocused) return true;

    if (nextProps.fetched && !this.props.fetched) return true;

    // Only render if the asset.id matches the requested pdp asset id
    return nextProps.asset.id === nextProps.navigation.getParam('asset').id;
  }

  playVideo = async () => {
    await this.videoInTimeline.current?.play();
    this.props.navigation.dispatch(
      NavigationActions.navigate({
        routeName: 'Video',
      }),
    );
  };

  onFocusPoster = () => {
    this.props.getVideoSourceByYoutubeId(this.props.asset.youtubeId);
  };

  getMetadataString() {
    const { asset } = this.props;

    // Asset Type
    let metadataString = `${asset.type}`;

    // Season # or Runtime #
    switch (asset.type) {
      case 'tv':
        if (!asset.seasons)
          break;

        metadataString = metadataString.concat(` | ${asset.seasons} Season${asset.seasons > 1 ? 's' : ''}`)
        break;

      case 'movie':
        if (!asset.runtime)
          break;

        const hours = (asset.runtime / 60);
        const roundedHours = Math.floor(hours);
        const minutes = (hours - roundedHours) * 60;
        const roundedMinutes = Math.round(minutes);

        metadataString = metadataString.concat(` | ${roundedHours} hr ${roundedMinutes} min`)

        break;
    }

    // Genres
    metadataString = metadataString.concat(` | ${this.props.asset.genres?.map(genre => genre.name).join(', ')}`)

    return metadataString;
  }

  render() {
    // eslint-disable-line max-lines-per-function
    const { asset, fetched, isFocused } = this.props;

    if (!fetched || !isFocused) return <View />;

    return (
      <Composition source="Auryn_PDP">
        <Timeline name="VideoIn" ref={this.videoInTimeline} />
        <Timeline name="VideoOut" ref={this.videoOutTimeline} />
        <Timeline name="PDPIn" autoplay />
        <Timeline name="PDPOut" ref={this.outTimeline} />

        <ViewRef
          name="PDP-Scroller"
          visible={isFocused && fetched}
          style={{ backgroundColor: FormFactor.isHandset ? 'black' : 'transparent' }}
        >
          <BackButton focusable={isFocused} onPress={this.navigateBack} />
          <List
            name="List-PDP"
            type={ListType.SmallBackdrop}
            data={asset.similar}
            focusable={isFocused}
            onPressItem={this.onPressItem}
            onFocusItem={this.onFocusItem}
          />

          <Timeline name="ContentIn" ref={this.contentInTimeline} autoplay />
          <Timeline name="ContentOut" ref={this.contentOutTimeline} />

          <ButtonRef
            name={!FormFactor.isHandset ? 'Btn-Backdrop-LargePDP' : 'Btn-Poster-Large'}
            focusable={isFocused}
            onPress={this.playVideo}
            ref={this.posterButton}
            onFocus={this.onFocusPoster}
          >
            <ImageRef
              name="Image-Dynamic"
              source={{ uri: FormFactor.isHandset ? asset.images.Poster : asset.images.Backdrop }}
            />
          </ButtonRef>

          {FormFactor.isHandset ? (
            <ImageRef name="Image-Dynamic-Background" source={{ uri: asset.images.Backdrop }} />
          ) : null}

          <ViewRef name="Layout-PDP-Meta">
            <TextRef
              name="Text-Metadata"
              text={this.getMetadataString()}
              style={{ color: '#808080' }}
            />
            <TextRef name="Text-Title" text={asset.title} style={{ color: '#ececec' }} />
            <TextRef name="Text-Overview" text={asset.details} style={{ color: '#ececec' }} />
            <TextRef name="Text-Featured" text={asset.extra} style={{ color: '#ececec' }} />

            <Timeline name="In2" autoplay />
          </ViewRef>
          <TextRef name="Text-ListTitle" style={{ color: '#ececec' }} />
        </ViewRef>
      </Composition>
    );
  }
}

const mapStateToProps = (store: AurynAppState) => ({
  asset: store.tmdbReducer.details.data,
  fetched: store.tmdbReducer.details.fetched,
});

const mapDispatchToProps = {
  getVideoSourceByYoutubeId,
  prefetchDetails,
  getDetailsByIdAndType,
};

export const Pdp = withNavigationFocus(connect(mapStateToProps, mapDispatchToProps)(PdpScreen as any));
