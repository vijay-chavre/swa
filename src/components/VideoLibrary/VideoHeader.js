import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';

class VideoHeader extends Component {

  static propTypes = {
    student: React.PropTypes.shape({
      _id: React.PropTypes.string,
    }),
    currentNavigation: React.PropTypes.string,
    grade: React.PropTypes.string,
    topic: React.PropTypes.string,
    concept: React.PropTypes.string,
    isAllTopicsActive: React.PropTypes.bool,
    user: React.PropTypes.shape({
    }),
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  renderBreadCrumb = (studentId, currentNavigation) => {
    const { grade, topic, concept, isAllTopicsActive } = this.props;
    if (grade && topic && concept) {
      return (
        <div className="o-appHeader__breadcrumb">
          : &nbsp;
          <span className=" a-color(copy-1)">
            <Link to={`/student/${studentId}/video-library`} className="a-color(copy-1)">
            {currentNavigation || Localization.localizedStringForKey('Worksheets')}
            </Link>
          </span>
          &nbsp; : &nbsp;
          <span className="a-color(copy-1)">
            Grade {grade}
          </span>
          &nbsp; : &nbsp;
          <span className="a-color(copy-1)">
            {topic}
          </span>
          &nbsp; : &nbsp;
          <span className="a-strong a-color(copy-1)">
            {concept}
          </span>
        </div>
      );
    } else if (grade && topic) {
      return (
        <div className="o-appHeader__breadcrumb">
          : &nbsp;
          <span className=" a-color(copy-1)">
            <Link to={`/student/${studentId}/video-library`} className="a-color(copy-1)" >
              {currentNavigation || Localization.localizedStringForKey('Worksheets')}
            </Link>
          </span>
          &nbsp; : &nbsp;
          <span className="a-color(copy-1)">
            Grade {grade}
          </span>
          &nbsp; : &nbsp;
          <span className="a-strong a-color(copy-1)">
            {topic}
          </span>
        </div>
      );
    } else if (grade || isAllTopicsActive) {
      return (
        <div className="o-appHeader__breadcrumb">
          : &nbsp;
          <span className=" a-color(copy-1)">
            <Link to={`/student/${studentId}/video-library`} className="a-color(copy-1)">
              {currentNavigation || Localization.localizedStringForKey('Worksheets')}
            </Link>
          </span>
          &nbsp; : &nbsp;
          <span className="a-strong a-color(copy-1)">
            Grade {grade}
          </span>
        </div>
      );
    }
    return (
      <div className="o-appHeader__breadcrumb">
        : &nbsp;
        <span className="a-strong a-color(copy-1)">
          <Link to={`/student/${studentId}/video-library`} className="a-color(copy-1)">
            {currentNavigation || Localization.localizedStringForKey('Worksheets')}
          </Link>
        </span>
      </div>
    );
  }
  render() {
    const { student, currentNavigation } = this.props;
    const imageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${student._id}.png`;

    return (
      <header className="o-appHeader">
        {config.isViaAfrika ?
          <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
            <img width="200px" src={`/images/${config.appBannerLogo}`} />
          </div> :
          <Link href="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
            <ThinksterLogomark />
            <ThinksterWordmark />
          </Link>
        }
        {
          this.renderBreadCrumb(student._id, currentNavigation)
        }
        {this.isGuestFlow() ?
          <ul className="o-appHeader__actions">
            <li className="o-appHeader__actionItem">
              <a href={ENV.enrollURL} title="Start Free Trial" target="_blank" className="b-flatBtn b-flatBtn--gradient(active-3)">
                <span className="b-button__label">
                  Start Free Trial
                </span>
              </a>
            </li>
          </ul>
          :
          <ul className="o-appHeader__actions">
            <li className="o-appHeader__actionItem o-appHeader__profile">
              <div className="o-appHeader__profileName" title="Log Out">
                {student.first_name}
                { (Common.isPurchaseOfTypeProduct(student) && student.hide_grade) ? '' :
                <span className="a-p(12) a-color(copy-2)">
                  &nbsp; {Localization.localizedStringForKey('Grade')} {student.grade === 'K' && config.isViaAfrika ? 'R' : student.grade}
                </span>
                }
              </div>

              <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
            </li>
          </ul>
        }
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  user: state.user,
});

export default connect(
  mapStateToProps,
)(VideoHeader);
