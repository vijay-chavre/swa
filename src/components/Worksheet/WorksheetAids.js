import React, { Component } from 'react';
import Flag from '../Shared/Glyphs/Flag';
import Support from '../Shared/Glyphs/Support';
import Video from '../Shared/Glyphs/Video';


class WorksheetAids extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
    }),
    showVideo: React.PropTypes.bool,
    onVideo: React.PropTypes.func,
    showSupport: React.PropTypes.bool,
    showVideoHint: React.PropTypes.bool,
    onSupport: React.PropTypes.func,
    showFlag: React.PropTypes.bool,
    onFlag: React.PropTypes.func,
    flagToolTip: React.PropTypes.string,
  }
  render() {
    const { showVideo, onVideo, onSupport, showSupport, showFlag, onFlag, flagToolTip, showVideoHint } = this.props;
    let videoClassName = 'b-iconBtn b-toolTips b-toolTips--topRight o-worksheetAids__btn';
    if (showVideoHint) {
      videoClassName = 'b-toolTips--manual b-iconBtn b-toolTips b-toolTips--topRight o-worksheetAids__btn b-toolTips-modified b-toolTips-modified-rgt animate-wobble';
    }
    return (
      <div className="o-worksheetAids">
        {/* <button className="b-iconBtn b-toolTips b-toolTips--left o-worksheetAids__btn" data-tooltip="Flag this Question">
          <Flag />
        </button>*/}
        {showFlag ?
          <button
            className="b-iconBtn b-toolTips b-toolTips--top o-worksheetAids__btn" data-tooltip={flagToolTip}
            onClick={onFlag}
          >
            <Flag />
          </button>
          : ''
        }
        {showSupport ?
          <button
            className={`b-iconBtn b-toolTips ${showVideo ? 'b-toolTips--top' : 'b-toolTips--topRight'} o-worksheetAids__btn`} data-tooltip="Contact Support"
            onClick={onSupport}
          >
            <Support />
          </button>
          : ''
        }
        {showVideo ?
          <button
            onClick={onVideo}
            className={videoClassName}
            data-tooltip="Watch Video Lesson"
          >
            <Video />
          </button> : ''
        }
      </div>
    );
  }
}

export default WorksheetAids;
