/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';
import { Composition, TextRef, ButtonRef, ImageRef } from '@youi/react-native-youi';
import PropTypes from 'prop-types';

export default class ListItem extends Component {
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
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.focusable !== this.props.focusable;
  }

  render() {
    const { data, imageType, shouldChangeFocus, size, onFocus, onPress, focusable } = this.props;

    return (
      <Composition source={this.compositionName} loadSync={true}>
        <ButtonRef
          focusable={focusable}
          ref={ref => this.ref = ref}
          onFocus={() => onFocus(this.ref, data.id, data.type)}
          onPress={() => onPress(data.id, data.type, this.ref)}
          name={this.buttonName}
          shouldChangeFocus={shouldChangeFocus}
        >
          <ImageRef
            name="Image-Dynamic"
            source={ { uri: size.toLowerCase() === 'small' ? data.thumbs[imageType.toLowerCase()] : data.images[imageType.toLowerCase()] } } />
          <TextRef name="Text-Details" text={data.details} />
          <TextRef name="Text-Title" text={data.title} />
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
