import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

class TutoringSession extends Component {

  static propTypes = {
  }

  componentDidMount() {
  }

  getSessionStatus() {
    const { session } = this.props;
    if (session.status === 'PURCHASED') {
      return 'Unscheduled';
    } if (session.status === 'ACCEPTED') {
      return <span>Scheduled On: <br /> {moment(session.date_session).format('Do MMM YYYY, h:mm A')}</span>;
    } else if (session.status === 'ENDED') {
      return <span>Completed: <br /> {moment(session.date_end).format('Do MMM YYYY, h:mm A')}</span>;
    }
  }

  getSessionLinkLabel() {
    const { session } = this.props;
    if (session.status === 'ENDED') {
      if (session.recording_location) {
        return 'Watch Recording';
      }
      return 'The recording will be available after 24 hours of completing the session.';
    } else if (session.status === 'PURCHASED') {
      return 'Schedule Now';
    }
    return '';
  }

  getSessionBorder() {
    const { session } = this.props;
    if (session.status === "PURCHASED") {
      return "eachSession purple";
    } else if (session.status === "ENDED") {
      return "eachSession saffron";
    } else if (session.status === "ACCEPTED") {
      return "eachSession green";
    }
    return '';
  }

  getSessionIcon() {
    const { session } = this.props;
    if (session.status === "PURCHASED") {
      return "eachSessionUnSchedule";
    } else if (session.status === "ENDED") {
      return "eachSessionRecord";
    } else if (session.status === "ACCEPTED") {
      return "eachSessionSchedule";
    }
  }

  getSessionLink() {
    const { session } = this.props;
    if (session.status === "ENDED") {
      return session.recording_location;
    } else if (session.status === "PURCHASED") {
      return this.getYouCanBookMeLink();
    }
  }

  getYouCanBookMeLink() {
    const { session, student, parent, token, gradeRange } = this.props;
    return `${ENV.ycmbSessionsURL}?STUDENT_ID=${student._id}&team=${gradeRange} Grade Teacher&EMAIL=${parent.email_address}&PARENT_NAME=${parent.first_name}&STUDENT_NAME=${student.first_name}&SESSION_ID=${session.id}&ACCESS_TOKEN=${token}`;
  }

  render() {
    const { session, index } = this.props;
    const gradeRange = session.grade_range ? `( ${session.grade_range} )` : '';
    return (
      <div className={this.getSessionBorder()}>
        <a href={this.getSessionLink()} target="_blank" className="hoverLinks">
          <h4 className="eachSessionTitle">{`SESSION ${gradeRange}`} </h4>
          <p className="eachSessionDetail">{this.getSessionStatus()}</p>
          <figure className={this.getSessionIcon()}></figure>
        </a>
        <p className="eachSessionDetail"><a href={this.getSessionLink()} target="_blank" className="scheduleLink">{this.getSessionLinkLabel()}</a></p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.session.token,
});

const actionCreators = {
};

export default connect(
  mapStateToProps,
  actionCreators,
)(TutoringSession);
