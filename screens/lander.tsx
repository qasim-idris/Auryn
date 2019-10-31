/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Composition, ViewRef, ButtonRef, FocusManager, BackHandler, ListRef, FormFactor } from '@youi/react-native-youi';
import { findNodeHandle, NativeModules } from 'react-native';
import { Timeline, List } from '../components';
import {
  withNavigationFocus,
  NavigationActions,
  NavigationEventSubscription,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import { connect } from 'react-redux';
import { Asset } from '../adapters/asset';
import { Config } from '../config';
import { AurynAppState } from '../reducers';
import { ListItemFocusEvent, ListItemPressEvent } from '../components/listitem';
import { ToggleButtonPress, ToggleButton } from '../components/toggleButton';
import { ListType } from '../components/list';
import { prefetchDetails, getDetailsByIdAndType } from '../actions/tmdbActions';
import { NavigationBar } from '../components/navigationBar';
import { CloudUtil } from '../components/cloudUtil';

const { Cloud } = NativeModules;

type LanderDispatchProps = typeof mapDispatchToProps;

interface LanderProps extends NavigationFocusInjectedProps, LanderDispatchProps {
    tv: Asset[];
    discover: Asset[];
    movies: Asset[];
  };

interface LanderState {
  currentListIndex: number;
}

class LanderScreen extends React.Component<LanderProps, LanderState> {
  state = { currentListIndex: 0 };

  lists = Array.from(Array(4)).map(() => React.createRef<List>());

  lastFocusItem = React.createRef<ButtonRef>();

  lastFocusNavItem = React.createRef<ButtonRef>();

  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  outTimeline = React.createRef<Timeline>();

  navInTimeline = React.createRef<Timeline>();

  inTimeline = React.createRef<Timeline>();

  menuButtons = Array.from(Array(4)).map(() => React.createRef<ToggleButton>());

  searchButton = React.createRef<ButtonRef>();

  profileButton = React.createRef<ButtonRef>();

  scroller = React.createRef<ListRef<JSX.Element>>();

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);

      CloudUtil.updateScene(this.scroller);

      if (this.lastFocusNavItem && this.lastFocusNavItem.current) {
        FocusManager.enableFocus(this.lastFocusNavItem.current);
        FocusManager.focus(this.lastFocusNavItem.current);
      } else if (this.lastFocusItem && this.lastFocusItem.current) {
        FocusManager.enableFocus(this.lastFocusItem.current);
        FocusManager.focus(this.lastFocusItem.current);
      }

      if (this.inTimeline.current && this.navInTimeline.current) {
        this.navInTimeline.current.play();
        this.inTimeline.current.play();
      }
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.navigateBack));
  }

  navigateBack = () => {
    if (this.menuButtons[this.state.currentListIndex].current)
      FocusManager.focus(this.menuButtons[this.state.currentListIndex].current);
    return true;
  };

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  navigateToScreen = async (screen: string) => {
    const navigateAction = NavigationActions.navigate({
      routeName: screen,
    });

    if (screen === 'Search')
      this.lastFocusNavItem = this.searchButton;
    else if (screen === 'Profile')
      this.lastFocusNavItem = this.profileButton;

    if (this.outTimeline.current) await this.outTimeline.current.play();
    this.props.navigation.dispatch(navigateAction);
  };

  scrollToViewByIndex: ToggleButtonPress = index => {
    this.setState({ currentListIndex: index });

    if (CloudUtil.isRoku) return;

    if (this.menuButtons[index].current) {
      for (let i = 0; i < this.lists.length; i++)
      FocusManager.setNextFocus(this.menuButtons[i].current, this.lists[index].current, 'down');
    }

    if (this.menuButtons[index].current
      && this.searchButton.current
      && this.profileButton.current
      && this.lists[index].current
    ) {
      FocusManager.setNextFocus(this.searchButton.current, this.lists[index].current, 'down');
      FocusManager.setNextFocus(this.profileButton.current, this.lists[index].current, 'down');
      FocusManager.setNextFocus(this.lists[index].current, this.menuButtons[index].current, 'up');
    }

    if (this.scroller.current) {
      this.scroller.current.scrollToIndex({
        index,
        animated: !CloudUtil.isRoku,
      });
    }


  };

  // eslint-disable-next-line max-params
  onFocusItem: ListItemFocusEvent = (id, type, ref, shouldChangeFocus) => {
    this.props.prefetchDetails(id, type);
    this.lastFocusItem = ref;

    if (shouldChangeFocus === false || CloudUtil.isRoku || !ref.current) return;

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

  onPressItem: ListItemPressEvent = async (id, type, ref) => {
    this.lastFocusItem = ref;
    const navigateAction = NavigationActions.navigate({
      routeName: 'PDP',
      params: {
        id,
        type,
      },
    });
    this.props.getDetailsByIdAndType(id, type);
    if (this.outTimeline.current) await this.outTimeline.current.play();
    this.props.navigation.dispatch(navigateAction);
  };

  componentDidUpdate(_prevProps: LanderProps, prevState: LanderState) {
    if (this.state.currentListIndex !== prevState.currentListIndex)
      CloudUtil.updateScene(this.scroller);
  }

  onViewableItemsChanged = () => {
    CloudUtil.updateScene(this.scroller);
  }


  // eslint-disable-next-line max-lines-per-function
  render() {
    const { isFocused, tv, movies, discover } = this.props;
    const data = [discover, movies, tv, movies];
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
      <Composition source="Auryn_Container-Lander-List" key="movies">
        <List
          name="Lander-List"
          type={ListType.Poster}
          data={movies}
          ref={this.lists[1]}
          focusable={isFocused && currentListIndex === 1}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Lander-List" key="shows">
        <List
          name="Lander-List"
          type={ListType.Grid}
          data={tv}
          ref={this.lists[2]}
          focusable={isFocused && currentListIndex === 2}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Lander-List" key="live">
        <List
          name="Lander-List"
          type={ListType.LargeBackdrop}
          data={movies.slice(0, 2)}
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
          <ToggleButton title="Discover" ref={this.menuButtons[0]} />
          <ToggleButton title="Movies" ref={this.menuButtons[1]} />
          <ToggleButton title="Shows" ref={this.menuButtons[2]} />
          <ToggleButton title="Live" ref={this.menuButtons[3]} />
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
          data={CloudUtil.isRoku ? rokuList : lists}
          renderItem={({ item }) => item}
          onViewableItemsChanged={this.onViewableItemsChanged}
        />

        <ViewRef name="Nav">
          <Timeline name="In" ref={this.navInTimeline} />
          <Timeline name="Out" />
        </ViewRef>

        <ViewRef name="Nav-Logo">
          <Timeline name="Loop" loop={true} />
        </ViewRef>
      </Composition>
    );
  }
}

const mapStateToProps = (store: AurynAppState) => ({
  discover: store.tmdbReducer.discover.data,
  movies: store.tmdbReducer.movies.data,
  tv: store.tmdbReducer.tv.data,
});

const mapDispatchToProps = {
  prefetchDetails,
  getDetailsByIdAndType,
};

export const Lander = withNavigationFocus(connect(mapStateToProps, mapDispatchToProps)(LanderScreen as any));
