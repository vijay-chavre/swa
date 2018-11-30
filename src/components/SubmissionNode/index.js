import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
import { Link } from 'react-router';
import Stars from '../lib/Stars';
import Stopwatch from '../Shared/Glyphs/Stopwatch';
import CommentBubble from '../Shared/Glyphs/CommentBubble';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';
import { updateStudentReviewedDate } from '../../actions/submission';
import { connect } from 'react-redux';

class SubmissionNode extends Component {

  static propTypes = {
    session: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    submission: React.PropTypes.shape({
    }),
    updateStudentReviewedDate: React.PropTypes.func,
  }

  static perentageLevel(percentage) {
    if (percentage < 60) {
      return 'o-worksheetTile__statusBtn o-worksheetTile__statusBtn--low';
    } else if (percentage < 70) {
      return 'o-worksheetTile__statusBtn o-worksheetTile__statusBtn--mediumLow';
    } else if (percentage < 90) {
      return 'o-worksheetTile__statusBtn o-worksheetTile__statusBtn--medium';
    } else if (percentage > 90) {
      return 'o-worksheetTile__statusBtn o-worksheetTile__statusBtn--high';
    }
    return 'o-worksheetTile__statusBtn';
  }
  starCount = (grade) => {
    if (grade === 'A') {
      return 5;
    } else if (grade === 'B') {
      return 4;
    } else if (grade === 'C') {
      return 3;
    } else if (grade === 'D') {
      return 2;
    }
    return 1;
  }

  updateStudentReviewedDateToServer = () => {
    const { submission, student } = this.props;
    if (submission && submission.date_teacher_reviewed) {
      if (submission.date_student_reviewed) {
        return;
      }
      if (submission._id) {
        const studentReviewedDate = moment.utc().format();
        const submissionDict = {};
        const headerInfoDict = {};
        submissionDict.date_student_reviewed = studentReviewedDate;
        submissionDict._id = submission._id;
        headerInfoDict.class_db = this.submissionDBForStudent(student);
        submissionDict.head_info = headerInfoDict;
        this.props.updateStudentReviewedDate({ submissionDict });
      }
    }
  }

  submissionDBForStudent = (student) => {
    if (student.classes_assigned) {
      const classAssigned = student.classes_assigned;
      const classDB = classAssigned.couch_db;
      return classDB;
    }
  }
  render() {
    const { submission, student } = this.props;
    const percentage = Math.round((submission.score_achieved / submission.total_score) * 100);
    let coachImageUrl = 'https://randomuser.me/api/portraits/lego/3.jpg';
    let isTeacherReviewed = false;
    let isStudentReviewed = false;
    if (submission && submission.date_teacher_reviewed) {
      if (submission.date_student_reviewed) {
        isStudentReviewed = true;
      }
      isTeacherReviewed = true;
      if (submission.teacher_user_id) {
        coachImageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${submission.teacher_user_id}.png`;
      }
    }
    return (
      <div key={submission._id} className="a-col a-col(fluid)" onClick={() => this.updateStudentReviewedDateToServer()}>
        <Link className="o-worksheetTile o-worksheetTile--submitted" to={`/student/${student._id}/${submission._id}/summary`}>

          <div className="o-worksheetTile__pane">
            <div className="o-worksheetTile__dateSubmitted">
              {Localization.localizedStringForKey('Completed')} {moment.utc(submission.date_submitted).format('MMM DD, YYYY')}
            </div>

            <div
              className="o-worksheetTile__preview"
              style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/${submission.worksheet_id}/thumbnail.png`, backgroundRepeat: 'no-repeat' }}>

              <div className={SubmissionNode.perentageLevel(percentage)}>
                <h2 className="a-s(20)">
                  {percentage}<span className="a-p(12)">%</span>
                </h2>
                <p className="o-worksheetTile__scoreCount">
                  {submission.score_achieved} of {submission.total_score}
                </p>
              </div>

            </div>
            { 
              (isTeacherReviewed && submission.text_note && !isStudentReviewed) ? 
                <div className="b-commentBadge b-toolTips b-toolTips--left b-toolTips--w(160) o-worksheetTile__commentBadge" data-tooltip="Please check inside the worksheet and read your coach&rsquo;s feedback.">
                  <CommentBubble />
                </div>
                : ''
            }
            <div className="o-worksheetTile__details">
              <p className="a-s(12) a-color(copy-2) o-worksheetTile__id">
                {(submission && submission.worksheet_meta) ? `#${submission.worksheet_meta.worksheet_number}` : ''}
              </p>
              <h1 className="a-h(20) o-worksheetTile__title">
                {(submission && submission.worksheet_meta) ? submission.worksheet_meta.name : ''}
              </h1>
              {
                isTeacherReviewed ?
                  <div className="b-comment o-worksheetTile__comment">
                    <div className="b-comment__source">
                      <img className="b-avatar b-avatar--size(40) o-worksheetTile__commentImg" src={coachImageUrl} onError="" />
                      <p className="b-comment__date">
                        {moment.utc(submission.date_teacher_reviewed).format('MMM DD')}
                      </p>
                    </div>
                    <div className="b-comment__bubble">
                      {submission.text_note ? submission.text_note : submission.text_tag}
                    </div>
                  </div>
                  :
                  <p className="a-p(13) a-color(copy-2)">
                    {(Common.authorized(student, features.TEACHER_FEEDBACK)) ? Localization.localizedStringForKey('Your worksheet has been submitted to your coach for review.') : ''}
                  </p>
              }
              {/**/}
            </div>

          </div>

          <div className="o-worksheetTile__infoBar">
            <p className="o-worksheetTile__infoItem b-indicator o-worksheetTile__timer">
              <Stopwatch />
              {moment.utc(submission.time_taken * 1000).format(`${submission.time_taken > 3600 ? 'HH.mm.ss' : 'mm:ss' }`)}
            </p>
            <p className="o-worksheetTile__infoItem u-flex">
              <Stars count={this.starCount(submission.grade)} />
            </p>
            <p className="o-worksheetTile__infoItem">
              {`${submission.reward_points} ${Localization.localizedStringForKey('Pts Earned')}`}
            </p>
          </div>
        </Link>
     </div>
    );
  }
}


const mapStateToProps = (state) => ({
  submissions: state.submissions,
});

const actionCreators = {
  updateStudentReviewedDate,
};

export default connect(
  mapStateToProps,
  actionCreators
)(SubmissionNode);
