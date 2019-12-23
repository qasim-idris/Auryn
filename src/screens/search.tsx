/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View, BackHandler } from 'react-native';
import { Composition, TextInputRef, FocusManager, TextRef,FormFactor } from '@youi/react-native-youi';
import { Timeline, List, BackButton } from '../components';
import { NavigationActions, withNavigationFocus, NavigationEventSubscription, NavigationFocusInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { Asset } from '../adapters/asset';
import { AurynHelper } from '../aurynHelper';
import { AurynAppState } from '../reducers';
import { getDetailsByIdAndType, prefetchDetails, search } from '../actions/tmdbActions';
import { ListItemFocusEvent, ListItemPressEvent } from '../components/listitem';
import { ListType } from '../components/list';

type SearchDispatchProps = typeof mapDispatchToProps;

interface SearchProps extends NavigationFocusInjectedProps, SearchDispatchProps {
  data: Asset[];
}

class SearchScreen extends React.Component<SearchProps> {
  focusListener!: NavigationEventSubscription;

  blurListener!: NavigationEventSubscription;

  outTimeline = React.createRef<Timeline>();

  searchTextInput = React.createRef<TextInputRef>();

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.navigateBack));

    if (this.searchTextInput.current)
      FocusManager.focus(this.searchTextInput.current);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack);
  }

  navigateBack = async () => {
    await this.outTimeline.current?.play();

    if (AurynHelper.isRoku)
      this.props.navigation.navigate({ routeName: 'Lander' });
    else
      this.props.navigation.goBack(null);

    this.search('');
    return true;
  }

  onPressItem: ListItemPressEvent = async asset => {
    this.props.getDetailsByIdAndType(asset.id, asset.type);
    const navigateAction = NavigationActions.navigate({
      routeName: 'PDP',
      params: { asset, fromSearch: true },
      key: asset.id.toString(),
    });
    await this.outTimeline.current?.play();
    this.props.navigation.dispatch(navigateAction);
  }

  onFocusItem: ListItemFocusEvent = asset => {
    this.props.prefetchDetails(asset.id, asset.type);
  };

  search = (query: string) => this.props.search(query);

  render() { // eslint-disable-line max-lines-per-function
    const { isFocused, data } = this.props;

    if (!isFocused)
      return <View />;

    return (
      <Composition source="Auryn_Search">
        <BackButton
          focusable={this.props.isFocused}
          onPress={this.navigateBack}
        />
        <TextInputRef
          ref={this.searchTextInput}
          name="TextInput"
          secureTextEntry={false}
          onChangeText={this.search}
        />

        <TextRef name="Popular Shows 2" text={`${data.length} Results Found`} />

        {data || !AurynHelper.isRoku ? <List
          name="List-PDP"
          data={data}
          type={ListType.Search}
          horizontal={false}
          focusable={isFocused}
          onPressItem={this.onPressItem}
          onFocusItem={this.onFocusItem}
          extraData={data}
          numColumns={FormFactor.isHandset ? 3 : 6}
        />
          : null
        }

        <Timeline name="SearchOut" ref={this.outTimeline} />
        <Timeline name="SearchIn" autoplay/>
      </Composition>
    );
  }
}

const mapStateToProps = (store: AurynAppState) => ({
  data: store.tmdbReducer.search.data || { tv: [], movies: [] },
});

const mapDispatchToProps = {
  getDetailsByIdAndType,
  prefetchDetails,
  search,
};

export const Search = withNavigationFocus(connect(mapStateToProps, mapDispatchToProps)(SearchScreen as any));
