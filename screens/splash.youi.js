/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { Composition, ViewRef, View, StyleSheet } from '@youi/react-native-youi';
import { Timeline } from '../components';
import { tmdb } from '../actions';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


class Splash extends Component {
  componentDidMount() {
    this.props.dispatch(tmdb.getDiscover());
    this.props.dispatch(tmdb.getMovies());
    this.props.dispatch(tmdb.getTv());
  }

  async componentDidUpdate() {
    if (this.props.fetched) {
      if (!global.isRoku)
        await this.outTimeline.play();
      const landerNavigationAction = NavigationActions.navigate({
        routeName: 'Lander',
      });
      this.props.navigation.dispatch(landerNavigationAction);
    }
  }

  render() {
    return (
      <View style={styles.container}
      >
        <Composition source="Auryn_Splash">
          <Timeline
            name="SplashIn"
            onLoad={timeline => timeline.play()}
          />
          <Timeline
            name="SplashOut"
            ref={timeline => {
              this.outTimeline = timeline;
            }}
          />
          <ViewRef name="Loader">
            <Timeline name="Loop"
              onLoad={timeline => {
                if (!global.isRoku) timeline.play();
              }}
            />
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

const mapStateToProps = store => ({
  fetched:
    store.tmdbReducer.discover.fetched
    && store.tmdbReducer.movies.fetched
    && store.tmdbReducer.tv.fetched,
});

export default connect(mapStateToProps)(Splash);
export { Splash as SplashTest };

Splash.propTypes = {
  navigation: PropTypes.object,
  dispatch: PropTypes.func,
  fetched: PropTypes.bool,
};
