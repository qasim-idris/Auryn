import React from 'react';
import store from './store';
import Stack from './navigation';
import { FormFactor } from '@youi/react-native-youi';
import { Provider } from 'react-redux';
import { BackgroundImage } from './components';

export default class YiReactApp extends React.Component {
  render = () =>
    <Provider store={store}>
      <BackgroundImage source={FormFactor.isTV ? 'res://drawable/default/CES-auryn-10ft-bg.png' : 'res://drawable/default/Gradient-Bottom-2.png'}>
        <Stack />
      </BackgroundImage>
    </Provider>
}
