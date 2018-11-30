import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import firebase from 'firebase';
import moment from 'moment';
import browser from 'detect-browser';
import ProfileIcon from './Glyphs/ProfileIcon';
import AbacusIcon from './Glyphs/AbacusIcon';
import LeaderboardIcon from './Glyphs/LeaderboardIcon';
import ProgressIcon from './Glyphs/ProgressIcon';
import PlayerIcon from './Glyphs/PlayerIcon';
import Star from './Glyphs/Star';
import WhiteboardIcon from './Glyphs/Whiteboard';
import Support from './Glyphs/Support';
import AtomicOrbitals from './Glyphs/AtomicOrbitals';
import GlyphMenu from './Glyphs/GlyphMenu';
import * as Localization from '../Shared/Localization';
import * as Common from './Common';
import Dialog from '../Shared/Dialog';
import SupportDialog from '../Shared/SupportDialog';
import config from '../../constants/config';
import * as features from '../../constants/feature';
import * as SubscriptionState from '../../constants/subscriptionState';
import { logWhiteboardSession } from '../../actions/common';
import TutoringSessionFeedback from '../Shared/TutoringSessionFeedback';

class StudentNav extends Component {

  static propTypes = {
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    studentType: React.PropTypes.string,
    currentSelectedFeature: React.PropTypes.string,
    logWhiteboardSession: React.PropTypes.func,
    studentWorkflow: React.PropTypes.shape({}),
  }
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      dialogHTML: '',
      dialogMessage: '',
      dialogAcceptButtonLabel: undefined,
      dialogCancelButtonLabel: undefined,
      fbInitialized: false,
      showSupportDialog: false,
      showSubscriptionDialog: false,
      zoomMeeingURL: undefined,
      zoomMeeingID: undefined,
      showFeedback: false,
      teacherStarted: false,
      fbConfig: {
        apiKey: 'AIzaSyChnLLT--7OQMnPp8BxGsHl39oe9bvYLGU',
        authDomain: 'tabtor-live.firebaseapp.com',
        databaseURL: 'https://tabtor-live.firebaseio.com',
        projectId: 'tabtor-live',
        storageBucket: 'tabtor-live.appspot.com',
        messagingSenderId: '108838948357',
      },
      studentType: this.props.studentType || 'student',
    };
  }

  displayDialog() {
    const { student, user } = this.props;
    const state = Common.stateOfStudent(student, user).toLowerCase();
    if (state === SubscriptionState.ONHOLD || state === SubscriptionState.INACTIVE || state === SubscriptionState.CANCELED) {
      // show alert
      this.state.showDialog = true;
      if (state === SubscriptionState.ONHOLD) {
        this.state.dialogHTML =
          (<div>
            <h3 className="a-p(14)">
              <strong>Your account is on hold.</strong>
            </h3>
            <p className="a-p(14)">
              Your subscription is currently on hold. If you would like to restart your learning on Thinkster Math, please contact us at <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a>.
          </p>
          </div>);
      } else if (state === SubscriptionState.INACTIVE) {
        this.state.dialogHTML =
          (<div>
            <h3 className="a-p(14)">
              <strong>Your account is inactive.</strong>
            </h3>
            <p className="a-p(14)">
              Your subscription is currently inactive. If you would like to restart your learning on Thinkster Math, please contact us at <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a>.
          </p>
          </div>);
      } else if (state === SubscriptionState.CANCELED) {
        this.state.dialogHTML =
          (<div>
            <h3 className="a-p(14)">
              <strong>Your account has been canceled.</strong>
            </h3>
            <p className="a-p(14)">
              Your subscription is currently canceled. If you would like to restart your learning on Thinkster Math, please contact us at <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a>.
          </p>
          </div>);
      }
      this.state.dialogId = 100;
    }
  }
  onJoinWhiteboardSession = (zoomMeeingURL) => {
    window.open(zoomMeeingURL, '_blank');
    this.setState({ teacherStarted: true });
  }
  onWhiteboard = () => {
    const { student, studentWorkflow } = this.props;
    const wbSessionInProgress = studentWorkflow[`wb_session_${student._id}`];
    if (student && student._id && ENV.showWhiteboard && !wbSessionInProgress) {
      if (!this.state.fbInitialized) {
        this.initializeFB();
      }
      const database = firebase.database().ref();
      const whiteboardingSessionRef = database.child('whiteboarding_sessions');
      const whiteboardingSessionStudentRef = whiteboardingSessionRef.child(student._id);
      whiteboardingSessionStudentRef.once('value', this.onWhiteboardSessionResponse);
    }
  }

  onWhiteboardSessionResponse = (childSnapshot) => {
    const { student } = this.props;
    let meta = childSnapshot.val();
    const wbSession = {};
    console.log(meta);
    wbSession.user_app_version = `StudentWebApp/${config.appversion}`;
    if (meta && !meta.state) {
      meta = meta.session_meta;
    }
    if (meta && meta.state && meta.state === 'teacher_started') {
      this.state.zoomMeeingURL = meta.zoom_meeting_url;
      this.setState({
        showDialog: true,
        dialogMessage: 'Your Coaching Session has started. Would you like to join the session now?',
        dialogAcceptButtonLabel: 'Join Session',
        dialogCancelButtonLabel: 'Cancel',
        dialogId: 101,
      });
      // log WB Session
      wbSession.profile_id = student._id;
      wbSession.user_join_date = moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]');
      wbSession.state = 'student_alert_seen';
      wbSession.teacher_id = meta.teacher_id;
      wbSession.zoom_meeting_id = meta.zoom_meeting_id;
      wbSession.zoom_meeting_url = meta.zoom_meeting_url;
    } else {
      this.setState({
        showDialog: true,
        dialogMessage: 'Your coach has not started the meeting yet. Please wait till the coach starts meeting.',
      });
      // log WB Session
      wbSession.profile_id = student._id;
      wbSession.user_join_date = moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]');
      wbSession.state = 'teacher_not_started';
    }
    wbSession.meta = meta;
    this.props.logWhiteboardSession({ studentId: student._id, wbSession: wbSession });
  }

  onWhiteboardSessionStart = (childSnapshot) => {
    const { student } = this.props;
    let meta = childSnapshot.val();
    if (meta && !meta.state) {
      meta = meta.session_meta;
    }
    if (meta && meta.state && meta.state === 'teacher_started') {
      this.state.zoomMeeingURL = meta.zoom_meeting_url;
      this.setState({
        showDialog: true,
        dialogMessage: 'Your Coaching Session has started. Would you like to join the session now?',
        dialogAcceptButtonLabel: 'Join Session',
        dialogCancelButtonLabel: 'Cancel',
        dialogId: 101,
        zoomMeeingID: meta.zoom_meeting_id,
      });
      const wbSession = {};
      wbSession.user_app_version = `StudentWebApp/${config.appversion}`;
      wbSession.profile_id = student._id;
      wbSession.user_join_date = moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]');
      wbSession.state = 'student_alert_seen';
      wbSession.teacher_id = meta.teacher_id;
      wbSession.zoom_meeting_id = meta.zoom_meeting_id;
      wbSession.zoom_meeting_url = meta.zoom_meeting_url;
      wbSession.meta = meta;
      this.props.logWhiteboardSession({ studentId: student._id, wbSession: wbSession });
    } else if (meta && meta.state && meta.state === 'teacher_closed') {
      if (this.state.teacherStarted) {
        this.onCloseMeeting();
      }
    }
  }

  onSupport = () => {
    dataLayer.push({
      uid: this.props.student._id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'swaShowSupport',
    });
    this.setState({ showSupportDialog: true });
  }

  onSupportDialogClose = () => {
    this.setState({ showSupportDialog: false, dialogMessage: '' });
  }

  onSupportDialogSubmit = (success) => {
    this.setState({ showSupportDialog: false, dialogMessage: '' });
    if (success) {
      this.setState({ showDialog: true, dialogMessage: 'Your query has been successfully submitted.' });
    } else {
      this.setState({ showDialog: true, dialogMessage: 'Error in sending the query. Please try later.' });
    }
  }

  onFeedback = (isShow) => {
    this.setState({ showFeedback: isShow })
  }

  onAcceptDialog = () => {
    if (this.state.dialogId === 100) {
      browserHistory.push('/students');
    } else if (this.state.dialogId === 101) {
      this.onJoinWhiteboardSession(this.state.zoomMeeingURL);
    }
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '', dialogAcceptButtonLabel: undefined, dialogCancelButtonLabel: undefined });
  }

  onCancelDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '', dialogAcceptButtonLabel: undefined, dialogCancelButtonLabel: undefined });
  }

  onOptionClick = (option) => {
    const { student } = this.props;
    if (Common.authorized(student, option)) {
      let link;

      switch (option) {
        case features.STUDENT:
          link = '/students';
          break;
        case features.WORKSHEET:
          link = `/student/${student._id}`;
          break;
        case features.LEADERBOARD:
          link = `/student/${student._id}/leaderboard`;
          break;
        case features.REWARD:
          link = `/student/${student._id}/rewards`;
          break;
        case features.MASTERY_MATRIX:
          link = `/student/${student._id}/progress-matrix`;
          break;
        case features.VIDEO_LIBRARY:
          link = `/student/${student._id}/video-library`;
          //link = `/student/${student._id}/navigate/Videos`;
          break;
        case features.CURRICULUM:
          link = `/student/${student._id}/navigate/Curriculum`;
          break;
        case features.MORE:
          link = `/student/${student._id}/mobile-nav`;
          break;
        default:
          link = '';
      }
      if (link !== '') {
        browserHistory.push(link);
      } else {
        if (option === features.WHITEBOARD) {
          this.onWhiteboard();
        } else if (option === features.SUPPORT) {
          this.onSupport();
        }
      }
    } else {
      // show unauthorized message
      this.setState({
        showDialog: true,
        dialogMessage: 'Your current plan is not eligible for this feature. Please upgrade to Personalized Tutor-Led Program to use this feature.',
      });
    }
  }

  getClassName(feature) {
    const { student } = this.props;
    const { currentSelectedFeature } = this.props;
    if (!Common.authorized(student, feature)) {
      return 'o-sideBarNav__link o-sideBarNav__link--inactive';
    } else if (currentSelectedFeature === feature) {
      return 'o-sideBarNav__link o-sideBarNav__link--active';
    }
    return 'o-sideBarNav__link';
  }

  supportTicketForOption = (option) => {
    const { student, user } = this.props;
    const ticket = {};
    // Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
    ticket.body = `Profile ID: ${student._id}
            Profile Name: ${student.first_name} ${student.last_name || ''}
            Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
            User ID: ${user._id}
            App Version: StudentWebApp/${config.appversion}
            Browser: ${browser.name} ${browser.version}
            Date: ${moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]')}`;
    if (option === 1) {
      ticket.subject = `User feedback for Teacher from ${user.first_name} ${user.last_name}`;
    } else {
      ticket.subject = `User feedback on Thinkster Math from ${user.first_name} ${user.last_name}`;
    }
    ticket.name = `${user.first_name} ${user.last_name}`;
    ticket.email = user.email_address;
    return ticket;
  }

  onCloseMeeting = () => {
    this.setState({
      showFeedback: true,
      showDialog: false,
      teacherStarted: false
    });
  }

  initializeFB = () => {
    const { student, studentWorkflow } = this.props;
    const wbSessionInProgress = studentWorkflow[`wb_session_${student._id}`];
    if (student && student._id && !this.state.fbInitialized && firebase.apps.length === 0 && ENV.showWhiteboard && !wbSessionInProgress) {
      firebase.initializeApp(this.state.fbConfig);
      const database = firebase.database().ref();
      const whiteboardingSessionRef = database.child('whiteboarding_sessions');
      const whiteboardingSessionStudentRef = whiteboardingSessionRef.child(student._id);
      whiteboardingSessionStudentRef.on('child_added', this.onWhiteboardSessionStart);
      whiteboardingSessionStudentRef.on('child_changed', this.onWhiteboardSessionStart);
      this.state.fbInitialized = true;
    }
  }



  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  render() {
    const { student } = this.props;
    this.displayDialog();
    if (!this.state.fbInitialized && ENV.showWhiteboard) {
      this.initializeFB();
    }
    let homeOptionLabel = 'Students';
    if (Common.isPurchaseOfTypeProduct(student)) {
      homeOptionLabel = 'Home';
    }
    return (
      <div className="o-sideBar">
        <Dialog
          show={this.state.showDialog}
          onAccept={this.onAcceptDialog}
          onCancel={this.onCancelDialog}
          htmlBody={this.state.dialogHTML}
          message={this.state.dialogMessage}
          acceptButtonLabel={this.state.dialogAcceptButtonLabel || undefined}
          cancelButtonLabel={this.state.dialogCancelButtonLabel || undefined}
        />

        {this.state.showFeedback ? <TutoringSessionFeedback onClose={this.onFeedback} show={this.state.showFeedback} meetingID={this.state.zoomMeeingID}/> : ''}
        <SupportDialog
          show={this.state.showSupportDialog}
          onClose={this.onSupportDialogClose}
          onSubmit={this.onSupportDialogSubmit}
          getSupportTicket={this.supportTicketForOption}
        />
        <nav className="o-sideBarNav">
          <ul className="o-sideBarNav__items">
            <li className="o-sideBarNav__itemStudents">
              <button type="button" className="o-sideBarNav__link" onClick={this.onOptionClick.bind(this, features.STUDENT)}>
                <ProfileIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey(homeOptionLabel)}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemWorksheet">
              <button type="button" className={this.getClassName(features.WORKSHEET)} onClick={this.onOptionClick.bind(this, features.WORKSHEET)}>
                <AbacusIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Dashboard')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemLeaderboard">
              <button type="button" className={this.getClassName(features.LEADERBOARD)} onClick={this.onOptionClick.bind(this, features.LEADERBOARD)}>
                <LeaderboardIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Leaderboard')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemProgress">
              <button type="button" className={this.getClassName(features.MASTERY_MATRIX)} onClick={this.onOptionClick.bind(this, features.MASTERY_MATRIX)}>
                <ProgressIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Progress')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemVideo">
              <button type="button" className={this.getClassName(features.VIDEO_LIBRARY)} onClick={this.onOptionClick.bind(this, features.VIDEO_LIBRARY)}>
                <PlayerIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Video Library')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemCurriculum">
              <button type="button" className={this.isGuestFlow() ? this.getClassName(features.CURRICULUM) : 'o-sideBarNav__link o-sideBarNav__link--hide'} onClick={this.onOptionClick.bind(this, features.CURRICULUM)}>
                <AtomicOrbitals />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Curriculum')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemRewards">
              <button type="button" className={this.getClassName(features.REWARD)} onClick={this.onOptionClick.bind(this, features.REWARD)}>
                <Star />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Rewards')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemWhiteboard">
              <button type="button" className={ENV.showWhiteboard ? this.getClassName(features.WHITEBOARD) : 'o-sideBarNav__link o-sideBarNav__link--hide'} onClick={this.onOptionClick.bind(this, features.WHITEBOARD)}>
                <WhiteboardIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Whiteboard')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemSupport">
              <button type="button" className={this.isGuestFlow() ? 'b-button--fullWidth o-sideBarNav__link--hide' : 'o-sideBarNav__link o-sideBarNav__link'} onClick={this.onOptionClick.bind(this, features.SUPPORT)}>
                <Support />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Support')}
                </span>
              </button>
            </li>
            <li className="o-sideBarNav__itemMore">
              <button type="button" className="b-button--fullWidth o-sideBarNav__link" onClick={this.onOptionClick.bind(this, features.MORE)}>
                <GlyphMenu />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('More')}
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  user: state.user,
  studentWorkflow: state.studentWorkflow,
});

const actionCreators = {
  logWhiteboardSession,
};


export default connect(
  mapStateToProps,
  actionCreators,
)(StudentNav);
