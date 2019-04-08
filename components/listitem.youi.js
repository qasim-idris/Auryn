/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { PureComponent } from 'react';
import { Composition, TextRef, ButtonRef, ImageRef } from '@youi/react-native-youi';
import PropTypes from 'prop-types';

export default class ListItem extends PureComponent {
  static defaultProps = {
    onFocus: () => {},
    onPress: () => {},
    imageType: 'Backdrop',
    size: 'Small',
  }

  constructor(props) {
    super(props);
    this.buttonName = `Btn-${this.props.imageType}-${this.props.size}`;
    this.compositionName = `Auryn_Container-${this.buttonName}`;
    this.imageUri = this.props.size === 'Small' ? 'http://image.tmdb.org/t/p/w500/' : 'http://image.tmdb.org/t/p/w1280/';
    this.imageUri += this.props.imageType === 'Poster' ? this.props.data.poster_path : this.props.data.backdrop_path;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.focusable !== this.props.focusable;
  }

  render() {
    return (
      <Composition source={this.compositionName} loadSync={true}>
        <ButtonRef
          focusable={this.props.focusable}
          ref={ref => this.ref = ref}
          onFocus={() => this.props.onFocus(this.ref, this.props.data.id, this.props.data.type)}
          onPress={() => this.props.onPress(this.props.data.id, this.props.data.type, this.ref)}
          name={this.buttonName}
          shouldChangeFocus={this.props.shouldChangeFocus}
        >
          <ImageRef
            name="Image-Dynamic"
            source={ { uri: this.imageUri } } />
        <TextRef name="Text-Details" text={this.props.data.overview} />
        <TextRef name="Text-Title" text={this.props.data.name || this.props.data.title} />

        </ButtonRef>
      </Composition>
    );
  }
}

ListItem.propTypes = {
  onFocus: PropTypes.func,
  onPress: PropTypes.func,
  data: PropTypes.object.isRequired,
  shouldChangeFocus: PropTypes.bool,
  focusable: PropTypes.bool,
  imageType: PropTypes.oneOf(['Backdrop', 'Poster']),
  size: PropTypes.oneOf(['Small', 'Large']),
};
