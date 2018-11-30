import React, { Component } from 'react';
import moment from 'moment';
import ReactCountdownClock from 'react-countdown-clock';
import { connect } from 'react-redux';
import ChallengeNode from '../ChallengeNode';
import SubmittedChallengeNode from '../ChallengeNode/SubmittedChallenge';
import AssignmentNode from '../AssignmentNode';
import SubmissionNode from '../SubmissionNode';
import Tutorial from './Tutorial';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import Footer from '../Footer';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import { workflowCompleted } from '../../actions/studentWorkflow';
import * as features from '../../constants/feature';
import Dialog from '../Shared/Dialog';
import TutoringSessionFeedback from '../Shared/TutoringSessionFeedback';
import VideoModal from '../Shared/VideoModal';
import { fetchStudent, studentFetched } from '../../actions/student';
import ChooseUsername from '../Leaderboard/ChooseUsername';
import { fetchTutoringSessions } from '../../actions/tutoringSessions';
import TutoringSessions from '../TutoringSessions';

class StudentTimeline extends Component {

  static propTypes = {
    workflowCompleted: React.PropTypes.func,
    fetchStudent: React.PropTypes.func,
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    studentWorkflow: React.PropTypes.shape({
    }),
    session: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      showTimeline: true,
      showTimer: false,
      timerShown: false,
      showTutorial: this.showGuestFlowTutorial(),
      tabs: this.initializeTabs(),
      activeTab: undefined,
      activePlaylist: undefined,
      defaultPlaylist: Localization.localizedStringForKey('All Topics'),
      showDialog: false,
      dialogMessage: '',
      showAssignmentTimer: false,
      assignmentTimerShown: true,
      sessionsFilter: '',
      showSessionsView: (this.props.student.service_id && this.props.student.service_id === ENV.baseServiceId),
      currentView: (this.props.student.service_id && this.props.student.service_id === ENV.baseServiceId) ? 'sessions' : 'worksheets',
    };
  }

  // Reward point
  slideIn() {
    const elem = document.getElementById('rewardSection');
    const d = document.getElementById('clickBtn');

    elem.style.right === '-167px' || elem.style.right === '' ? elem.style.right = '0' : elem.style.right = '-167px';
    elem.style.right === '-167px' || elem.style.right === '' ? d.classList.remove('removeHover') : d.classList.add('removeHover');
  }

  componentDidMount() {
    const { student, user } = this.props;

    Raven.setUserContext({ id: student._id });
    this.props.fetchTutoringSessions(user._id);

    // setting up the default view
    if (student.service_id && student.service_id === ENV.baseServiceId) {
      this.state.currentView = 'sessions';
    }
  }
  componentWillReceiveProps(nextProps) {
    this.state.showSessionsView = false;
    if (nextProps.tutoringSessions && nextProps.tutoringSessions.length > 0) {
      const studentsSessions = nextProps.tutoringSessions.filter(session =>
        (session.student_id === this.props.student._id) || (session.student_id === null)
      );
      if (studentsSessions && studentsSessions.length > 0) {
        this.state.showSessionsView = true;
      }
    }
    if (!this.state.showSessionsView && this.props.tutoringSessions && this.props.tutoringSessions.length > 0) {
      const studentsSessions = this.props.tutoringSessions.filter(session =>
        (session.student_id === this.props.student._id) || (session.student_id === null)
      );
      if (studentsSessions && studentsSessions.length > 0) {
        this.state.showSessionsView = true;
      }
    }
  }


  onAcceptDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '' });
  }

  onCloseTutorial = () => {
    const workflow = {};
    workflow.key = 'guest_tutorial_shown';
    workflow.value = true;
    this.props.workflowCompleted(workflow);

    this.setState({ showTutorial: false });
  }

  onTabClick = (key) => {
    const { student } = this.props;
    if (key === 'reviewed' && !Common.authorized(student, features.TEACHER_FEEDBACK)) {
      this.setState({
        showDialog: true,
        dialogMessage: 'Your current plan is not eligible for this feature. Please upgrade to Personalized Tutor-Led program to use this feature.',
      });
    } else {
      this.setState({ activeTab: key });
    }
  }

  setLocaleOfStudent = (student) => {
    if (config.isViaAfrika) {
      if (student.locale && student.locale === 'af_ZA') {
        config.locale = 'af_ZA';
      } else {
        config.locale = 'en_US';
      }
    }
  }

  showGuestFlowTutorial = () => {
    const { studentWorkflow } = this.props;
    if (this.isGuestFlow()) {
      if (!studentWorkflow.guest_tutorial_shown) {
        return false; // not showing it
      }
    }
    return false;
  }

  initializeTabs = () => {
    const tabs = [];
    let timelineTab = {};

    timelineTab.key = 'assigned';
    timelineTab.name = Localization.localizedStringForKey('Assigned');
    tabs.push(timelineTab);

    timelineTab = {};
    timelineTab.key = 'submitted';
    timelineTab.name = Localization.localizedStringForKey('Submitted');
    tabs.push(timelineTab);

    timelineTab = {};
    timelineTab.key = 'reviewed';
    timelineTab.name = Localization.localizedStringForKey('Coach Feedback');
    tabs.push(timelineTab);

    return tabs;
  }

  tabsForTimeline = () => {
    const timelineTabs = [];
    this.state.tabs.forEach((tab) => {
      let tabClassname = '';
      if (tab.key === this.state.activeTab) {
        tabClassname = 'sessionActiveContent';
      }
      timelineTabs.push(
        <li className={tabClassname}>
          <span onClick={() => { this.onTabClick(tab.key); }}>
            {Localization.localizedStringForKey(tab.name)}
          </span>
        </li>
      );
    });

    return timelineTabs;
  }

  playlistsView = () => {
    const { student } = this.props;
    const playlists = [];

    const addPlaylist = (id, name, count) => {
      let playlistClassname = 'o-topicSelector__tab';
      if (this.state.activePlaylist === id) {
        playlistClassname = 'o-topicSelector__tab o-topicSelector__tab--active';
      }

      playlists.push(
        <button
          className={playlistClassname}
          type="button"
          onClick={() => { this.setState({ activePlaylist: id }); }}
        >
          <span className="a-ellipsis o-topicSelector__label">
            {name}
          </span>
          {count >= 0 ?
            <span>&nbsp;({count})</span>
            : ''}
        </button>
      );
    };
    addPlaylist(this.state.defaultPlaylist, this.state.defaultPlaylist, -1);

    if (student && student.playlists) {
      student.playlists.map((playlist) => {
        if (playlist.worksheets && playlist.worksheets.length > 0) { // hiding playlist with no worksheet
          addPlaylist(playlist.id, playlist.name, this.worksheetsCountForPlaylist(playlist));
        }
      });
    }

    return playlists;
  }

  worksheetsCountForPlaylist = (playlist) => {
    const { student } = this.props;
    let count = 0;
    if (this.state.activeTab === 'assigned' || this.state.activeTab === 'all') {
      count = (playlist.worksheets ? playlist.worksheets.length : 0);
    } else if (this.state.activeTab === 'submitted') {
      if (student && student.submissions) {
        student.submissions.map((submission) => {
          if (submission.playlist_id === playlist.id && !submission.date_teacher_reviewed) {
            count += 1;
          }
        });
      }
    } else if (this.state.activeTab === 'reviewed') {
      if (student && student.submissions) {
        student.submissions.map((submission) => {
          if (submission.playlist_id === playlist.id && submission.date_teacher_reviewed) {
            count += 1;
          }
        });
      }
    }

    return count;
  }


  nodesForTab = (tab) => {
    const { student, studentWorkflow } = this.props;
    const nodes = [];
    if (tab === 'assigned') {
      if (student && student.playlists) {
        let isPlaylistLocked = true;
        if (student.playlist_locked !== undefined) {
          isPlaylistLocked = student.playlist_locked;
        }
        // for whiteboarding session removing locking for playlist
        if (isPlaylistLocked) {
          const wbSessionInProgress = studentWorkflow[`wb_session_${student._id}`];
          if (wbSessionInProgress) {
            isPlaylistLocked = false;
          }
        }
        let maxPlaylistWorksheets = 0; // for alternate display of worksheets from each playlist
        student.playlists.map((playlist) => {
          if (playlist.worksheets.length > maxPlaylistWorksheets) {
            maxPlaylistWorksheets = playlist.worksheets.length;
          }
        });
        for (let i = 0; i < maxPlaylistWorksheets; i++) {
          student.playlists.forEach((playlist) => {
            if (this.state.activePlaylist === playlist.id || this.state.activePlaylist === this.state.defaultPlaylist) {
              if (playlist.worksheets.length > i) {
                let isLocked = false;
                if (isPlaylistLocked && i > 0) {
                  isLocked = true;
                }
                const assignment = playlist.worksheets[i];
                let worksheetType = '';
                if (assignment && assignment.meta && assignment.meta.type) {
                  worksheetType = assignment.meta.type.toLowerCase();
                }
                if (worksheetType === 'challenge') {
                  nodes.push(<ChallengeNode key={assignment.id} locked={isLocked} student={student} assignment={assignment} />);
                } else {
                  nodes.push(<AssignmentNode key={assignment.id} locked={isLocked} student={student} assignment={assignment} />);
                }
              }
            }
          });
        }
      }
      this.state.showAssignmentTimer = false;
      if (nodes.length <= 0 && this.state.defaultPlaylist === this.state.activePlaylist) {
        if (Common.isLiteStudent(student)) {
          if (student.pastWeekSubmissionCount >= 10) {
            let worksheetLimitEndDate = student.worksheet_limit_end_date;
            if (worksheetLimitEndDate) {
              worksheetLimitEndDate = moment.utc(worksheetLimitEndDate);
              worksheetLimitEndDate.add(1, 'days');
              nodes.push(<span style={{ 'margin-left': '5%', 'margin-right': '5%', 'line-height': '25px' }}><p>{Localization.localizedStringForKey(`You have completed 10 worksheets for this week. Your next set of worksheets will be available on ${worksheetLimitEndDate.format('DD-MMM-YYYY')}. You can also upgrade to our Personalized Tutor-Led program to get more worksheets now.`)}</p></span>);
            } else {
              nodes.push(<span style={{ 'margin-left': '5%', 'margin-right': '5%', 'line-height': '25px' }}><p>{Localization.localizedStringForKey('You have completed 10 worksheets for this week. Your next set of worksheets will be available next week. You can also upgrade to our Personalized Tutor-Led program to get more worksheets now.')}</p></span>);
            }
          } else {
            if (!this.state.showTimer) {
              this.state.showAssignmentTimer = true;
              if (this.state.assignmentTimerShown && !this.state.loading) {
                setTimeout(() => {
                  this.setState({ assignmentTimerShown: false });
                }, 2000);
              }
            }
            nodes.push(<span style={{ 'margin-left': '5%', 'margin-right': '5%', 'line-height': '25px' }}><p>{Localization.localizedStringForKey('We are evaluating your performance and assigning worksheets that are just right for you. In the meantime, you may request any particular assignment from the Progress Matrix page.')}</p></span>);
          }
        } else {
          nodes.push(<span>{Localization.localizedStringForKey('You do not have any assigned worksheets currently. Your coach is in the process of updating your study plan.')}</span>);
        }
      }
    } else if (tab === 'submitted') {
      if (student && student.submissions) {
        student.submissions.map((submission) => {
          if (this.state.activePlaylist === submission.playlist_id || this.state.activePlaylist === this.state.defaultPlaylist) {
            if (!submission.date_teacher_reviewed) {
              let worksheetType = '';
              if (submission.worksheet_meta && submission.worksheet_meta.type) {
                worksheetType = submission.worksheet_meta.type.toLowerCase();
              }
              if (worksheetType === 'challenge') {
                nodes.push(<SubmittedChallengeNode key={submission._id} student={student} submission={submission} />);
              } else {
                nodes.push(<SubmissionNode key={submission._id} student={student} submission={submission} />);
              }
            }
          }
        });
      }

      if (nodes.length <= 0 && this.state.defaultPlaylist === this.state.activePlaylist) {
        nodes.push(<span>{(student && student.submissions && student.submissions.length > 0) ? Localization.localizedStringForKey('Yay! Your coach has reviewed all your work.') : Localization.localizedStringForKey('No work to review.')}</span>);
      }
    } else if (tab === 'reviewed') {
      if (student && student.submissions) {
        student.submissions.map((submission) => {
          if (this.state.activePlaylist === submission.playlist_id || this.state.activePlaylist === this.state.defaultPlaylist) {
            if (submission.date_teacher_reviewed) {
              let worksheetType = '';
              if (submission.worksheet_meta && submission.worksheet_meta.type) {
                worksheetType = submission.worksheet_meta.type.toLowerCase();
              }
              if (worksheetType === 'challenge') {
                nodes.push(<SubmittedChallengeNode key={submission._id} student={student} submission={submission} />);
              } else {
                nodes.push(<SubmissionNode key={submission._id} student={student} submission={submission} />);
              }
            }
          }
        });
      }

      if (nodes.length <= 0 && this.state.defaultPlaylist === this.state.activePlaylist) {
        nodes.push(<span>{Localization.localizedStringForKey('Did you submit any work recently? If yes, your coach is currently reviewing your worksheets. Please check later.')}</span>);
      }
    } else if (tab === 'all') {
      if (student && student.playlists) {
        student.playlists.map((playlist) => playlist.worksheets.map((assignment) => {
          nodes.push(<AssignmentNode key={assignment.id} student={student} assignment={assignment} />);
        }));
      }
      if (student && student.submissions) {
        student.submissions.map((submission) => {
          nodes.push(<SubmissionNode key={submission._id} student={student} submission={submission} />);
        });
      }
    }

    return nodes;
  }

  showScheduleMessage() {
    const { student } = this.props;
    if (this.isGuestFlow()) {
      return false;
    } else if (student && this.state.activeTab === 'assigned') {
      if (student.submissions && student.submissions.length > 0) {
        const dateCreated = moment(student.enrollment_start_date);
        const dateDiff = moment().diff(dateCreated, 'days');
        if (dateDiff < 2) {
          if (Common.isLiteStudent(student)) {
            if (!this.progressMatrixViewed()) {
              return true;
            }
            return false;
          }
          return true;
        } else if (!student.is_active) { // if user is not paid //for now checking student's active flag
          return true;
        }
      }
    }
    return false;
  }

  hideTimer = () => {
    const { student } = this.props;
    this.setState({ showTimer: false, timerShown: true });
    const workflow = {};
    workflow.key = `proficiency_timer_shown_${student._id}`;
    workflow.value = true;
    this.props.workflowCompleted(workflow);
    this.props.fetchStudent({ studentId: student._id });
  }

  hideAssignmentTimer = () => {
    const { student } = this.props;
    this.setState({ showAssignmentTimer: false, assignmentTimerShown: true });
    this.props.fetchStudent({ studentId: student._id });
  }

  shouldShowTimer = () => {
    const { student, studentWorkflow } = this.props;
    if (student && this.showScheduleMessage()) {
      const timerShownBefore = studentWorkflow[`proficiency_timer_shown_${student._id}`];
      if (timerShownBefore || this.state.timerShown) {
        return false;
      }
      return true;
    }
    return false;
  }

  progressMatrixViewed = () => {
    const { student, studentWorkflow } = this.props;
    const progressMatrixViewed = studentWorkflow[`proficiency_matrix_viewed_${student._id}`];
    return progressMatrixViewed;
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  showTimeline = (value) => {
    this.setState({ showTimeline: value });
  }

  render() {
    const { student } = this.props;
    this.setLocaleOfStudent(student);
    this.state.showTimer = this.shouldShowTimer();
    if (!this.state.activeTab) {
      this.state.activeTab = this.state.tabs[0].key;
    }
    if (!this.state.activePlaylist) {
      this.state.activePlaylist = this.state.defaultPlaylist;
    }
    let monthlyPerformance = 0;
    let monthlyProgress = 0;
    if (student.summary && student.summary.outstanding_rewardbalance) {
      monthlyPerformance = student.summary.outstanding_rewardbalance;
      if (monthlyPerformance > 0) {
        monthlyProgress = (monthlyPerformance * 100) / 7500;
      }
    }
    return (
      <div>
        <Dialog
          show={this.state.showDialog}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
        />
        <Tutorial
          show={this.state.showTutorial}
          onCloseTutorial={this.onCloseTutorial}
        />
        <StudentHeader studentLocale={config.locale} currentNavigation={features.WORKSHEET} showTimeline={this.showTimeline} />
        <StudentNav studentLocale={config.locale} currentSelectedFeature={features.WORKSHEET} />
        {
          !this.state.showTimeline ? <div className="a-appView a-appView--altBG a-appView--hasSidebar"> <ChooseUsername student={this.props.student} currentNavigation={features.WORKSHEET} showTimeline={this.showTimeline} /> </div> :
            <div className="a-appView a-appView--altBG a-appView--hasSidebar">
              {(this.state.showSessionsView) ?
                <div className="o-tabHeader__tabs o-tabHeader__tabs--modified o-tabHeader__tabs--modified-transparent">
                  <ul className="sessionTabs">
                    <li><span onClick={() => { this.setState({ currentView: 'worksheets' }); }} className={this.state.currentView === 'worksheets' ? 'activeSessionTab' : ''}>Worksheets</span></li>
                    <li><span onClick={() => { this.setState({ currentView: 'sessions' }); }} className={this.state.currentView !== 'worksheets' ? 'activeSessionTab' : ''}>Tutoring Sessions</span></li>
                  </ul>
                </div>
                : ''
              }
              {this.state.currentView === 'worksheets' ? <div className="a-appView__contents sessionTabs-blck-transparent sessionTabs-blck">
                <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
                  <LoadingSpinner />
                </div>
                {(!this.state.showSessionsView) ?
                  <h1 className="a-h(28)">
                    {student.first_name}&rsquo;s {Localization.localizedStringForKey('Worksheets')}
                  </h1> : ''
                }
                <div className="o-topicSelector">
                  <ul className="sessionTabsContentLnk">
                    {this.tabsForTimeline()}
                  </ul>
                </div>
                <div className="rewards" id="rewardSection">
                  <div id="clickBtn" onClick={this.slideIn.bind(this)} />
                  <div className="reward-section" id="rewardBlock">
                    <p className="title">Monthly Performance</p>
                    <p>{monthlyPerformance}<span> Points</span></p>
                    <progress value={`${monthlyProgress}`} max="100"></progress>
                  </div>
                </div>
                {this.showScheduleMessage() ? <div className="a-container a-container__intro b-section">

                  {config.isViaAfrika ?
                    <h2 className="a-h(28)">
                      {Localization.localizedStringForKey('Congratulations on completing the Diagnostic test')}
                    </h2>
                    :
                    <h2 className="a-h(28)">
                      {Localization.localizedStringForKey('Congratulations on Completing the Skills Assessment')}
                    </h2>
                  }
                  {this.state.showTimer ?
                    <div className="o-perfReport__sample">
                      <div className="o-perfReport__sampleMatrix">
                        &nbsp;
              </div>
                      <div className="o-perfReport__sampleInfo">
                        <p>
                          {Localization.localizedStringForKey('Your report is being generated. Please wait...')}
                        </p>
                        <ReactCountdownClock
                          seconds={60}
                          alpha={0.9}
                          size={56}
                          color="#fff"
                          onComplete={this.hideTimer}
                        />
                      </div>
                    </div>
                    : <a className="o-perfReport__sample" href={`/student/${student._id}/performance-report/${student.submissions[0]._id}`} target="_blank">
                      <div className="o-perfReport__sampleMatrix">
                        &nbsp;
              </div>
                      <div className="o-perfReport__sampleInfo">
                        <p>
                          {Localization.localizedStringForKey("Click here for a detailed report on your child's performance.")}
                        </p>
                      </div>
                    </a>}
                  {(!config.isViaAfrika && Common.authorized(student, features.ACADEMIC_ADVISOR_CTA)) ?
                    <div>
                      <h3 className="a-h(22) a-strong">
                        {Localization.localizedStringForKey('Your next step is to schedule a call with one of the academic advisors.')}
                      </h3>

                      <p className="b-section__actions b-section__actions--useFlex">
                        <a href="https://try.hellothinkster.com/thinkster-advisor-call/" className="b-button--large b-flatBtn b-flatBtn--gradient(active-1)" target="_blank">
                          <span className="b-button__label">
                            {Localization.localizedStringForKey('Schedule a call')}
                          </span>
                        </a>
                      </p>

                      <h3 className="a-h(22) a-strong a-break a-break--before">
                        {Localization.localizedStringForKey('What happens in this call')}
                      </h3>

                      <ul className="a-row">
                        <li className="a-col a-col(1-4) a-break a-break--after">
                          <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44)">
                            1
                  </p>
                          <p className="a-p(16)">
                            {Localization.localizedStringForKey('Discuss the results of the Skills Assessment.')}
                          </p>
                        </li>
                        <li className="a-col a-col(1-4) a-break a-break--after">
                          <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44) b-circleBox--bordered--color(active-2)">
                            2
                  </p>
                          <p className="a-p(16)">
                            {Localization.localizedStringForKey('Go over the features of our app to help your child get acclimated.')}
                          </p>
                        </li>
                        <li className="a-col a-col(1-4) a-break a-break--after">
                          <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44) b-circleBox--bordered--color(active-3)">
                            3
                  </p>
                          <p className="a-p(16)">
                            {Localization.localizedStringForKey('Learn about your child’s needs and help you select the right program.')}
                          </p>
                        </li>
                        <li className="a-col a-col(1-4) a-break a-break--after">
                          <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44) b-circleBox--bordered--color(active-4)">
                            4
                  </p>
                          <p className="a-p(16)">
                            {Localization.localizedStringForKey('Share best practices to achieve success with the program.')}
                          </p>
                        </li>
                      </ul>

                      <p className="a-p(16)">
                        {Localization.localizedStringForKey("The call will help us better understand your child's needs and goals so that we can pair your child with the right Thinkster coach. Our goal is to make sure you get a complete experience of Thinkster Math.")}
                      </p>
                    </div> : ''
                  }
                </div> : ''}
                {/*
          POST DT CONTENT END
        */}

                <div className="a-container a-container--full">
                  <div className="o-topicSelector">
                    <div className="o-topicSelector__tabs">
                      {this.playlistsView()}
                    </div>
                  </div>

                  <section className="a-row a-justifyContent(center)">
                    {this.nodesForTab(this.state.activeTab)}
                    {(this.state.showAssignmentTimer && !this.state.assignmentTimerShown) ?
                      <div className="o-perfReport__sampleInfo" >
                        <p style={{ 'line-height': '20px', textAlign: 'center' }}>
                          {Localization.localizedStringForKey('Checking for Assignments...')}
                        </p>
                        <ReactCountdownClock
                          seconds={15}
                          alpha={0.9}
                          size={56}
                          color="#fff"
                          onComplete={this.hideAssignmentTimer}
                        />
                      </div> : ''
                    }
                  </section>
                </div>
              </div> : <TutoringSessions />}
              <Footer />
            </div>
        }
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  student: state.student,
  studentWorkflow: state.studentWorkflow,
  loading: state.loading,
  submissions: state.submissions,
  tutoringSessions: state.tutoringSessions,
});

const actionCreators = {
  workflowCompleted,
  fetchStudent,
  studentFetched,
  fetchTutoringSessions,
};

export default connect(
  mapStateToProps,
  actionCreators
)(StudentTimeline);
