import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';

class StudentHeader extends Component {

  static propTypes = {
    student: React.PropTypes.shape({
      _id: React.PropTypes.string,
    }),
    currentNavigation: React.PropTypes.string,
    user: React.PropTypes.shape({
    }),
    showLeaderboard: React.PropTypes.func,
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }
  getScreenName = () => {
    const { student, currentNavigation } = this.props;
    let name = student.first_name;
    if (currentNavigation === features.LEADERBOARD) {
      if (student.leaderboard_screen_name && student.leaderboard_screen_name !== '') {
        name = student.leaderboard_screen_name;
      }
    }
    return name;
  }

  updateLeaderboardName = () => {
    const { currentNavigation } = this.props;
    if (currentNavigation === features.LEADERBOARD) {
      this.props.showLeaderboard(false);
    } else if (currentNavigation === features.WORKSHEET) {
      this.props.showTimeline(false);
    }
  }

  render() {
    const { student, currentNavigation } = this.props;
    let imageUrl = `https://${ENV.profilePictureBucket}.s3.amazonaws.com/${student._id}.png`;
    if (currentNavigation === features.LEADERBOARD) {
      imageUrl = `https://s3.amazonaws.com/${ENV.leaderboardAvatarBucket}/${student._id}.png`;
    }
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
        <div className="o-appHeader__breadcrumb">
          : &nbsp;
         <span className="a-strong a-color(copy-1)">
            {currentNavigation || Localization.localizedStringForKey('Worksheets')}
          </span>
        </div>
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
                {this.getScreenName()}
                { (Common.isPurchaseOfTypeProduct(student) && student.hide_grade) ? '' :
                <span className="a-p(12) a-color(copy-2)">
                  &nbsp; {Localization.localizedStringForKey('Grade')} {student.grade === 'K' && config.isViaAfrika ? 'R' : student.grade}
                </span>
                }
              </div>
                <img className="b-avatar b-avatar--size(32)" onClick={() => this.updateLeaderboardName()} src={imageUrl} onError="" />
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
)(StudentHeader);
