/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { Composition, ViewRef, ScrollRef, ButtonRef, View, FocusManager, BackHandler } from '@youi/react-native-youi';
import { Timeline, ToggleGroup, List } from '../components';
import { withNavigationFocus, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { tmdb, cache, lander } from '../actions';
import PropTypes from 'prop-types';

class Lander extends Component {
  constructor(props) {
    super(props);
    this.lists = [];
    this.lastFocusItem = null;
    this.navButtonNames = ['Discover', 'Movies', 'Shows', 'Live'];
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {

      this.backHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);

      if (this.lastFocusNavItem) {
        FocusManager.enableFocus(this.lastFocusNavItem);
        FocusManager.focus(this.lastFocusNavItem);
      } else if (this.lastFocusItem) {
        FocusManager.enableFocus(this.lastFocusItem);
        FocusManager.focus(this.lastFocusItem);
      }

      if (this.landerInTimeline && this.navInTimeline) {
        this.landerInTimeline.play();
        this.navInTimeline.play(1);
      }
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => this.backHandlerListener.remove());
  }

  navigateBack = () => {
    FocusManager.focus(this.menuButtons.getButtonRef(this.props.lander.currentListIndex));
    return true;
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    this.backHandlerListener.remove();
  }

  navigateToScreen = screen => {
    const navigateAction = NavigationActions.navigate({
      routeName: screen,
    });

    if (screen === 'Search')
      this.lastFocusNavItem = this.searchButton;
    else if (screen === 'Profile')
      this.lastFocusNavItem = this.profileButton;
    else
      this.lastFocusNavItem = null;

    this.outTimeline.play().then(() => this.props.navigation.dispatch(navigateAction));
  }

  scrollToViewByIndex = (index, animated = true) => {
    if (!global.isRoku) {
      for (let i = 0; i < this.lists.length; i++)
        FocusManager.setNextFocus(this.menuButtons.getButtonRef(i), this.lists[index], 'down');
      FocusManager.setNextFocus(this.searchButton, this.lists[index], 'down');
      FocusManager.setNextFocus(this.profileButton, this.lists[index], 'down');
      FocusManager.setNextFocus(this.lists[index], this.menuButtons.getButtonRef(index), 'up');
    }

    this.props.dispatch(lander.setListIndex(index));
    this.scroller.scrollTo({
      x: 0,
      y: (index * 900) + 1, // eslint-disable-line no-extra-parens
      animated,
    });
  }

  onFocusItem = (ref, id, type) => {
    this.props.dispatch(cache.saveDetailsByIdAndType(id, type));
    this.lastFocusItem = ref;

    if (ref.props.shouldChangeFocus === false || global.isRoku) return;

    FocusManager.setNextFocus(ref, this.menuButtons.getButtonRef(this.props.lander.currentListIndex), 'up');
    for (let index = 0; index < this.lists.length; index++)
      FocusManager.setNextFocus(this.menuButtons.getButtonRef(index), ref, 'down');

    FocusManager.setNextFocus(this.searchButton, ref, 'down');
    FocusManager.setNextFocus(this.profileButton, ref, 'down');
  }

  onPressItem = (id, type, ref) => {
    this.lastFocusItem = ref;
    this.lastFocusNavItem = null;
    const navigateAction = NavigationActions.navigate({
      routeName: 'PDP',
      params: {
        id,
        type,
      },
    });
    this.props.dispatch(tmdb.getDetailsByIdAndType(id, type));
    this.outTimeline.play().then(() => this.props.navigation.dispatch(navigateAction));
  }

  render() { // eslint-disable-line max-lines-per-function, max-statements
    const { isFocused, tv, movies, discover } = this.props;
    const { currentListIndex } = this.props.lander;

    // null list is used for Roku
    const nullList = <Composition source="Auryn_Container-NullList">
      <List
        name="NullList"
        type="Movies"
        focusable={false}
      />
    </Composition>;

    const lists = [
      <Composition source="Auryn_Container-Discover" key="discover">
        <List
          name="Discover"
          type="Discover"
          data={discover}
          ref={ref => this.lists[0] = ref}
          focusable={isFocused && currentListIndex === 0}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Movies" key="movies">
        <List
          name="Movies"
          type="Movies"
          data={movies}
          ref={ref => this.lists[1] = ref}
          focusable={isFocused && currentListIndex === 1}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Shows" key="shows">
        <List
          name="Shows"
          type="Shows"
          data={tv}
          ref={ref => this.lists[2] = ref}
          focusable={isFocused && currentListIndex === 2}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
      <Composition source="Auryn_Container-Live" key="live">
        <List
          name="Live"
          type="Live"
          data={movies.slice(0, 2)}
          ref={ref => this.lists[3] = ref}
          focusable={isFocused && currentListIndex === 3}
          onFocusItem={this.onFocusItem}
          onPressItem={this.onPressItem}
        />
      </Composition>,
    ];
    return (
      <Composition source="Auryn_Lander">
        <ToggleGroup
          focusable={isFocused}
          prefix="Btn-Nav-"
          names={this.navButtonNames}
          onPressItem={this.scrollToViewByIndex}
          ref={ref => this.menuButtons = ref}
        />
        <ButtonRef
          name="Btn-Nav-Search"
          focusable={isFocused}
          ref={ref => this.searchButton = ref}
          onPress={() => this.navigateToScreen('Search')}
        />
        <ButtonRef
          name="Btn-Nav-Profile"
          focusable={isFocused}
          ref={ref => this.profileButton = ref}
          onPress={() => this.navigateToScreen('Profile')}
        />
        <Timeline name="LanderIn"
          onLoad={timeline => {
            this.landerInTimeline = timeline;
            this.landerInTimeline.play();
          }}
        />
        <Timeline name="LanderOut" ref={timeline => this.outTimeline = timeline} />
        <ScrollRef
          name="Stack"
          ref={scroller => this.scroller = scroller}
          scrollEnabled={false}
          horizontal={false}
          focusable={false}
        >
          <View>
            {global.isRoku ? [lists[currentListIndex], nullList] : lists}
          </View>
        </ScrollRef>

        <ViewRef name="Nav">
          <Timeline name="In" onLoad={timeline => {
            this.navInTimeline = timeline;
            this.navInTimeline.play();
            FocusManager.focus(this.menuButtons.getButtonRef(0));
          }}
          />
          <Timeline name="Out" ref={timeline => this.navOutTimeline = timeline} />
        </ViewRef>

        <ViewRef name="Nav-Logo">
          <Timeline name="Loop" loop={true} />
        </ViewRef>

      </Composition>
    );
  }
}

const mapStateToProps = store => ({
  discover: store.tmdbReducer.discover.data,
  movies: store.tmdbReducer.movies.data,
  tv: store.tmdbReducer.tv.data,
  lander: store.landerReducer,
});

export default withNavigationFocus(connect(mapStateToProps)(Lander));
export { Lander as LanderTest };

Lander.propTypes = {
  navigation: PropTypes.object,
  dispatch: PropTypes.func,
  isFocused: PropTypes.bool,
  discover: PropTypes.array.isRequired,
  movies: PropTypes.array.isRequired,
  tv: PropTypes.array.isRequired,
  lander: PropTypes.object,
};
