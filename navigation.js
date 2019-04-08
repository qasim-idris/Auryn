/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as Screens from './screens';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';

const stackOptions = {
  headerMode: 'none',
  cardStyle: {
    backgroundColor: 'transparent',
    opacity: 1,
  },
  transitionConfig: () => ({
    transitionSpec: {
      duration: 0,
    },
    containerStyle: {
      backgroundColor: 'transparent',
    },
    screenInterpolator: () => { },
  }),
};

const createNavigator = global.isRoku ? createSwitchNavigator : createStackNavigator;
const AppStack = createNavigator(
  {
    Lander: { screen: Screens.Lander },
    PDP: { screen: Screens.PDP },
    Search: { screen: Screens.Search },
    Profile: { screen: Screens.Profile },
    Video: { screen: Screens.Video },
  },
  {
    ...stackOptions,
    initialRouteName: 'Lander',
  }
);

const SplashStack = createStackNavigator(
  { Splash: { screen: Screens.Splash } },
  {
    ...stackOptions,
    initialRouteName: 'Splash',
  }
);

const rootNavigationStack = createSwitchNavigator({
  Splash: SplashStack,
  App: AppStack,
});

export default rootNavigationStack;
