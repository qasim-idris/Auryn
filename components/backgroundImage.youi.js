/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { View, Image, StyleSheet } from '@youi/react-native-youi';
import PropTypes from 'prop-types';

export default class BackgroundImage extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() { // eslint-disable-line max-lines-per-function
    const { source, children } = this.props;
    return (
    <View style={styles.container}>
      <Image
          style={styles.background}
          source={source}
        />
      {children}
    </View>);
  }
}

BackgroundImage.propTypes = {
  source: PropTypes.object.isRequired,
  children: PropTypes.array,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 3,
  },
  background: {
    width: 1920,
    height: 1080,
    resizeMode: 'repeat',
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 5,
  },
});
