import React, { Component } from 'react';
import { Link } from 'react-router';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';

class WorksheetHeader extends Component {
  static propTypes = {
    student: React.PropTypes.shape({
    }),
    worksheetMeta: React.PropTypes.shape({
    }),
    assignmentId: React.PropTypes.string,
    activityState: React.PropTypes.string,
  }

  render() {
    const { student, worksheetMeta, assignmentId, activityState } = this.props;
    const imageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${student._id}.png`;
    return (
      <div>
        <header className="o-worksheetHeader">

          {config.isViaAfrika ?
            <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
              <img width="200px" src={`/images/${config.appBannerLogo}`} />
            </div> :
            <Link to={`/student/${student._id}`} className="o-worksheetHeader__logo o-thinkster" title="Thinkster">
              <ThinksterLogomark />
              <ThinksterWordmark />
            </Link>
          }
          <div className="o-worksheetHeader__breadcrumb">
            : &nbsp;
            <Link to={`/student/${student._id}`} title="Worksheets">
              {Localization.localizedStringForKey('Worksheets')}
            </Link>
            &nbsp; : &nbsp;
            <Link to={activityState === 'review' ? `/student/${student._id}/${assignmentId}/summary` : `/student/${student._id}/attempt/${assignmentId}/${activityState}/preview`} title={`#${worksheetMeta ? worksheetMeta.worksheet_number : ''}`}>
               #{worksheetMeta ? worksheetMeta.worksheet_number : ''}
            </Link>
            <span className="o-worksheetHeader__breadcrumbWorksheet">
              &nbsp; : &nbsp;
              <strong>{worksheetMeta ? worksheetMeta.name : ''}</strong>
            </span>
          </div>

          <div className="o-worksheetHeader__actions">
            <Link to={`/student/${student._id}`}>
              <div className="o-worksheetHeader__actionItem o-worksheetHeader__profile">
                <div className="o-worksheetHeader__profileName" title="Worksheets">
                  {student.first_name}
                  { (Common.isPurchaseOfTypeProduct(student) && student.hide_grade) ? '' :
                  <span className="a-p(12) a-color(white)">
                    &nbsp;{Localization.localizedStringForKey('Grade')} {student.grade === 'K' && config.isViaAfrika ? 'R' : student.grade}
                  </span>
                  }
                </div>
                <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
              </div>
            </Link>
          </div>

        </header>
      </div>
    );
  }
}

export default WorksheetHeader;
