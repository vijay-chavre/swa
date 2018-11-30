import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import TutoringSession from './TutoringSession';

class TutoringSessions extends Component {

  static propTypes = {
    sessions: React.PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {
      sessionsFilter: '',
    };
  }

  componentDidMount() {
  }

  getGradeRange() {
    const { student } = this.props;
    if (student.grade < 6 || student.grade.toLowerCase() === 'k') {
      return 'K - 5';
    } else {
      return '6 - 8';
    }
  }

  getTutoringSessions() {
    let filteredSessions = this.props.sessions;
    if (filteredSessions && filteredSessions.length > 0) {
      const gradeRange = this.getGradeRange();
      if (this.state.sessionsFilter !== '') {
        filteredSessions = filteredSessions.filter(session => 
        session.status === this.state.sessionsFilter);
      }
      // _.sortBy(filteredSessions, function(o) { return moment(o.date_session); });
      filteredSessions = _.orderBy(filteredSessions, (e) => moment(e.date_session), 'asc');

      return filteredSessions.filter(session =>
        (session.student_id === this.props.student._id) || (session.student_id === null && session.grade_range === gradeRange)
      );
    }
    return null;
  }

  isActiveSessionsTab(tab) {
    if (tab == this.state.sessionsFilter) {
      return 'sessionActiveContent';
    } else {
      return '';
    }
  }

  filterSessions(sessionsFilter) {
    this.setState({sessionsFilter})
  }

  render() {
    const { student, sessions, parent } = this.props;
    const tutoringSessions = this.getTutoringSessions();
    return (
      <div className="a-container a-container--full sessionTabs-blck-transparent sessionTabs-blck">
        <div className="o-topicSelector has-negetive-margin">
          {/* Session Tab Content Links*/}
          <ul className="sessionTabsContentLnk">
            <li className={this.isActiveSessionsTab('')}><span onClick={() => this.filterSessions('')}>All</span></li>
            <li className={this.isActiveSessionsTab('ENDED')}><span onClick={() => this.filterSessions('ENDED')}>Completed</span></li>
            <li className={this.isActiveSessionsTab('ACCEPTED')}><span onClick={() => this.filterSessions('ACCEPTED')}>Scheduled</span></li>
            <li className={this.isActiveSessionsTab('PURCHASED')}><span onClick={() => this.filterSessions('PURCHASED')}>Unscheduled</span></li>
          </ul>
        </div>
        {/* Session Tab Content Details*/}
        <div className="sessionTabsContentDetails">
          { (tutoringSessions && tutoringSessions.length > 0) ?
            this.getTutoringSessions().map((session, index) => {
              return <TutoringSession session={session} gradeRange={this.getGradeRange()} student={student} parent={parent} index={index} />
            }) : '' }
        </div>
        <div className="additional">
          <h4>Want Additional Sessions?</h4>
          <button onClick={() => {window.open(ENV.purchaseSessionURL, '_blank'); }} className="btn btn-buy">Buy Now</button>
        </div>
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  sessions: state.tutoringSessions,
  student: state.student,
  parent: state.user,
});

const actionCreators = {
};

export default connect(
  mapStateToProps,
  actionCreators,
)(TutoringSessions);
