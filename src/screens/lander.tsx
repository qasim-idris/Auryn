/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { Composition, ViewRef, ButtonRef, FocusManager, ListRef, FormFactor } from '@youi/react-native-youi';
import { Timeline, List } from '../components';
import {
  withNavigationFocus,
  NavigationActions,
  NavigationEventSubscription,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import { connect } from 'react-redux';
import { Asset } from '../adapters/asset';
import { AurynAppState } from '../reducers';
import { ListItemFocusEvent, ListItemPressEvent } from '../components/listitem';
import { ToggleButtonPress, ToggleButton } from '../components/toggleButton';
import { ListType } from '../components/list';
import { prefetchDetails, getDetailsByIdAndType } from '../actions/tmdbActions';
import { NavigationBar } from '../components/navigationBar';
import { AurynHelper } from '../aurynHelper';

type LanderDispatchProps = typeof mapDispatchToProps;

interface LanderProps extends NavigationFocusInjectedProps, LanderDispatchProps {
  tv: Asset[];
  discover: Asset[];
  movies: Asset[];
  live: Asset[];
}

interface LanderState {
  currentListIndex: number;
}

class LanderScreen extends React.Component<LanderProps, LanderState> {
  state = { currentListIndex: 0 };

  lists = Array.from(Array(4)).map(() => React.createRef<List>());

  lastFocusItem? = React.createRef<ButtonRef>();

  lastFocusNavItem = React.createRef<ButtonRef>();

  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  outTimeline = React.createRef<Timeline>();

  navOutTimeline = React.createRef<Timeline>();

  navInTimeline = React.createRef<Timeline>();

  inTimeline = React.createRef<Timeline>();

  menuButtons = Array.from(Array(4)).map(() => React.createRef<ToggleButton>());

  searchButton = React.createRef<ButtonRef>();

  profileButton = React.createRef<ButtonRef>();

  scroller = React.createRef<ListRef<JSX.Element>>();

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);

      AurynHelper.updateCloudScene(this.scroller);

      if (this.lastFocusNavItem?.current) {
        FocusManager.enableFocus(this.lastFocusNavItem.current);
        FocusManager.focus(this.lastFocusNavItem.current);
      } else if (this.lastFocusItem?.current) {
        FocusManager.enableFocus(this.lastFocusItem.current);
        FocusManager.focus(this.lastFocusItem.current);
      }

      this.navInTimeline.current?.play();
      this.inTimeline.current?.play();
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () =>
      BackHandler.removeEventListener('hardwareBackPress', this.navigateBack),
    );
  }

  navigateBack = () => {
    if (this.menuButtons[this.state.currentListIndex].current)
      FocusManager.focus(this.menuButtons[this.state.currentListIndex].current);

    // Scroll up the live page to prevent overflow
    if (this.state.currentListIndex === 3)
      this.lists[3].current?.scrollToIndex(0);
    return true;
  };

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  navigateToScreen = async (screen: string) => {
    const navigateAction = NavigationActions.navigate({ routeName: screen });

    if (screen === 'Search')
      this.lastFocusNavItem = this.searchButton;
    else if (screen === 'Profile')
      this.lastFocusNavItem = this.profileButton;

    await Promise.all([this.navOutTimeline.current?.play(), this.outTimeline.current?.play()]);
    this.props.navigation.dispatch(navigateAction);
  };

  scrollToViewByIndex: ToggleButtonPress = (index) => {
    this.setState({ currentListIndex: index });

    if (AurynHelper.isRoku) return;

    if (this.menuButtons[index].current) {
      for (let i = 0; i < this.lists.length; i++)
        FocusManager.setNextFocus(this.menuButtons[i].current, this.lists[index].current, 'down');
    }

    if (
      this.menuButtons[index].current &&
      this.searchButton.current &&
      this.profileButton.current &&
      this.lists[index].current
    ) {
      FocusManager.setNextFocus(this.searchButton.current, this.lists[index].current, 'down');
      FocusManager.setNextFocus(this.profileButton.current, this.lists[index].current, 'down');
      FocusManager.setNextFocus(this.lists[index].current, this.menuButtons[index].current, 'up');
    }

    this.scroller.current?.scrollToIndex({
      index,
      animated: !AurynHelper.isRoku,
    });
  };

  // eslint-disable-next-line max-params
  onFocusItem: ListItemFocusEvent = (asset, ref, shouldChangeFocus) => {
    const { id, type } = asset;
    this.props.prefetchDetails(id, type);
    this.lastFocusItem = ref;

    if (shouldChangeFocus === false || AurynHelper.isRoku || !ref.current) return;

    // Live list should not focus back to nav
    if (this.state.currentListIndex === 3) {
      FocusManager.setNextFocus(ref.current, ref.current, 'right');
      return;
    }

    if (this.menuButtons[this.state.currentListIndex].current) {
      FocusManager.setNextFocus(ref.current, this.menuButtons[this.state.currentListIndex].current, 'up');
      for (let index = 0; index < this.lists.length; index++)
        FocusManager.setNextFocus(this.menuButtons[index].current, ref.current, 'down');
    }

    if (this.searchButton.current && this.profileButton.current) {
      FocusManager.setNextFocus(this.searchButton.current, ref.current, 'down');
      FocusManager.setNextFocus(this.profileButton.current, ref.current, 'down');
    }
  };

  // eslint-disable-next-line max-params
  onPressItem: ListItemPressEvent = async (asset, ref) => {
    const { id, type } = asset;
    this.lastFocusItem = ref;
    const navigateAction = NavigationActions.navigate({
      routeName: asset.live ? 'Video' : 'PDP',
      params: { asset },
    });
    this.props.getDetailsByIdAndType(id, type);
    await Promise.all([this.navOutTimeline.current?.play(), this.outTimeline.current?.play()]);
    this.props.navigation.dispatch(navigateAction);
  };

  componentDidUpdate(_prevProps: LanderProps, prevState: LanderState) {
    if (this.state.currentListIndex !== prevState.currentListIndex)
      AurynHelper.updateCloudScene(this.scroller);
  }

  onViewableItemsChanged = () => {
    AurynHelper.updateCloudScene(this.scroller);
  };

  // eslint-disable-next-line max-lines-per-function
  render() {
    const { isFocused, tv, movies, discover, live } = this.props;
    const { currentListIndex } = this.state;

    const lists = [
      <Composition source="Auryn_Container-Lander-List" key="discover">
        <List
          name="Lander-List"
          type={ListType.Featured}
          data={discover}
          ref={this.lists[0]}
          focusable={isFocused && currentListIndex === 0}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Lander-List" key="movies" style={styles.listOffset}>
        <List
          name="Lander-List"
          type={FormFactor.isTV ? ListType.Poster : ListType.Grid}
          data={movies}
          ref={this.lists[1]}
          focusable={isFocused && currentListIndex === 1}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
          snapToAlignment={'center'}
        />
      </Composition>,
      <Composition source="Auryn_Container-Lander-List" key="shows">
        <List
          name="Lander-List"
          type={FormFactor.isTV ? ListType.Grid : ListType.WideBackdrop}
          data={tv}
          ref={this.lists[2]}
          focusable={isFocused && currentListIndex === 2}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Live" key="live" style={styles.listOffset}>
        <List
          name="LiveList"
          type={ListType.Live}
          data={live}
          ref={this.lists[3]}
          focusable={isFocused && currentListIndex === 3}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
    ];

    const rokuList = [lists[currentListIndex]];

    return (
      <Composition source="Auryn_Lander">
        <NavigationBar
          name="Nav-List"
          scrollEnabled={false}
          horizontal={true}
          focusable={isFocused}
          onPressItem={this.scrollToViewByIndex}
          initialToggleIndex={0}
        >
          <ToggleButton
            title="Discover"
            icon="res://drawable/default/Default-Nav-Icon.png"
            iconToggled="res://drawable/default/Default-Toggled-Nav-Icon.png"
            ref={this.menuButtons[0]}
          />
          <ToggleButton
            title="Movies"
            icon="res://drawable/default/Movie-Nav-Icon.png"
            iconToggled="res://drawable/default/Movie-Toggled-Nav-Icon.png"
            ref={this.menuButtons[1]}
          />
          <ToggleButton
            title="Shows"
            icon="res://drawable/default/Series-Nav-Icon.png"
            iconToggled="res://drawable/default/Series-Toggled-Nav-Icon.png"
            ref={this.menuButtons[2]}
          />
          <ToggleButton
            title="Live"
            icon="res://drawable/default/Live-Nav-Icon.png"
            iconToggled="res://drawable/default/Live-Toggled-Nav-Icon.png"
            ref={this.menuButtons[3]}
          />
        </NavigationBar>
        <ButtonRef
          name="Btn-Nav-Search"
          focusable={isFocused}
          ref={this.searchButton}
          onPress={() => this.navigateToScreen('Search')}
        />
        <ButtonRef
          name="Btn-Nav-Profile"
          focusable={isFocused}
          ref={this.profileButton}
          onPress={() => this.navigateToScreen('Profile')}
        />
        <Timeline name="LanderIn" ref={this.inTimeline} />
        <Timeline name="LanderOut" ref={this.outTimeline} />
        <ListRef
          name="Stack"
          ref={this.scroller}
          scrollEnabled={false}
          horizontal={FormFactor.isHandset}
          focusable={false}
          data={AurynHelper.isRoku ? rokuList : lists}
          renderItem={({ item }) => item}
          onViewableItemsChanged={this.onViewableItemsChanged}
        />

        <ViewRef name="Nav">
          <Timeline name="In" ref={this.navInTimeline} />
          <Timeline name="Out" ref={this.navOutTimeline} />
        </ViewRef>
      </Composition>
    );
  }
}

const styles = StyleSheet.create({
  listOffset: {
    marginTop: FormFactor.isHandset ? 232 : 0,
  },
});

const mapStateToProps = (store: AurynAppState) => ({
  discover: store.tmdbReducer.discover.data,
  movies: store.tmdbReducer.movies.data,
  tv: store.tmdbReducer.tv.data,
  live: store.tmdbReducer.live.data,
});

const mapDispatchToProps = {
  prefetchDetails,
  getDetailsByIdAndType,
};

export const Lander = withNavigationFocus(connect(mapStateToProps, mapDispatchToProps)(LanderScreen as any));
