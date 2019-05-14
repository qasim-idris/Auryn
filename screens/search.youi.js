/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { View, Composition, BackHandler, TextInputRef, FocusManager } from '@youi/react-native-youi';
import { tmdb } from '../actions';
import { Timeline, List, BackButton } from '../components';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Search extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.backHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => this.backHandlerListener.remove());
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    this.backHandlerListener.remove();
  }

  navigateBack = () => {
    this.outPromise = this.outTimeline ? this.outTimeline.play : Promise.resolve;
    this.outPromise().then(() => {
      if (global.isRoku)
        this.props.navigation.navigate({ routeName: 'Lander' });
      else
        this.props.navigation.goBack(null);
    });

    this.search('');
    return true;
  }

  onPressItem = (id, type) => {
    this.props.dispatch(tmdb.getDetailsByIdAndType(id, type));
    const navigateAction = NavigationActions.navigate({
      routeName: 'PDP',
      params: {
        id,
        type,
      },
      key: id,
    });
    this.outTimeline.play().then(() => this.props.navigation.dispatch(navigateAction));
  }

  onFocusItem = (ref, id, type) => this.props.dispatch(tmdb.prefetchDetails(id, type));

  search = query => this.props.dispatch(tmdb.search(query));

  render() { // eslint-disable-line max-lines-per-function
    const { isFocused, data: { movies, tv } } = this.props;

    if (!isFocused)
      return <View />;

    const tvList = tv || !global.isRoku ? <List
      name="List-PDP"
      data={tv}
      focusable={isFocused}
      onPressItem={this.onPressItem}
      onFocusItem={this.onFocusItem}
      extraData={tv}
    /> : null;
    const moviesList = movies || !global.isRoku ? <List
      name="List-Movies"
      data={movies}
      focusable={isFocused}
      onPressItem={this.onPressItem}
      onFocusItem={this.onFocusItem}
      extraData={movies}
    /> : null;

    return (
      <Composition source="Auryn_Search">
        <BackButton
          focusable={this.props.isFocused}
          onPress={this.navigateBack}
        />
        <TextInputRef
          ref={ref => this.searchText = ref}
          onLoad={() => {
            FocusManager.focus(this.searchText);
          }}
          name="TextInput"
          secureTextEntry={false}
          onChangeText={this.search}
        />

        {tvList}
        {moviesList}

        <Timeline name="SearchOut" ref={timeline => this.outTimeline = timeline} />

        <Timeline name="SearchIn"
          ref={timeline => this.inTimeline = timeline}
          onLoad={timeline => timeline.play()}
        />
      </Composition>
    );
  }
}

const mapStateToProps = store => ({
  data: store.tmdbReducer.search.data,
});
export default withNavigationFocus(connect(mapStateToProps)(Search));
export { Search as SearchTest };

Search.propTypes = {
  isFocused: PropTypes.bool,
  data: PropTypes.object,
  navigation: PropTypes.object,
  dispatch: PropTypes.func,
};
