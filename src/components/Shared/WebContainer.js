import React, { Component } from 'react';
import Iframe from 'react-iframe';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import config from '../../constants/config';
import * as features from '../../constants/feature';

export default class WebContainer extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
      type: React.PropTypes.string,
    }),
  }

  render() {
    const { type } = this.props.params;
    let feature;
    if (type === 'Videos') {
      feature = features.VIDEO_LIBRARY;
    } else {
      feature = features.CURRICULUM;
    }
    let url = 'https://hellothinkster.com/web-app-curriculum.html';
    if (type === 'Videos') {
      url = '//videos.hellothinkster.com/';
    }
    return (
      <div>
        <StudentHeader currentNavigation={feature} />
        <StudentNav currentSelectedFeature={feature} />
        <div className="a-iframeView a-appView--hasSidebar">
          <Iframe
            url={url}
          />
        </div>
      </div>
    );
  }
}
