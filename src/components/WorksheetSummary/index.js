import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { connect } from 'react-redux';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import Stars from '../lib/Stars';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import { fetchSubmission, submissionFetched } from '../../actions/submission';
import QuestionsSummary from './QuestionsSummary';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';

const kMinimumPointsToEarnGoldMedal = 7500;
const kMinimumPointsToEarnSiverMedal = 5000;
const kMinimumPointsToEarnBronzeMedal = 2500;

class WorksheetSummary extends Component {
  static propTypes = {
    fetchSubmission: React.PropTypes.func,
    session: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    submissions: React.PropTypes.shape({
    }),
    params: React.PropTypes.shape({
      studentId: React.PropTypes.string,
      assignmentId: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    const { student } = this.props;
    this.state = {
      studentId: props.params.studentId,
      assignmentId: props.params.assignmentId,
      worksheetMeta: {

      },
      totalCount: 0,
      correctCount: 0,
      inCorrectCount: 0,
      skippedCount: 0,
      secondAttemptCount: 0,
      incorrectOrFlaggedCount: 0,
      isTeacherReviewed: false,
      isShowAllTabActive: false,
    };

    props.fetchSubmission({
      studentId: this.state.studentId,
      submissionId: this.state.assignmentId,
    });
    student.submissions.map((submission) => {
      if (submission._id === props.params.assignmentId) {
        this.state.worksheetMeta = submission.worksheet_meta;
        if (submission.date_teacher_reviewed) {
          this.state.isTeacherReviewed = true;
        }
      }
    });
  }
  componentDidMount() {
    Raven.setUserContext({ id: this.state.studentId });
    window.Intercom('shutdown');
   this.dispalyCongratulationsAnimation();
  }

  dispalyCongratulationsAnimation = () => {
    const { student } = this.props;
    let title = Localization.localizedStringForKey('Congratulations!');
    let message = "";
    
    if ( student.summary && student.summary.outstanding_rewardbalance) {
      let rewardPoints = student.summary.outstanding_rewardbalance;
      //message = `You can get Silver medal with ${kMinimumPointsToEarnSiverMedal - rewardPoints} more points or Gold with ${kMinimumPointsToEarnGoldMedal - rewardPoints} more points. Go for the Gold!`;
      //badgeAnimation(title, message);
      if (rewardPoints >= kMinimumPointsToEarnBronzeMedal  && rewardPoints < kMinimumPointsToEarnSiverMedal) {
        message = `You can get Silver medal with ${kMinimumPointsToEarnSiverMedal - rewardPoints} more points or Gold with ${kMinimumPointsToEarnGoldMedal - rewardPoints} more points. Go for the Gold!`;
        badgeAnimation(title, Localization.localizedStringForKey(message));
      }  else if (rewardPoints >= kMinimumPointsToEarnSiverMedal && rewardPoints < kMinimumPointsToEarnGoldMedal) {
        message = `You can get Gold medal with ${kMinimumPointsToEarnGoldMedal - rewardPoints} more points. Go for it!`
        badgeAnimation(title, Localization.localizedStringForKey(message));
      } else if (rewardPoints >= kMinimumPointsToEarnGoldMedal) {
        message = `You achieved Gold medal for this month. That's Awesome!!!`;
        badgeAnimation(title, Localization.localizedStringForKey(message));
      } else {
        return;
      }
    }
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  questionsView = (submission) => {
    const questionArray = [];
    let className;
    let hasStudentScribble;
    let hasTeacherScribble;
    let hasFlag;
    submission.answers.Questions.forEach((q) => {
      if (!q.SecondAttemptCorrect) {
        q.SecondAttemptCorrect = 'N';
      }

      let isCorrect = false;
      hasStudentScribble = this.hasStudentScribble(submission, q);
      hasTeacherScribble = this.hasTeacherScribble(submission, q);
      hasFlag = this.hasFlag(q);
      if (q.Skipped === 'Y') {
        className = 'incorrect';
      } else if (q.Correct === 'Y') {
        className = 'correct';
        isCorrect = true;
      } else if (q.SecondAttemptCorrect === 'Y') {
        className = 'secondTry';
        isCorrect = true;
      } else {
        className = 'incorrect';
      }
      const questionSummaryView = (<QuestionsSummary
        key={q.Number}
        className={className}
        submission={submission} q={q}
        studentId={this.state.studentId}
        assignmentId={this.state.assignmentId}
        hasStudentScribble={hasStudentScribble}
        hasTeacherScribble={hasTeacherScribble}
        hasFlag={hasFlag}
        // flagComment={q.FlagComment} -- this should be Flagcomment from teacher
        questionNumber={q.Number}
        timeTaken={q.TimeTaken}
        isCorrect={isCorrect}
        flagTeacherAudio={q.FlagTeacherAudio}
        secondAttemptCorrect={q.SecondAttemptCorrect}
      />);
      if (this.state.isShowAllTabActive) {
        questionArray.push(
          questionSummaryView
        );
      } else if ((q.Correct === 'N' && (q.SecondAttemptCorrect ? q.SecondAttemptCorrect === "N" : true )) || q.Skipped === 'Y' || this.hasFlag(q)) {
        questionArray.push(
          questionSummaryView
        );
      }
    });
    return (<div className="a-row"> {questionArray} </div>);
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

  hasStudentScribble = (submission, q) => {
    const studentScribbles = submission ?
      submission.scribble_layers[`Scribbles_Student_${this.state.studentId}`] : '';
    let isScribblePresent = false;
    if (studentScribbles) {
      studentScribbles.forEach((scribble) => {
        if (parseInt(scribble.Number, 10) === parseInt(q.Number, 10) && scribble.Scribbles.length > 0) {
          isScribblePresent = true;
          return isScribblePresent;
        }
      });
    }
    return isScribblePresent;
  }

  hasTeacherScribble = (submission, q) => {
    const teacherScribbles = submission ?
      submission.scribble_layers[`Scribbles_Teacher_${submission.teacher_user_id}`] : '';
    let isScribblePresent = false;
    if (teacherScribbles) {
      teacherScribbles.forEach((scribble) => {
        if (parseInt(scribble.Number, 10) === parseInt(q.Number, 10)) {
          isScribblePresent = true;
          return isScribblePresent;
        }
      });
    }
    return isScribblePresent;
  }

  hasFlag = (q) => {
    if (((q.FlagComment && q.FlagComment !== '') || q.FlagStudentAudio || q.FlagOptionNumber > 0 || (q.FlagSkipMode > 0))) {
      return true;
    }
    return false;
  }
  refreshCorrectInCorrectCount(submission) {
    // calculate the numbers from submission
    let correctCount = 0;
    let inCorrectCount = 0;
    let skippedCount = 0;
    let secondAttemptCount = 0;
    let incorrectOrFlaggedCount = 0;

    if (submission.total_score > 0) {
      submission.answers.Questions.forEach((q) => {
        if ((q.Correct === 'N' && (q.SecondAttemptCorrect ? q.SecondAttemptCorrect === "N" : true )) || q.Skipped === 'Y' || this.hasFlag(q)) {
          incorrectOrFlaggedCount += 1;
        }
        if (q.Skipped === 'Y' && !this.state.isReviewMode) {
          skippedCount += 1;
        } else if (q.Correct === 'Y') {
          correctCount += 1;
        } else if (q.SecondAttemptCorrect === 'Y') {
          secondAttemptCount += 1;
        }
      });
      if (submission.total_score > 0) {
        inCorrectCount = submission.total_score - (correctCount + secondAttemptCount);
      }

      this.state.totalCount = submission.total_score;
      this.state.correctCount = correctCount;
      this.state.inCorrectCount = inCorrectCount;
      this.state.secondAttemptCount = secondAttemptCount;
      this.state.skippedCount = skippedCount;
      this.state.incorrectOrFlaggedCount = incorrectOrFlaggedCount;
    }
  }
  tabClicked = (isActiveTab) => {
    if (isActiveTab) {
      this.setState({ isShowAllTabActive: true });
    } else {
      this.setState({ isShowAllTabActive: false });
    }
  }

  pushDataLayer() {
    dataLayer.push({
      uid: this.props.student._id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'viewContent',
      worksheetType: this.state.worksheetMeta.type,
      contentType: 'Worksheet Completed',
      contentId: this.submission.worksheet_id, // i.e. DT140
      timer: this.submission.time_taken, // Seconds the assessment took. As number.
      pointsSummary: {
        accuracy: parseInt(this.submission.reward_points.score, 10),
        triplePointsBonus: parseInt(this.submission.reward_points.triple_zone, 10),
        speedBonus: parseInt(this.submission.reward_points.speed, 10),
        penalty2ndTry: parseInt(this.submission.reward_points.penalty, 10),
        totalPointsEearned: parseInt(this.submission.reward_points.total, 10),
      },
      scoreSummary: {
        totalQuestions: parseInt(this.state.totalCount, 10),
        correctAnswers: parseInt(this.submission.score_achieved, 10),
        secondTries: this.state.secondAttemptCount,
        incorrectAnswers: this.state.inCorrectCount,
        finalScore: Math.round((this.submission.score_achieved / this.submission.total_score) * 100),
      },

    });
    Raven.captureBreadcrumb({
      message: 'Worksheet Completed',
      category: 'attempt',
      data: {
        studentId: this.props.student._id,
        worksheetType: this.state.worksheetMeta.type,
        worksheet_id: this.submission.worksheet_id,
        timer: this.submission.time_taken,
      },
    });
  }

  render() {
    const { student, submissions } = this.props;
    this.submission = submissions[this.state.assignmentId];
    let percentageScore = 0;
    if (this.submission) {
      this.refreshCorrectInCorrectCount(this.submission);
      this.pushDataLayer();
      percentageScore = Math.round((this.submission.score_achieved / this.submission.total_score) * 100);
    }
    let feedbackMessage = '';
    let feedbackTitle = '';
    if (this.state.worksheetMeta && this.state.worksheetMeta.type && this.state.worksheetMeta.type.toLowerCase() === 'challenge') {
      if (percentageScore >= 100) {
        feedbackTitle = Localization.localizedStringForKey('Fantastic Work!');
      } else if (percentageScore > 0) {
        feedbackTitle = Localization.localizedStringForKey('Good Effort!');
      } else {
        feedbackTitle = Localization.localizedStringForKey('Thank you for trying!');
      }
      feedbackMessage = Localization.localizedStringForKey('Great job on taking up the Thinkster challenge. You will be assigned a new problem next week - stay tuned!');
    } else {
      if (this.state.isTeacherReviewed) {
        feedbackTitle = Localization.localizedStringForKey('Coach Feedback');
      } else {
        feedbackTitle = Localization.localizedStringForKey('Awaiting Feedback');
      }
      if (Common.authorized(student, features.TEACHER_FEEDBACK)) {
        feedbackMessage = Localization.localizedStringForKey('Your worksheet has been submitted to your coach for review. Check back later.');
      } else {
        if (percentageScore >= 100) {
          feedbackTitle = Localization.localizedStringForKey('Fantastic Work!');
        } else if (percentageScore > 0) {
          feedbackTitle = Localization.localizedStringForKey('Good Effort!');
        } else {
          feedbackTitle = Localization.localizedStringForKey('Thank you for trying!');
        }
        feedbackMessage = Localization.localizedStringForKey('Good work! Please check your worksheets tab for more worksheets.');
      }
    }
    const classNameForShowaAllTab = this.state.isShowAllTabActive ? 'o-tabBar__tab o-tabBar__tab--active' : 'o-tabBar__tab o-tabBar__tab';
    const classNameForIncorrectFlaggedTab = this.state.isShowAllTabActive ? 'o-tabBar__tab o-tabBar__tab' : 'o-tabBar__tab o-tabBar__tab--active';

    const studentImageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${student._id}.png`;
    let coachImageUrl = 'https://randomuser.me/api/portraits/lego/3.jpg';
    if (this.state.isTeacherReviewed && this.submission && this.submission.teacher_user_id) {
      coachImageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${this.submission.teacher_user_id}.png`;
    }
    return (
      <div>
        <header className="o-appHeader">
          <Link href="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
            <ThinksterLogomark />
            <ThinksterWordmark />
          </Link>
          { this.submission ?
            <div className="o-appHeader__breadcrumb">
              : &nbsp;
              <Link to={`/student/${student._id}`} title="Worksheets" className="a-color(copy-1)">
                {Localization.localizedStringForKey('Worksheets')}
              </Link>
              &nbsp; : &nbsp;
              <span className="a-color(copy-1)">
                #{this.submission.worksheet_number}
              </span>
              &nbsp; : &nbsp;
              <span className="a-strong a-color(copy-1)">
                {Localization.localizedStringForKey('Summary')}
              </span>
            </div>
            :
            <div className="o-appHeader__breadcrumb">
              : &nbsp;
              <Link to={`/student/${student._id}`} title="Worksheets">
                {Localization.localizedStringForKey('Worksheets')}
              </Link>
            </div>
            }
          { this.isGuestFlow() ?
            <ul className="o-appHeader__actions">
              <li className="o-appHeader__actionItem">
                <a href={ENV.enrollURL} title="Start Free Trial" className="b-flatBtn b-flatBtn--gradient(active-3)" target="_blank">
                  <span className="b-button__label">
                    Start Free Trial
                  </span>
                </a>
              </li>
            </ul> :
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

                <img className="b-avatar b-avatar--size(32)" src={studentImageUrl} type="image/png" name={student.first_name || ''} />
              </li>
            </ul>
          }

        </header>
        {
          this.submission ?
            <div className="a-appView">
              <div className="a-appView__contents">
                <div className="o-worksheetSummary__header o-worksheetSummary__header--mathPattern">
                  <h1 className="a-h(28) a-color(white)">
                    <span className="a-s(12) o-worksheetSummary__id">
                      #{this.submission.worksheet_number}
                    </span>
                    <span className="o-worksheetSummary__title">
                      {this.state.worksheetMeta.name}
                    </span>
                  </h1>
                  <span className="a-p(14) a-strong o-worksheetSummary__dateCompleted a-color(white)">
                    {Localization.localizedStringForKey('Completed')} {moment.utc(this.submission.date_submitted).format('MMM DD, YYYY')}
                  </span>


                  <section className="o-perfReport__summary">
                    <div className="o-perfReport__summaryScore">
                      <span className="a-strong o-perfReport__summaryValue">
                        <strong>{percentageScore}%</strong>
                      </span>
                      <span className="o-perfReport__summaryLabel">
                        {Localization.localizedStringForKey('Final Score')}
                      </span>
                    </div>

                    <div className="o-perfReport__summaryScore">
                      <span className="o-perfReport__summaryValue">
                        {this.submission.score_achieved} / {this.submission.total_score}
                      </span>
                      <span className="o-perfReport__summaryLabel">
                        {Localization.localizedStringForKey('Correct Answers')}
                      </span>
                    </div>

                    <div className="o-perfReport__summaryScore">
                      <span className="o-perfReport__summaryValue">
                        {moment.utc(this.submission.time_taken * 1000).format(`${this.submission.time_taken > 3600 ? 'HH.mm.ss' : 'mm:ss' }`)}
                      </span>
                      <span className="o-perfReport__summaryLabel">
                        {Localization.localizedStringForKey('Time Taken')}
                      </span>
                    </div>

                    <div className="o-perfReport__summaryScore">
                      <span className="o-perfReport__summaryValue">
                        {moment.utc(this.state.worksheetMeta.suggested_time * 1000 * 60).format('mm:ss')}
                      </span>
                      <span className="o-perfReport__summaryLabel">
                        {Localization.localizedStringForKey('Suggested Time')}
                      </span>
                    </div>

                    <div className="o-perfReport__summaryScore">
                      <span className="o-perfReport__summaryValue">
                        {this.submission.reward_points ? this.submission.reward_points.total : '0'}
                      </span>
                      <span className="o-perfReport__summaryLabel">
                        {Localization.localizedStringForKey('Points Earned')}
                      </span>
                    </div>

                  </section>
                </div>

                <section className="a-container">

                  <div className="a-row a-justifyContent(center) o-worksheetSummary__report">

                    <div className="a-col a-col(1-3)">

                      <h2 className="a-h(18) a-h(18)--hasDivider a-justify(center)">
                        {Localization.localizedStringForKey('Points Summary')}
                      </h2>
                      <div className="b-report">

                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Accuracy')}
                          </span>
                          <span className="a-color(active-1b)">
                            {this.submission.reward_points.score}
                          </span>
                        </div>

                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Triple Point Bonus')}
                          </span>
                          <span className="a-color(active-1b)">
                            {this.submission.reward_points.triple_zone}
                          </span>
                        </div>

                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Speed Bonus')}
                          </span>
                          <span className="a-color(active-1b)">
                            {this.submission.reward_points.speed}
                          </span>
                        </div>

                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Penalty: 2nd Try')}
                          </span>
                          <span className="a-color(active-2)">
                            - {this.submission.reward_points.penalty}
                          </span>
                        </div>

                        <div className="a-s(18) a-mTop(8) b-report__item">
                          <span className="a-color(copy-1) b-report__itemLabel">
                            {Localization.localizedStringForKey('Total Points Earned')}
                          </span>
                          <span className="a-color(active-3)">
                            {this.submission.reward_points.total}
                          </span>
                        </div>

                      </div>
                    </div>

                    <div className="a-col a-col(1-3)">

                      <h2 className="a-h(18) a-h(18)--hasDivider a-justify(center)">
                        {Localization.localizedStringForKey('Score Summary')}
                      </h2>

                      <div className="b-report">
                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Total Questions')}
                          </span>
                          <span className="b-count b-count--skipped">
                            {this.state.totalCount}
                          </span>
                        </div>

                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Correct Answers')}
                          </span>
                          <span className="b-count b-count b-count--correct">
                            {this.state.correctCount}
                          </span>
                        </div>

                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Second Tries')}
                          </span>
                          <span className="b-count b-count b-count--secondTry">
                            {this.state.secondAttemptCount}
                          </span>
                        </div>


                        <div className="a-p(14) b-report__item">
                          <span className="a-color(copy-2) b-report__itemLabel">
                            {Localization.localizedStringForKey('Incorrect Answers')}
                          </span>
                          <span className="b-count b-count--incorrect">
                            {this.state.inCorrectCount}
                          </span>
                        </div>

                        <div className="a-s(18) a-mTop(8) b-report__item">
                          <span className="b-report__itemLabel">
                            {Localization.localizedStringForKey('Final Score')}
                          </span>
                          <span className="a-color(active-3)">
                            {percentageScore}%
                      </span>
                        </div>

                      </div>
                    </div>


                    <div className="a-col a-col(1-3)">

                      <h2 className="a-h(18) a-h(18)--hasDivider a-justify(center)">
                        {feedbackTitle}
                      </h2>
                      <div className="b-report">
                        {this.state.isTeacherReviewed ?
                          <div>
                            {this.submission.text_note ? <div className="o-worksheetFeedback">
                              <div className="o-worksheetFeedback__stars">
                                <Stars count={this.starCount(this.submission.grade)} />
                              </div>
                              <p className="o-worksheetFeedback__message">
                                {this.submission.text_tag || ''}
                              </p>
                            </div> : ''}
                            <div className="b-comment o-verboseFeedback">
                              <div className="b-comment__source b-comment__source--avatar(64)">
                                <img className="b-avatar b-avatar--size(64)" src={coachImageUrl} onError="" />
                                <p className="b-comment__date">
                                  {moment.utc(this.submission.date_teacher_reviewed).format('MMM DD')}
                                </p>
                              </div>
                              <div className="b-comment__bubble">
                                {this.submission.text_note || this.submission.text_tag}
                              </div>
                            </div>
                          </div> : <div className="o-worksheetFeedback o-worksheetFeedback--pending">
                            <div className="o-worksheetFeedback__stars">
                              <Stars count={this.starCount(this.submission.grade)} />
                            </div>
                            <div className="o-worksheetFeedback__message">
                              {feedbackMessage}
                            </div>
                          </div>
                        }
                      </div>
                      {/*
                    Graded Feedback Content Ends Here
                  */}

                    </div>

                  </div>

                  <div className="o-tabBar">
                    <button>
                      <span className={classNameForShowaAllTab} onClick={() => this.tabClicked(true)} >
                        <span className="o-tabBar__label">
                          {Localization.localizedStringForKey('Show All')} ({this.submission.total_score})
                    </span>
                      </span>
                    </button>

                    <button>
                      <span className={classNameForIncorrectFlaggedTab} onClick={() => this.tabClicked(false)} >
                        <span className="o-tabBar__label">
                          {Localization.localizedStringForKey('Incorrect / Flagged')} ({this.state.incorrectOrFlaggedCount})
                    </span>
                      </span>
                    </button>
                  </div>

                  <section className="o-questionTiles">
                    <p className="a-p(14) a-p(14)--intro a-color(copy-2) a-justify(center)">
                      {Localization.localizedStringForKey('Select any of the question tiles below to see more details')}.
                </p>
                    {this.questionsView(this.submission)}
                  </section>
                </section>
              </div>
            </div> : ''}
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  student: state.student,
  submissions: state.submissions,
  user: state.user,
});

const actionCreators = {
  fetchSubmission,
  submissionFetched,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(WorksheetSummary);
