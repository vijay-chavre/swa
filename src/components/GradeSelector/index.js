import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';
import Helmet from 'react-helmet';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import * as Localization from '../Shared/Localization';
import Footer from '../Footer';
import config from '../../constants/config';
import * as SessionActions from '../../actions/session';
import * as Common from '../Shared/Common';

class GradeSelector extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    user: React.PropTypes.shape({
    }),
  }
  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  logoutAndRedirect(e) {
    const { logout } = this.props;
    if (this.props.fromDemo) {
      logout();
      if (this.props.token != 'undefined' && this.props.userId != 'undefined') {
        window.location.href = ENV.productTourURL + `?token=${ this.props.token }&id=${this.props.userId}`;
      } else {
        window.location.href = ENV.productTourURL;
      }
    } else {
      logout();
      browserHistory.push('/login');
    }
  }

  gradeView = () => {
    const grades = [];
    const { user } = this.props;
    const students = [];
    Object.keys(user.students).map((studentID) => {
      students.push(user.students[studentID]);
    });
    _.sortBy(students, ['grade']);
    students.map((student) => {
      // const student = user.students[studentID];
      let grade = student.grade;
      if (student.grade.toLowerCase() === 'k' || student.grade.toLowerCase() === 'r') {
        grade = 0;
      }
      grades[grade] = (<div className="a-col a-col-med-2(1-5) a-col(1-3)">
        <div className={`o-gradeSelection__grade o-gradeSelection__grade--${student.grade.toUpperCase()}`}>
          <Link to={`/student/${student._id}`} className="o-gradeSelection__gradeLink" />
          <h2 className="a-s(14) a-allCaps">
            {student.grade.toLowerCase() === 'k' ? Localization.localizedStringForKey('Kindergarten') : `${Localization.localizedStringForKey('Grade')} ${student.grade}` }
          </h2>
          <div className="o-gradeSelection__gradeProfile">
            <h2 className="a-h(64) a-color(white)">
              {student.grade.toLowerCase() === 'k' && config.isViaAfrika ? 'R' : student.grade }
            </h2>
          </div>
        </div>
      </div>);
    });
    return (<div className="a-row a-justifyContent(center)"> {grades} </div>);
  }

  render() {
    const { logout } = this.props;
    return (
      <div>
        <Helmet
          title="Thinkster Math | Guest Flow & Sample Problems"
          meta={[
            { name: 'description', content: 'Thinkster Math guest flow with sample questions from grades K-8.' },
          ]}
        />
        <header className="o-appHeader">
          <Link href="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
            <ThinksterLogomark />
            <ThinksterWordmark />
          </Link>
          <ul className="o-appHeader__actions">
            <li onClick={this.logoutAndRedirect.bind(this)} className="o-appHeader__actionItem">
              <Link className="o-appHeader__actionLink" style={{ cursor: 'pointer' }}>
                { this.isGuestFlow() ? Localization.localizedStringForKey('Exit Guest Flow') : Localization.localizedStringForKey('Log Out')}
              </Link>
            </li>
          </ul>
        </header>
        <div className="a-appView a-appView--altBG o-gradeSelection">
          <div className="a-appView__contents">
            <div className="a-container a-container__intro">
              <h1 className="a-h(28)">
                {Localization.localizedStringForKey('Choose a Grade Below to View Sample Questions')}
              </h1>
            </div>

            <div className="a-container">
              {
                this.gradeView()
              }
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

const actionCreators = {
  logout: SessionActions.logout,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(GradeSelector);
