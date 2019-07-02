/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { Composition, ViewRef } from '@youi/react-native-youi';
import { View, StyleSheet } from 'react-native';
import { Timeline, Error } from '../components';
import { NavigationActions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import { Config } from '../config';
import { AurynAppState } from '../reducers';
import { tmdbApiKey } from '../secrets';
import { getDiscover, getMovies, getTv } from '../actions/tmdbActions';

type SplashDispatchProps = typeof mapDispatchToProps;

interface SplashProps extends NavigationScreenProps, SplashDispatchProps {
  fetched: boolean;
  error: string;
};

class SplashScreen extends React.Component<SplashProps> {
  outTimeline: React.RefObject<Timeline> = React.createRef<Timeline>();

  componentDidMount() {
    this.props.getDiscover();
    this.props.getMovies();
    this.props.getTv();
  }

  async componentDidUpdate() {
    if (this.props.fetched) {
      if (!Config.isRoku && this.outTimeline.current)
        await this.outTimeline.current.play();
      const landerNavigationAction = NavigationActions.navigate({
        routeName: 'Lander',
      });
      this.props.navigation.dispatch(landerNavigationAction);
    }
  }

  render() {
    if (!tmdbApiKey)
      return <Error text="Missing Tmdb API token, please add a token to secrets.ts"/>;

    if (this.props.error)
      return <Error text={this.props.error}/>;

    return (
      <View style={styles.container}>
        <Composition source="Auryn_Splash">
          <Timeline name="SplashIn" autoplay />
          <Timeline name="SplashOut" ref={this.outTimeline} />
          <ViewRef name="Loader">
            <Timeline name="Loop" autoplay={!Config.isRoku} />
          </ViewRef>
        </Composition>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#143672',
  },
});

const mapStateToProps = (store: AurynAppState) => ({
  fetched:
    (store.tmdbReducer.discover.fetched
    && store.tmdbReducer.movies.fetched
    && store.tmdbReducer.tv.fetched) || false,
  error:
    store.tmdbReducer.discover.error
    || store.tmdbReducer.movies.error
    || store.tmdbReducer.tv.error || '',
});

const mapDispatchToProps = {
  getDiscover,
  getMovies,
  getTv,
};

export const Splash = connect(mapStateToProps, mapDispatchToProps)(SplashScreen as any);
