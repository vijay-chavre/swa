import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import ip from 'ip';
import browser from 'detect-browser';
import { browserHistory } from 'react-router';
import _ from 'lodash';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import WorksheetHeader from './WorksheetHeader';
import WorksheetPageHeader from './WorksheetPageHeader';
import WorksheetTools from './WorksheetTools';
import WorksheetAids from './WorksheetAids';
import ScribbleLayer from '../ScribbleLayer';
import Dialog from '../Shared/Dialog';
import SupportDialog from '../Shared/SupportDialog';
import FlagDialog from '../Shared/FlagDialog';
import calculateRewardPoint from '../lib/RewardPointCalculator';
import VideoModal from '../Shared/VideoModal';
import VideoPlaylist from '../Shared/VideoPlaylist';
import ProgressLoader from '../PerformanceReport/ProgressLoader';
import Footer from '../Footer';
// import Checkmark from '../Shared/Glyphs/Checkmark';
// import Close from '../Shared/Glyphs/Close';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import { studentFetched } from '../../actions/student';
import { fetchSubmission, submissionFetched, submitWorksheet } from '../../actions/submission';
import * as Event from '../../constants/event';
import { createPolaEvent, createTrackingEvent } from '../../actions/event';
import * as features from '../../constants/feature';
import * as VideoActions from '../../actions/video';

const uuidv1 = require('uuid/v1');

class Worksheet extends Component {
  static propTypes = {
    // Events Props - Change to Generic Pattern
    createPolaEvent: React.PropTypes.func,
    createTrackingEvent: React.PropTypes.func,
    // Regular Props
    fetchSubmission: React.PropTypes.func,
    submissionFetched: React.PropTypes.func,
    submitWorksheet: React.PropTypes.func,
    studentFetched: React.PropTypes.func,
    session: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    submissions: React.PropTypes.shape({
    }),
    params: React.PropTypes.shape({
      studentId: React.PropTypes.string,
      assignmentId: React.PropTypes.string,
      activityState: React.PropTypes.string,
      questionNumber: React.PropTypes.string,
    }),
    studentWorkflow: React.PropTypes.shape({
    }),
    video: React.PropTypes.shape({
      video_feedback: React.PropTypes.shape,
    }),
  }

  static getLearnosityRequest(activityId, assignmentId, studentId, activityState = 'initial', autoSaveActivity, organisationId = undefined) {
    return {
      config: {
        time: {
          show_pause: false,
          show_time: false,
        },
        configuration: {
          lazyload: true,
        },
        navigation: {
          scroll_to_top: false,
          scroll_to_test: false,
          show_intro: false,
          show_outro: false,
          show_next: false,
          show_prev: false,
          show_accessibility: {
            show_colourscheme: false,
            show_fontsize: false,
            show_zoom: false,
          },
          show_fullscreencontrol: false,
          show_progress: false,
          show_submit: false,
          show_title: false,
          show_save: false,
          show_calculator: false,
          show_itemcount: false,
          skip_submit_confirmation: false,
          toc: false,
          transition: 'slide',
          transition_speed: 400,
          warning_on_change: false,
          scrolling_indicator: false,
          show_answermasking: false,
          exit_securebrowser: false,
          auto_save: autoSaveActivity,
        },
        ignore_question_attributes: [
          'instant_feedback',
        ],
      },
      activity_id: activityId,
      activity_template_id: activityId,
      session_id: assignmentId,
      name: 'Thinkster Math',
      user_id: studentId,
      rendering_type: 'assess',
      state: activityState,
      type: 'submit_practice',
      organisation_id: organisationId,
    };
  }

  constructor(props) {
    super(props);
    const { student, user } = this.props;
    this.state = {
      questionLayer: null,
      showScribble: false,
      showErase: true,
      showClearAll: true,
      isEraseOn: false,
      canDraw: false,
      clearAllScribble: false,
      currentItem: 0,
      itemsCount: 0,
      showDialog: false,
      showSupportDialog: false,
      dialogMessage: '',
      dialogId: '',
      dialogNoButton: false,
      cancelButtonLabel: undefined,
      acceptButtonLabel: undefined,
      timeTaken: 0,
      worksheetId: '',
      worksheetType: '',
      activityId: '',
      worksheetMeta: undefined,
      assignment_details: undefined,
      playlist: 'default',
      maxAttempts: 2,
      studentId: props.params.studentId,
      assignmentId: props.params.assignmentId,
      defaultQuestionNumber: props.params.questionNumber || undefined,
      showSubmit: true,
      showAudioNotes: false,
      isReviewMode: false,
      correctCount: 0,
      inCorrectCount: 0,
      skippedCount: 0,
      secondAttemptCount: 0,
      rewardPoints: undefined,
      isSkillsAssessment: false,
      testStartAlertShown: false,
      showVideo: false,
      showVideoPlaylist: false,
      videoId: undefined,
      showSubmissionLoader: false,
      showFlagDialog: false,
      readOutTexts: [],
      flagComment: '',
      flagOptionNumber: 0,
      correctAnimationMessage: ['Correct!', "That's right!", 'Awesome!', 'Super!', 'Cool!', 'Terrific!'],
      activityLoading: false,
      inputBoxIndex: 0,
      isProductWorksheet: false,
      organisationId: undefined,
      showVideoHint: false,
      isPracticeWorksheet: false,
      scoreResponse:undefined
    };


    if (props.params.activityState === 'review') {
      this.state.isReviewMode = true;
    }
    // set the assignment details
    if (student) {
      if (this.state.isReviewMode) {
        // check details in submissions
        if (student.submissions) {
          student.submissions.map((submission) => {
            if (submission._id === this.state.assignmentId) {
              this.state.worksheetId = submission.worksheet_id;
              this.state.activityId = submission.worksheet_meta.learnosity_activity_id;
              this.state.worksheetMeta = submission.worksheet_meta;
            }
          });
        }
      } else if (student.playlists) {
        // check details in assignments.
        this.initializeAudeoPlayers();
        student.playlists.map((playlist) => playlist.worksheets.map((assignment) => {
          if (assignment.id === this.state.assignmentId) {
            this.state.worksheetId = assignment.worksheet_id;
            this.state.activityId = assignment.meta.learnosity_activity_id;
            if (assignment.meta.organisation_id) {
              this.state.organisationId = assignment.meta.organisation_id;
            } else {
              this.state.organisationId = undefined;
            }

            this.state.worksheetMeta = assignment.meta;
            this.state.assignment_details = assignment;
            this.state.playlist = assignment.playlist_id;
          }
        }));
      }
      if (Common.isPurchaseOfTypeProduct(student)) {
        this.state.isProductWorksheet = true;
      }
    }

    if (this.state.isReviewMode) {
      this.state.showSubmit = false;
      this.state.showErase = false;
      this.state.showClearAll = false;
      // TODO: fetch only when teacaher feedback is given
      // if (this.state.activityState === 'review' && !props.submissions[this.state.assignmentId]) {
      props.fetchSubmission({ studentId: this.state.studentId, submissionId: this.state.assignmentId });
    } else {
      this.state.canDraw = true;
      if (this.state.worksheetMeta && this.state.worksheetMeta.type) {
        const worksheetType = this.state.worksheetMeta.type.toLowerCase();
        if (worksheetType === 'test' && this.state.worksheetId && this.state.worksheetId.toLowerCase().includes('dt')) {
          this.state.maxAttempts = 1; // skills assessment flow
          this.state.isSkillsAssessment = true;
        } else if (worksheetType === 'test' || worksheetType === 'challenge') {
          this.state.maxAttempts = -1; // test flow
        } else {
          this.state.isPracticeWorksheet = true;
        }
      }
      if (this.state.maxAttempts !== -1) { // check for take it as test
        if (this.state.assignment_details && this.state.assignment_details.type) {
          const assignmentType = this.state.assignment_details.type.toLowerCase();
          if (assignmentType === 'test') {
            this.state.maxAttempts = -1; // test flow
          }
        }
      }
    }
  }

  componentDidMount() {
    Raven.setUserContext({ id: this.state.studentId });
    // double checking the status from the assignments // to avoid conflict on manual refresh
    let latestActivityState = this.props.params.activityState;
    if (this.props.params.activityState !== 'review' && this.state.assignment_details) {
      if (this.state.assignment_details.state !== latestActivityState) {
        latestActivityState = this.state.assignment_details.state;
      }
    }
    const request = Worksheet.getLearnosityRequest(
      this.state.activityId,
      this.state.assignmentId,
      this.state.studentId,
      latestActivityState,
      false,
      this.state.organisationId
    );
    this.initLearnosityItems(request).then((response) => {
      const security = response.data;
      this.itemsApp = LearnosityItems.init({
        security,
        request,
      }, {
          readyListener: this.onItemsReady,
          errorListener: (err) => {
            if (err && err.code === 10002) { // existing response found redirecting back to timeline
              // this.setState({ activityLoading: false, showDialog: true, dialogMessage: 'Error occured in loading the worksheet. Please try loading it again. Incase issue continues please contact support.', dialogId: '106', acceptButtonLabel: 'OK' });
              browserHistory.push(`/student/${this.state.studentId}`);
            }
          },
        });
    });
    window.Intercom('shutdown');
  }

  componentWillUnmount() {
    if (this.itemsApp) {
      try {
        this.saveLearnosityActivity();
        this.itemsApp.reset();
      } catch (e) {
        Raven.captureException(e, { itemsApp: this.itemsApp });
      }
    }
    this.stopReadOut();
  }

  onLastQuestionAttempt = () => {
    if (this.isGuestFlow()) {
      this.setState({ showDialog: true, dialogMessage: 'You have not attempted some questions.', dialogId: '105', acceptButtonLabel: 'Continue' });
    } else {
      this.setState({ showDialog: true, dialogMessage: 'You have not attempted some questions.', dialogId: '102', acceptButtonLabel: 'Submit as is', cancelButtonLabel: 'Continue' });
    }
  }

  onSubmitWorksheetWithSkip = () => {
    this.submission.answers.Questions[this.state.currentItem].FlagSkipMode = 2;
    this.submitToLearnosity();
  }
  onAcceptDialog = () => {
    if (this.state.dialogId === '100' || this.state.dialogId === '102') {
      this.submitToLearnosity();
    } else if (this.state.dialogId === '101') {
      this.clearAllScribble();
      this.state.isGarbageOn = false;
    } else if (this.state.dialogId === '103') {
      this.saveScribble();
      this.itemsApp.items().next();
      let eventProps = { sample_submit_date: moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]') };
      this.props.createTrackingEvent({
        id: this.state.studentId,
        type: Event.TRACKING_SAMPLE_SUBMIT,
        properties: eventProps,
      });
      setTimeout(() => {
        eventProps = { dt_start_date: moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]') };
        this.props.createTrackingEvent({
          id: this.state.studentId,
          type: Event.TRACKING_DT_START,
          properties: eventProps,
        });
      }, 1000);
    } else if (this.state.dialogId === '104') {
      setTimeout(() => {
        browserHistory.push(`/student/${this.state.studentId}`);
      }, 500);
    }
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '', acceptButtonLabel: undefined, cancelButtonLabel: undefined, dialogNoButton: false });
    this.state.inputBoxIndex = 0;
    this.makeAnswerBoxActive();
  }

  onCancelDialog = () => {
    if (this.state.dialogId === '101') {
      this.state.isGarbageOn = false;
    } else if (this.state.dialogId === '102') {
      if (this.submission && this.submission.answers && this.submission.answers.Questions) {
        // go to first skipped question
        for (const q of this.submission.answers.Questions) {
          if (q.Skipped === 'Y') {
            this.onSelectQuestion(this.submission.answers.Questions.indexOf(q) + 1);
            break;
          }
        }
      }
    } else if (this.state.dialogId === '106') {
      this.onNext();
    }
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '', acceptButtonLabel: undefined, cancelButtonLabel: undefined, dialogNoButton: false });
  }

  onSelectQuestion = (questionNumber) => {
    this.saveScribble();
    setTimeout(() => {
      this.itemsApp.items().goto(questionNumber - 1);
    }, 500);
  }

  onItemLoad = () => {
    const currentItemPosition = this.itemsApp.assessApp().getItemPosition(this.itemsApp.getCurrentItem().reference);
    this.state.currentItem = currentItemPosition;
    this.disableItemIfAlreadyAttempted();
    window.scrollTo(0, 0);
    this.stopReadOut();
    if (this.state.showVideoHint) {
      this.setState({ showVideoHint: false });
    }

    dataLayer.push({
      uid: this.state.studentId, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'viewContent',
      contentType: 'Worksheet Step',
      worksheetType: this.state.assignment_details && this.state.assignment_details.meta ? this.state.assignment_details.meta.type : '',
      contentId: this.state.worksheetId, // i.e. DT140
      stepNumber: this.state.currentItem + 1, // Step #3 for this assessment. As string.
      timer: this.state.timeTaken, // Number of seconds on the timer. 12:15 = 735. As number.
    });

    Raven.captureBreadcrumb({
      message: 'Worksheet Step',
      category: 'attempt',
      data: {
        studentId: this.state.studentId,
        worksheetType: this.state.assignment_details && this.state.assignment_details.meta ? this.state.assignment_details.meta.type : '',
        contentId: this.state.worksheetId, // i.e. DT140
        stepNumber: this.state.currentItem + 1, // Step #3 for this assessment. As string.
        timer: this.state.timeTaken, // Number of seconds on the timer. 12:15 = 735. As number.
      },
    });


    // Fire Event
    if (!this.state.isReviewMode) {
      this.makeAnswerBoxActive();
      this.props.createPolaEvent({
        source: 'onItemLoad',
        studentId: this.state.studentId,
        submissionId: this.state.assignmentId,
        questionNumber: this.state.currentItem + 1,
        eventType: Event.POLA_QUESTION_START,
      });
      this.saveLearnosityActivity();
    }
  }

  onTimeChange = () => {
    this.setState({ timeTaken: this.itemsApp.assessApp().getTime() });
  }

  onItemsReady = () => {
    this.itemsApp.on('item:load', this.onItemLoad);
    this.setState({ activityLoading: false });
    if (this.state.isReviewMode) {
      this.state.timeTaken = this.submission.time_taken;
      this.setState({ showScribble: true });
      if (this.state.defaultQuestionNumber) {
        this.onSelectQuestion(this.state.defaultQuestionNumber);
      }
    } else {
      // if it is a skills assessment & activityState = 'initial' raise sample start event
      if (this.state.isSkillsAssessment && this.props.params.activityState === 'initial') {
        const eventProps = { sample_start_date: moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]') };
        this.props.createTrackingEvent({
          id: this.state.studentId,
          type: Event.TRACKING_SAMPLE_START,
          properties: eventProps,
        });
      }
      this.itemsApp.on('time:change', this.onTimeChange);
      this.makeAnswerBoxActive();
    }
    this.setState({ itemsCount: Object.keys(this.itemsApp.getItems()).length }, () => {
      if (this.submission === undefined && !this.state.isReviewMode) {
        // checking if learnosity response has any data..
        const items = this.itemsApp.getItems();
        const itemsMetaData = [];
        Object.keys(items).map((key) => {
          const item = items[key];
          const currentQuestionResponseID = item.response_ids[0];
          const learnosityQuestion = this.itemsApp.question(currentQuestionResponseID);
          if (learnosityQuestion) {
            let itemMetadata = learnosityQuestion.response.getMetadata();
            if (!itemMetadata) {
              itemMetadata = {};
            }
            itemsMetaData.push(itemMetadata);
            // const currentItemPosition = this.itemsApp.assessApp().getItemPosition(key);
          }
        });

        this.initSubmission(this.state.assignmentId, this.state.itemsCount, itemsMetaData);
        // Fire Event
        this.props.createPolaEvent({
          source: 'onItemsReady',
          studentId: this.state.studentId,
          submissionId: this.state.assignmentId,
          questionNumber: this.state.currentItem + 1,
          eventType: Event.POLA_QUESTION_START,
        });
        dataLayer.push({
          uid: this.state.studentId, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
          event: 'viewContent',
          contentType: 'Worksheet Step',
          worksheetType: this.state.assignment_details && this.state.assignment_details.meta ? this.state.assignment_details.meta.type : '',
          contentId: this.state.worksheetId, // i.e. DT140
          stepNumber: this.state.currentItem + 1, // Step #3 for this assessment. As string.
          timer: this.state.timeTaken, // Number of seconds on the timer. 12:15 = 735. As number.
        });
      }
      this.refreshCorrectInCorrectCount();
    });
    const currentItemPosition = this.itemsApp.assessApp().getItemPosition(this.itemsApp.getCurrentItem().reference);
    if (this.isReadOutEnabled()) {
      const readOutTexts = this.initializeReadOutTextForQuestions();
      this.setState({ currentItem: currentItemPosition, readOutTexts });
    } else {
      this.setState({ currentItem: currentItemPosition });
    }
    this.disableItemIfAlreadyAttempted();
  }

  onSendEmail = (isTechnicalSupport) => {
    if (isTechnicalSupport) {
      this.setState({
        dialogMessage: Localization.localizedStringForKey('Contact Technical Support'),
      });
    } else {
      this.setState({ dialogMessage: Localization.localizedStringForKey('Ask a Question to my Coach') });
    }
  }
  onSubmit = () => {
    this.saveLearnosityActivity();
    if (this.validateAndProcessCurrentItem()) {
      if (this.allQuestionsAttempted()) {
        if (this.isGuestFlow()) {
          setTimeout(this.showGuestSubmissionAlert, 1600);
        } else {
          setTimeout(this.showSubmissionAlert, 1600);
        }
      } else if (this.state.maxAttempts === -1) {
        setTimeout(this.onNext, 100); // test flow
      } else {
        setTimeout(this.onNext, 1600);
      }
    }
  }

  onPrevious = () => {
    if (this.state.currentItem > 0) {
      this.saveScribble();
      this.itemsApp.items().previous();
    }
  }

  onNext = () => {
    if (this.state.currentItem < this.state.itemsCount - 1) {
      if (this.state.currentItem === 4 && this.state.isSkillsAssessment && !this.state.testStartAlertShown && !this.state.isReviewMode && !config.isViaAfrika && this.state.worksheetMeta.worksheet_number.toLowerCase().endsWith('40')) {
        this.showTestStartAlert();
        this.state.testStartAlertShown = true;
      } else {
        this.saveScribble();
        this.itemsApp.items().next();
      }
    } else if (!this.state.isReviewMode) {
      this.onLastQuestionAttempt();
    }
  }
  onLearnositySubmitResponse(response) {
    if (response.success) {
      this.handleAdaptiveProgression();
      this.addVideoWatchedInfoToSubmission();
      this.props.submitWorksheet({ studentId: this.state.studentId, submission: this.submission });
      // updating submission in local data so that its reflected immediately in timeline. It will get removed once the API fetched it from DB
      this.addSubmissionLocally();
      this.setState({ showSubmissionLoader: true });

      // sending DT submit event
      if (this.state.isSkillsAssessment) {
        const eventProps = { dt_submit_date: moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]') };
        this.props.createTrackingEvent({
          id: this.state.studentId,
          type: Event.TRACKING_DT_SUBMIT,
          properties: eventProps,
        });
        setTimeout(() => {
          browserHistory.push(`/student/${this.state.studentId}`);
        }, 7000);
      } else {
        setTimeout(() => {
          browserHistory.push(`/student/${this.state.studentId}/${this.state.assignmentId}/summary`);
        }, 7000);
      }
    } else {
      this.setState({ showDialog: true, dialogMessage: 'Error in submitting worksheet.' });
    }
  }

  onVideo = (videoId) => {
    this.pauseWorksheetAttempt();
    this.setState({ showVideo: true, showVideoPlaylist: false, showVideoHint: false, videoId });
  }

  onVideoPlayList = () => {
    this.pauseWorksheetAttempt();
    this.stopReadOut();
    this.setState({ showVideoPlaylist: true, showVideoHint: false });
  }

  onSupport = () => {
    this.stopReadOut();
    this.setState({ showSupportDialog: true, showVideoHint: false });
    this.pauseWorksheetAttempt();
    dataLayer.push({
      event: 'contentInteraction',
      eventName: 'Contact Support',
      timer: this.state.timeTaken,
    });
  }
  onCloseVideo = () => {
    this.resumeWorksheetAttempt();
    this.setState({ showVideoPlaylist: true, showVideo: false, videoId: undefined });
  }
  onCloseVideoPlayList = () => {
    this.resumeWorksheetAttempt();
    this.setState({ showVideoPlaylist: false });
  }

  onSupportDialogClose = () => {
    this.resumeWorksheetAttempt();
    this.setState({ showSupportDialog: false, dialogMessage: '' });
  }

  onSupportDialogSubmit = (success) => {
    this.resumeWorksheetAttempt();
    this.setState({ showSupportDialog: false, dialogMessage: '' });
    if (success) {
      this.setState({ showDialog: true, dialogMessage: 'Your query has been successfully submitted.' });
    } else {
      this.setState({ showDialog: true, dialogMessage: 'Error in sending the query. Please try later.' });
    }
  }

  onToggleScribble = () => {
    if (this.state.isEraseOn) {
      this.setState({ isEraseOn: false });
      return;
    }

    dataLayer.push({
      event: 'contentInteraction',
      eventName: 'Toggle Scribbles Mode',
      timer: this.state.timeTaken,
    });

    this.setState({ showScribble: !this.state.showScribble }, () => {
      this.makeAnswerBoxActive();
    });
  }

  onToggleErase = () => {
    if (!this.state.isEraseOn) {
      this.setState({ isEraseOn: true, showScribble: true });
    } else {
      this.setState({ isEraseOn: false });
    }
    
    dataLayer.push({
      event: 'contentInteraction',
      eventName: 'Toggle Eraser Mode',
      timer: this.state.timeTaken,
    });
  }

  onToggleGarbage = () => {
    if (!this.state.isReviewMode) {
      this.setState({ showDialog: true, isGarbageOn: true, dialogMessage: 'Clear all scribbles?', dialogId: '101', cancelButtonLabel: 'Cancel' });
    }
    dataLayer.push({
      event: 'contentInteraction',
      eventName: 'Clear All Scribbles',
      timer: this.state.timeTaken,
    });
  }
  onScribbleDrawn = () => {
    if (this.state.clearAllScribble) {
      this.state.clearAllScribble = false;
    }
  }

  onLearnosityActivitySaveSuccess = () => {
    const { student } = this.props;
    if (this.props.params.activityState === 'initial') {
      if (student.playlists) {
        // check details in assignments.
        student.playlists.map((playlist) => playlist.worksheets.map((assignment) => {
          if (assignment.id === this.state.assignmentId) {
            assignment.state = 'resume';
            this.props.params.activityState = 'resume'; // TODO: check the impact of this statement
          }
        }));
      }
      this.props.studentFetched(student);
    }
  }
  onLearnosityActivitySaveError = (e) => {
    console.log(e); // this is required to understand errors in learnosity
  }

  initializeReadOutTextForQuestions = () => {
    const items = this.itemsApp.getItems();
    const readOutTexts = [];
    let count = 1;
    Object.keys(items).map((key) => {
      const item = items[key];
      const responseID = item.response_ids[0];
      const learnosityQuestion = this.itemsApp.question(responseID).getQuestion();

      if (learnosityQuestion) {
        const htmlDiv = document.createElement('div');
        let readOutText = '';
        if (learnosityQuestion.stimulus && learnosityQuestion.stimulus !== '') {
          let stimulus = learnosityQuestion.stimulus;
          if (stimulus.includes('</p><')) { // check for multiple paragraphs in Stimulus to have proper pause while readout
            stimulus = stimulus.replace(/<\/p></g, ',</p><');
          }
          htmlDiv.innerHTML = stimulus;
        }
        let questionStimulus = htmlDiv.textContent || htmlDiv.innerText;
        if (questionStimulus.toLowerCase().includes('select the number word for the number')) {
          questionStimulus = 'Select the number word for the number,';
        } else if (questionStimulus.toLowerCase().includes('enter the number for the given number word,')) {
          questionStimulus = 'Enter the number for the given number word';
        }
        let questionTemplate = '';
        if (learnosityQuestion.template && learnosityQuestion.template !== '') {
          htmlDiv.innerHTML = learnosityQuestion.template;
          questionTemplate = htmlDiv.textContent || htmlDiv.innerText;
        }
        // check for MCQ Type
        if (learnosityQuestion.type.toLowerCase() === 'mcq' && learnosityQuestion.options && learnosityQuestion.options.length > 0) {
          let choiceString = 'your choices are, ';
          learnosityQuestion.options.map((choice) => {
            htmlDiv.innerHTML = choice.label;
            const choicetText = htmlDiv.textContent || htmlDiv.innerText;
            if (choicetText !== '') {
              choiceString += `${choice.choice_label} ${choicetText}, `;
            } else {
              choiceString = '';
            }
          });
          if (choiceString !== '') {
            readOutText = `${questionStimulus}, ${questionTemplate} ${choiceString}`;
          } else { // Removed Comma utterance when choice String is empty for some mcq questions
            readOutText = `${questionStimulus} ${questionTemplate}`;
          }
        } else {
          readOutText = `${questionStimulus} ${questionTemplate}`;
        }

        readOutText = readOutText.replace(/undefined/g, '');
        readOutText = readOutText.replace(/[+]/g, 'plus');
        readOutText = readOutText.replace(/[-]/g, 'minus');
        readOutText = readOutText.replace(/[*/×]/g, 'times');
        readOutText = readOutText.replace(/[/]/g, 'by');
        readOutText = readOutText.replace(/[<]/g, 'less than');
        readOutText = readOutText.replace(/[>]/g, 'greater than');
        readOutText = readOutText.replace(/[=]/g, 'equal to');
        if (readOutText.includes('equal to')) {
          readOutText = readOutText.replace(/{{response}}/g, 'dash');
        } else {
          readOutText = readOutText.replace(/{{response}}/g, ' ');
        }
        if (readOutText.includes('frac')) {
          readOutText = readOutText.replace(/}{/g, 'By');
          readOutText = readOutText.replace(/frac/g, '');
        }
        readOutTexts[count] = readOutText;
      }
      count += 1;
    });
    return readOutTexts;
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  isWBSessionFlow = () => {
    const { student, studentWorkflow } = this.props;
    const wbSessionInProgress = studentWorkflow[`wb_session_${student._id}`];
    if (wbSessionInProgress) {
      return true;
    }
    return false;
  }
  supportTicketForOption = (option) => {
    const { student, user } = this.props;
    const ticket = {};
    ticket.body = `Worksheet: ${this.state.worksheetId}
            Profile ID: ${this.state.studentId}
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

  resumeWorksheetAttempt = () => {
    if (!this.state.isReviewMode && this.itemsApp) {
      this.itemsApp.assessApp().dialogs().pause.hide();
    }
  }

  pauseWorksheetAttempt = () => {
    if (!this.state.isReviewMode && this.itemsApp) {
      this.itemsApp.assessApp().dialogs().pause.show();
    }
  }

  makeAnswerBoxActive = () => {
    // if (this.state.showScribble) {
    //   return;
    // }
    const tempArray = [];
    const elementArray = document.getElementsByClassName('lrn_focusable');
    let inputElements = [];
    let keys = Object.keys(elementArray);
    if (keys && keys.length > 0) {
      keys.forEach((key) => {
        if (elementArray[key] && elementArray[key].className === 'lrn_focusable') {
          tempArray.push(elementArray[key]);
        }
      });
    }
    inputElements = _.uniqBy(tempArray, (element) => element.id);
    keys = Object.keys(inputElements);
    const visibleInputElements = [];
    if (keys && keys.length > 0) {
      keys.forEach((key) => {
        if (inputElements[key] && inputElements[key].className === 'lrn_focusable' && !isNaN(key)) {
          visibleInputElements.push(inputElements[key]);
        }
      });
      if (visibleInputElements.length > 0) {
        tempArray.forEach((element) => {
          if (element.id === visibleInputElements[0].id) {
            element.focus();
          }
        });
        //visibleInputElements[0].focus();
        this.setState({ inputBoxIndex: 1 });
      }
    }
  }
  nextInstancePlaylistworksheet = (assignment) => {
    let nextPlayListWorksheet;
    if (assignment && assignment.instance_worksheets && assignment.instance_worksheets.length > 0) {
      nextPlayListWorksheet = assignment.instance_worksheets[0];
      if (nextPlayListWorksheet && nextPlayListWorksheet.meta && nextPlayListWorksheet.meta.worksheet_number) {
        nextPlayListWorksheet.assigned_date = moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]');
        nextPlayListWorksheet.target_date = assignment.target_date;
        nextPlayListWorksheet.who_assigned = `StudentWebApp/${config.appversion}`;
        nextPlayListWorksheet.status = 'assigned';
        if (!nextPlayListWorksheet.id) {
          nextPlayListWorksheet.id = uuidv1();
        }

        // assigning remaining worksheets as instance worksheets.
        if (assignment.instance_worksheets.length > 1) {
          const worksheetInstances = assignment.instance_worksheets.slice(1);
          nextPlayListWorksheet.instance_worksheets = worksheetInstances;
        }
        return nextPlayListWorksheet;
      }
    }
    return nextPlayListWorksheet;
  }

  saveLearnosityActivity = () => {
    if (this.itemsApp && !this.isGuestFlow() && !this.isWBSessionFlow()) {
      const saveSettings = {
        success: this.onLearnosityActivitySaveSuccess,
        error: this.onLearnosityActivitySaveError,
      };
      try {
        this.itemsApp.save(saveSettings);
      } catch (e) {
        Raven.captureException(e, { itemsApp: this.itemsApp });
      }
    }
  }
  stopReadOut = () => {
    if (this.isReadOutEnabled() && this.worksheetToolInstance) {
      this.worksheetToolInstance.stopReadOutPlaying();
    }
  }
  clearAllScribble = () => {
    const studentScribbleId = `Scribbles_Student_${this.state.studentId}`;
    const studentScribble = this.submission ? this.submission.scribble_layers[studentScribbleId] : undefined;
    if (studentScribble) {
      studentScribble[this.state.currentItem] = {
        Number: this.state.currentItem,
        Scribbles: [],
      };
    }
    this.setState({ clearAllScribble: true });
  }
  handleAdaptiveProgression = () => {
    const { student } = this.props;

    let isAdaptiveProgression = false;
    if (student.playlists && this.state.assignment_details) { // Logic for adaptive worksheet
      let nextInstancePlaylistWorksheet;
      student.playlists.forEach((playlist) => {
        if (playlist.id === this.state.playlist) {
          if (playlist.progression && playlist.progression.toLowerCase() === 'adaptive') {
            isAdaptiveProgression = true;
          }
        }
      });
      if (this.state.assignment_details && this.state.assignment_details.is_adaptive) {
        isAdaptiveProgression = this.state.assignment_details.is_adaptive;
      }
      if (isAdaptiveProgression) {
        if (this.state.rewardPoints && this.state.rewardPoints.grade && this.state.rewardPoints.grade.toLowerCase() !== 'a') {
          nextInstancePlaylistWorksheet = this.nextInstancePlaylistworksheet(this.state.assignment_details);
          if (nextInstancePlaylistWorksheet) {
            if (this.state.assignment_details && this.state.assignment_details.is_adaptive) {
              nextInstancePlaylistWorksheet.is_adaptive = this.state.assignment_details.is_adaptive;
            }
            this.submission.next_instance_worksheet = nextInstancePlaylistWorksheet;

            student.playlists.map((playlist) => {
              if (playlist.id === this.state.playlist) {
                playlist.worksheets.unshift(nextInstancePlaylistWorksheet); // asigning new instance worksheet.
              }
            });
          } else if (this.state.assignment_details && (!this.state.assignment_details.instance_worksheets || this.state.assignment_details.instance_worksheets.length === 0)) {
            this.submission.next_instance_worksheet_exception = `No instance worksheets present for ${this.state.worksheetId} worksheet.`;
          }
        }
      }
    }
  }
  addSubmissionLocally = () => {
    const { student } = this.props;
    if (student) {
      if (!student.submissions) {
        student.submissions = [];
      }
      const submissionMeta = {};
      submissionMeta._id = this.submission._id;
      submissionMeta.worksheet_id = this.submission.worksheet_id;
      submissionMeta.date_submitted = this.submission.date_submitted;
      submissionMeta.worksheet_number_rev = this.submission.worksheet_number_rev;

      submissionMeta.score_achieved = this.submission.score_achieved;
      submissionMeta.total_score = this.submission.total_score;
      submissionMeta.grade = this.submission.grade;
      submissionMeta.time_grade = this.submission.time_grade;
      submissionMeta.time_taken = this.submission.time_taken;
      submissionMeta.reward_points = this.submission.reward_points;
      submissionMeta.worksheet_type = this.submission.worksheet_type;
      submissionMeta.playlist_id = this.submission.playlist;
      submissionMeta.worksheet_meta = {};
      if (this.state.assignment_details && this.state.assignment_details.meta) {
        submissionMeta.worksheet_meta.worksheet_number = this.state.assignment_details.meta.worksheet_number;
        submissionMeta.worksheet_meta.name = this.state.assignment_details.meta.name;
        submissionMeta.worksheet_meta.type = this.state.assignment_details.meta.type;
        submissionMeta.worksheet_meta.suggested_time = this.state.assignment_details.meta.suggested_time;
        submissionMeta.worksheet_meta.learnosity_activity_id = this.state.assignment_details.meta.learnosity_activity_id;
      }
      student.submissions.unshift(submissionMeta);

      // removing it from assignment
      if (student.playlists && student.playlists.length > 0) {
        student.playlists.forEach((playlist) => {
          let index = playlist.worksheets.length - 1;
          while (index >= 0) {
            const item = playlist.worksheets[index];
            let shouldRemoveItem = false;
            if (item && item.id === this.submission._id) {
              shouldRemoveItem = true;
            }
            if (shouldRemoveItem) {
              playlist.worksheets.splice(index, 1);
              break;
            }
            index -= 1;
          }
        });
      }
      student.doNotSync = true;
      student.pastWeekSubmissionCount += 1;
      this.props.studentFetched(student);
    }
  }

  showGuestSubmissionAlert = () => {
    this.setState({ showDialog: true, dialogMessage: 'Thanks for attempting a sample worksheet. Hope you liked the experience! You may also checkout the sample grading by teacher in the Coach Feedback tab.', dialogId: '104' });
  }
  showSubmissionAlert = () => {
    this.setState({ showDialog: true, dialogMessage: 'Submitting the worksheet.', dialogId: '100' });
  }
  showTestStartAlert = () => {
    this.setState({ showDialog: true, dialogMessage: 'You will now start the test. Please read each question carefully and answer to the best of your ability.', dialogId: '103' });
  }

  submitToLearnosity = () => {
    this.saveScribble();
    this.itemsApp.validateQuestions();
    this.refreshCorrectInCorrectCount();
    this.submission.score_achieved = this.state.correctCount.toString();
    this.submission.second_attempt = this.state.secondAttemptCount.toString();
    if (this.submission.playlist && this.submission.playlist.toLowerCase() === 'default' && this.state.playlist) {
      this.submission.playlist = this.state.playlist;
    }

    if (this.state.rewardPoints) {
      this.submission.reward_points.penalty = this.state.rewardPoints.penaltyPoints.toString();
      this.submission.reward_points.score = this.state.rewardPoints.basicRewardPoint.toString();
      this.submission.reward_points.performance = this.state.rewardPoints.perfectionPoint.toString();
      this.submission.reward_points.speed = this.state.rewardPoints.speedBonusPoint.toString();
      this.submission.reward_points.triple_zone = this.state.rewardPoints.accuracyBonusPoint.toString();
      this.submission.reward_points.total = this.state.rewardPoints.totalRewardPoint.toString();
      this.submission.time_grade = this.state.rewardPoints.timeGrade;
      this.submission.grade = this.state.rewardPoints.grade;
    }

    this.submission.date_submitted = moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.submission.date_sync = moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.submission.time_taken = this.itemsApp.assessApp().getTime().toString();// this is in seconds
    if (this.isGuestFlow()) {
      setTimeout(this.showGuestSubmissionAlert, 1200); // showing fake submission alert
    } else {
      const submitSettings = {
        success: (response_ids) => {
          // Receives a list of the saved user responses as [response_id]
          // console.log("save has been successful", response_ids);
          this.onLearnositySubmitResponse({
            success: true,
            session_id: this.state.assignmentId,
          });
        },
        error: (e) => {
          // Receives the event object defined in the Event section
          // console.log("save has failed",e);
          this.onLearnositySubmitResponse({
            success: false,
            error: e,
          });
        },
      };
      this.itemsApp.submit(submitSettings);
    }
  }

  initLearnosityItems(request) {
    this.setState({ activityLoading: true });
    const { session } = this.props;
    return axios({
      method: 'POST',
      baseURL: ENV.apiEndPoint,
      url: `/v1/learnosity/get-signature/${this.state.studentId}/${window.location.hostname}`,
      headers: { Authorization: `JWT ${session.token}` },
      data: request,
    });
    // });
  }
  isString = (obj) => {
    if (obj && ((typeof obj === 'string') || obj instanceof String)) {
      return true;
    }
    return false;
  }

  validateCurrentQuestion() {
    const responseData = {};
    if (!this.itemsApp) {
      return responseData;
    }
    const currentItem = this.itemsApp.getCurrentItem();

    if (currentItem.response_ids.length > 0) {
      const currentQuestionResponseID = currentItem.response_ids[0];
      const question = this.itemsApp.question(currentQuestionResponseID);

      const isAttempted = (currentItem.attempt_status === 'fully_attempted');
      let isValid = false;
      if (isAttempted) {
        isValid = question.isValid();
      }
      const questionResponse = question.getResponse();
      const scoreResponse = question.getScore();

      if (questionResponse) {
        // check the type & return comma separeated response
        responseData.learnosityResponse = questionResponse;
        let answerType;
        if (questionResponse.type) {
          answerType = questionResponse.type;
        }
        if (questionResponse.value) {
          let commaSeparatedAnswer = '';
          if (answerType) {
            responseData.answerType = answerType;
            if (answerType === 'array') {
              commaSeparatedAnswer = questionResponse.value.toString();
            } else if (answerType === 'object') {
              commaSeparatedAnswer = JSON.stringify(questionResponse.value);
            } else {
              commaSeparatedAnswer = questionResponse.value;
            }
          } else {
            commaSeparatedAnswer = questionResponse.value;
          }
          responseData.answer = commaSeparatedAnswer;
        }

        const questionDetails = question.getQuestion();
        // checking for correct answer
        if (questionDetails.validation && questionDetails.validation.valid_response && questionDetails.validation.valid_response.value) {
          let correctAnswer = '';
          const value = questionDetails.validation.valid_response.value;
          if (value) {
            if (Array.isArray(value)) {
              value.map((val) => {
                if (val) {
                  if (Array.isArray(val)) {
                    val.map((v) => {
                      if (v.value && this.isString(v.value)) {
                        correctAnswer = correctAnswer.concat(v.value);
                      } else if (this.isString(v)) {
                        correctAnswer = correctAnswer.concat(v);
                      }
                    });
                  } else if (val && val.value && this.isString(val.value)) {
                    correctAnswer = correctAnswer.concat(val.value);
                  } else if (this.isString(val)) {
                    correctAnswer = correctAnswer.concat(val);
                  }
                }
              });
            } else {
              correctAnswer = value.toString();
            }
          }

          responseData.correctAnswer = correctAnswer;
        }
      }

      if (scoreResponse) {
        if (scoreResponse.score) {
          responseData.score = scoreResponse.score;
        }
        responseData.learnosityScoreResponse = scoreResponse;
      }
      responseData.isValid = isValid;
      responseData.isAttempted = isAttempted;
      return responseData;
    }
    responseData.isAttempted = false;
    responseData.isValid = false;
    return responseData;
  }

  disableItemIfAlreadyAttempted() {
    let disableQuestion = false;
    const currentItem = this.itemsApp.getCurrentItem();
    const currentQuestionResponseID = currentItem.response_ids[0];
    const learnosityQuestion = this.itemsApp.question(currentQuestionResponseID);

    if (this.state.isReviewMode) {
      // learnosityQuestion.validate({ showCorrectAnswers: true });
      disableQuestion = true;
    } else {
      const responseData = this.validateCurrentQuestion();
      if (responseData.isAttempted) {
        const currentQuestion = this.submission.answers.Questions[this.state.currentItem];
        if (currentQuestion.Skipped === 'N' && this.state.maxAttempts !== -1) {
          if (learnosityQuestion) {
            if (currentQuestion.Attempts >= this.state.maxAttempts) {
              learnosityQuestion.validate({ showCorrectAnswers: true });
              disableQuestion = true;
            } else if (currentQuestion.Correct !== 'Y') {
              learnosityQuestion.validate({ showCorrectAnswers: false });
            } else {
              learnosityQuestion.validate({ showCorrectAnswers: false });
              disableQuestion = true;
            }
          }
        }
      }
    }
    if (disableQuestion) {
      this.disableLearnosityQuestion(learnosityQuestion);
    } else {
      this.setState({ showSubmit: true });
    }
  }

  disableLearnosityQuestion(question) {
    question.disable();
    this.setState({ showSubmit: false });
  }

  refreshCorrectInCorrectCount() {
    // calculate the numbers from submission
    let correctCount = 0;
    let inCorrectCount = 0;
    let skippedCount = 0;
    let secondAttemptCount = 0;
    let suggestedTime = 0;
    if (this.state.worksheetMeta) {
      suggestedTime = this.state.worksheetMeta.suggested_time;
    }
    const timeTaken = this.state.timeTaken;
    const totalCount = this.state.itemsCount;
    // add calculation only after learnosity activity is initialized
    if (totalCount > 0 && this.submission) {
      this.submission.answers.Questions.forEach((q) => {
        if (q.Skipped === 'Y' && !this.state.isReviewMode) {
          skippedCount += 1;
        } else if (q.Correct === 'Y') {
          correctCount += 1;
        } else if (q.SecondAttemptCorrect === 'Y') {
          secondAttemptCount += 1;
        }
      });
      if (totalCount > 0) {
        inCorrectCount = totalCount - (correctCount + skippedCount + secondAttemptCount);
      }
      const scoreResponse = calculateRewardPoint(totalCount, correctCount, inCorrectCount, secondAttemptCount, timeTaken, suggestedTime);
      this.state.scoreResponse = scoreResponse;
      
      if (scoreResponse && scoreResponse.totalRewardPoint) {
        this.state.rewardPoints = scoreResponse;
      } else {
        this.state.rewardPoints = undefined;
      }
      this.state.correctCount = correctCount;
      this.state.inCorrectCount = inCorrectCount;
      this.state.secondAttemptCount = secondAttemptCount;
      this.state.skippedCount = skippedCount;
    }
  }

  refreshRewardPointsWithTriplePointAnimation = () => {
    if (this.state.scoreResponse && this.state.scoreResponse.numberOfCorerctQuesAboveAccuracyThreshold >= 1) {
      if(this.state.isPracticeWorksheet) {
        this.startStarAnimation()
      }
    } 
  }

  startStarAnimation = () => {
    $('.starAnimation').fadeIn();
    $('.startAnimationButton').fadeOut();

    $('.star-box').fadeIn(0);

    setTimeout(function () {
      $('.star-box').addClass('star-box-active');
      $('#loading').addClass('show-loader');
    }, 2000);

    setTimeout(function () {
      $('.overlay-sec').fadeOut();
    }, 5000);
  }

  validateAndProcessCurrentItem() {
    let processed = true;
    const responseData = this.validateCurrentQuestion();
    if (!responseData.isAttempted) {
      dataLayer.push({
        event: 'dtResponse',
        eventName: 'Empty Attempt',
        timer: this.state.timeTaken,
      });
      this.setState({ showDialog: true, dialogMessage: <div><span>Please submit an answer.</span><br /> Do you want to skip this question and come back to it later?</div>, cancelButtonLabel: 'SKIP', acceptButtonLabel: 'TRY NOW', dialogId: '106' });
      return false;
    }
    const currentItem = this.itemsApp.getCurrentItem();
    const currentQuestionResponseID = currentItem.response_ids[0];
    const learnosityQuestion = this.itemsApp.question(currentQuestionResponseID);

    // update local submission //get the current item & update the details,
    const q = this.submission.answers.Questions[this.state.currentItem];
    if (q) {
      if (!q.SecondAttemptCorrect) {
        q.SecondAttemptCorrect = 'N';
      }
      // read the response
      if (q.Correct !== 'Y') { // TODO: improve the logic here
        q.Attempts += 1; // incrementing the attempts
        // const metadata = { Attempts: currentQuestion.Attempts };
        // learnosityQuestion.response.setMetadata(metadata);
      }
      q.Answer = responseData.answer;
      if (responseData.correctAnswer) {
        q.correctAnswer = responseData.correctAnswer;
      }
      q.Skipped = 'N';

      if (responseData.isValid) {
        if (this.state.maxAttempts !== -1 && this.state.maxAttempts === 2 && q.Attempts >= 2) {
          q.Correct = 'N';
          q.SecondAttemptCorrect = 'Y';
        } else {
          q.Correct = 'Y';
        }
        dataLayer.push({
          event: 'dtResponse',
          eventName: 'Correct Answer',
          timer: this.state.timeTaken,
        });
      } else {
        dataLayer.push({
          event: 'dtResponse',
          eventName: 'Incorrect Answer',
          timer: this.state.timeTaken,
        });
      }
      // saving meta data for the current question
      const currentResponse = learnosityQuestion.getResponse();
      if (learnosityQuestion.response && currentResponse) {
        let metadata = learnosityQuestion.response.getMetadata();
        if (!metadata) {
          metadata = {};
        }
        metadata.attempts = q.Attempts;
        metadata.correct = q.Correct;
        metadata.secondAttemptCorrect = q.SecondAttemptCorrect;
        metadata.skipped = q.Skipped;

        if (q.FlagStudentAudio && q.FlagStudentAudio !== '') {
          metadata.flagStudentAudio = q.FlagStudentAudio;
        }
        if (q.FlagSkipMode && q.FlagSkipMode !== '') {
          metadata.flagSkipMode = q.FlagSkipMode;
        }

        learnosityQuestion.response.setMetadata(metadata);
      }
    }
    this.refreshCorrectInCorrectCount();

    if (q.Correct === 'Y') {
      this.refreshRewardPointsWithTriplePointAnimation();
    }
    if (this.state.maxAttempts !== -1 && learnosityQuestion) {
      if (q.Attempts >= this.state.maxAttempts) {
        learnosityQuestion.validate({ showCorrectAnswers: true });
        learnosityQuestion.disable();
      } else if (q.Correct !== 'Y' && q.SecondAttemptCorrect !== 'Y') {
        learnosityQuestion.validate({ showCorrectAnswers: false }); // allow one more attempt
        processed = false;
      } else {
        learnosityQuestion.validate({ showCorrectAnswers: false });
        learnosityQuestion.disable();
      }
      let message = 'Try Again!';
      let attemptAgain = false;
      if (q.Correct !== 'Y' && q.SecondAttemptCorrect !== 'Y') {
        if (q.Attempts >= this.state.maxAttempts) {
          message = 'Ooops!';
        } else {
          attemptAgain = true;
        }
        this.crossPlayer.play();
      } else {
        const randomNo = Math.floor((Math.random() * this.state.correctAnimationMessage.length));
        message = this.state.correctAnimationMessage[randomNo];
        this.tickPlayer.play();
      }
      setTimeout(() => {
        if (attemptAgain && this.state.maxAttempts === 2) {
          this.state.showVideoHint = true;
        }
        this.setState({ showDialog: true, dialogMessage: message, dialogNoButton: true });
      }, 300);

      setTimeout(() => {
        this.setState({ showDialog: false, dialogMessage: '', dialogNoButton: true }); // hiding dialog popup with No Button, so 'OK' button doesn;t appear
      }, 1300);

      setTimeout(() => {
        if (attemptAgain) {
          this.makeAnswerBoxActive(); // focus on answer box
        }
        this.onCancelDialog(); // clearing the dialog state again
      }, 1500);
    }

    return processed;
  }

  saveScribble() {
    const studentScribbleId = `Scribbles_Student_${this.state.studentId}`;
    if (this.submission && this.sLayer && this.sLayer !== null && !this.state.isReviewMode) {
      this.submission.scribble_layers[studentScribbleId][this.state.currentItem]
        = {
          Number: this.state.currentItem + 1,
          Scribbles: this.sLayer.getScribbles(),
        };

      // Assign Question Index
      this.submission.eventQuestionNumber = this.state.currentItem + 1;
      this.props.submissionFetched(this.submission);

      // Fire Event
      this.props.createPolaEvent({
        source: 'saveScribble',
        studentId: this.state.studentId,
        questionNumber: this.state.currentItem + 1,
        submissionId: this.state.assignmentId,
        eventType: Event.POLA_QUESTION_END,
      });
    }
  }

  allQuestionsAttempted() {
    let allQuestionsAttempted = false;
    const items = this.itemsApp.getItems();
    if (items && Object.keys(items).length > 0) {
      allQuestionsAttempted = true;
    }

    Object.keys(items).map((key) => {
      const item = items[key];
      if (item.attempt_status !== 'fully_attempted') {
        allQuestionsAttempted = false; // TODO better way to exit
      }
    });
    for (const q of this.submission.answers.Questions) {
      if (q.Skipped === 'Y') {
        allQuestionsAttempted = false;
        break;
      }
    }
    if (allQuestionsAttempted) {
      return true;
    }
    return false;
  }

  initAnswers(itemsMetadata) {
    return Array(...{ length: this.state.itemsCount }).map((c, i) => {
      const itemMetadata = itemsMetadata[i];
      const answer =
      {
        Answer: '',
        Score: 0,
        FlagTeacherAudio: '',
        FlagComment: '',
        Attempts: itemMetadata.attempts || 0,
        FlagStudentAudio: itemMetadata.flagStudentAudio || '',
        Number: i + 1,
        TimeTaken: 0,
        Correct: itemMetadata.correct || 'N',
        SecondAttemptCorrect: itemMetadata.secondAttemptCorrect || 'N',
        CorrectAnswer: '',
        Skipped: itemMetadata.skipped || 'Y',
        ScribbleStartTime: 0,
        FlagSkipMode: itemMetadata.flagSkipMode || 0,
        FlagOptionNumber: itemMetadata.flagOptionNumber || 0,
      };
      return answer;
    });
  }
  initScribbles() {
    return Array(...{ length: this.state.itemsCount }).map((c, i) => {
      const scribble =
      {
        Number: i + 1,
        Scribbles: [],
      };
      return scribble;
    });
  }

  initSubmission(assignmentId, itemsCount, itemsMetadata) {
    const studentId = this.state.studentId;
    if (this.submission === undefined) {
      const studentScribbleId = `Scribbles_Student_${studentId}`;
      this.submission = {
        _id: assignmentId,
        answers: {
          Questions: this.initAnswers(itemsMetadata),
        },
        scribble_layers: {
        },
        worksheet_id: this.state.worksheetId,
        worksheet_number: this.state.activityId,
        learnosity_session_id: assignmentId,
        learnosity_activity_id: this.state.activityId,
        flag_count: '0',
        date_created: moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        locale: 'en_US',
        reward_points: {
          penalty: '0',
          score: '0',
          performance: '0',
          speed: '0',
          triple_zone: '0',
          total: '0',
        },
        score_achieved: '0',
        total_score: itemsCount.toString(),
        second_attempt: '0',
        grade: 'E',
        time_taken: '0',
        time_grade: 'A',
        instance_number: 1,
        date_modified: moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        worksheet_type: (this.state.worksheetMeta && this.state.worksheetMeta.type) ? this.state.worksheetMeta.type : 'Practice',
        worksheet_number_rev: (this.state.worksheetMeta && this.state.worksheetMeta.version) ? this.state.worksheetMeta.version : '1',
        head_info: {
          browser_version: browser ? `${browser.name || ''} ${browser.version || ''}` : '',
          build: `StudentWebApp/${config.appversion || '0'}`,
          student: studentId,
          submission_type: '',
          screen_resolution: {
            width: window.innerWidth - 81,
            height: window.innerHeight,
            outerHeight: window.outerHeight,
            pixelRatio: window.devicePixelRatio,
          },
          class_db: 'tabtor_submissions',
          submission_ip: ip.address() || '',
        },
        playlist: this.state.playlist,
        assignment_details: this.state.assignment_details,
        user_id: studentId,
        user_type: this.state.isProductWorksheet ? 'Product' : 'Student',
      };
      this.submission.scribble_layers[studentScribbleId] = this.initScribbles();
      this.props.submissionFetched(this.submission);
    }
  }

  studentScribbleAtIndex(index) {
    let studentScribble;
    const studentScribbles = this.submission ?
      this.submission.scribble_layers[`Scribbles_Student_${this.state.studentId}`] : '';
    if (studentScribbles) {
      const filteredScribbles = studentScribbles.filter((scribble) => {
        if (scribble && scribble.Number && parseInt(scribble.Number, 10) === (index + 1)) {
          return scribble;
        }
      });
      if (filteredScribbles && filteredScribbles.length > 0) {
        studentScribble = filteredScribbles[0];
      }
    }

    return studentScribble;
  }
  teacherScribbleAtIndex(index) {
    let teacherScribble;
    const teacherScribbles = this.submission ?
      this.submission.scribble_layers[`Scribbles_Teacher_${this.submission.teacher_user_id}`] : '';
    if (teacherScribbles) {
      const filteredScribbles = teacherScribbles.filter((scribble) => (scribble && scribble.Number && parseInt(scribble.Number, 10) === (index + 1)));
      if (filteredScribbles && filteredScribbles.length > 0) {
        teacherScribble = filteredScribbles[0];
      }
    }
    return teacherScribble;
  }

  videosAtIndex(index) {
    const videos = [];
    if (this.state.assignment_details) {
      if (this.state.assignment_details.q_videos) {
        // loop through the question videos & find the videos for current question
        this.state.assignment_details.q_videos.map((video) => {
          if (video.question_number === (index + 1)) {
            videos.push(video);
          }
        });
      }
    }
    return videos;
  }

  getMP4Videos = (videos) => {
    const tempVideos = [];
    videos.forEach((video) => {
      if (video.mp4URI && video.mp4URI.includes('mp4')) {
        tempVideos.push(video);
      }
    });
    return tempVideos;
  }
  addVideoWatchedInfoToSubmission = () => {
    if (this.props.video && this.props.video.video_feedback && this.props.video.video_feedback[this.state.assignmentId] && this.props.video.video_feedback[this.state.assignmentId].length > 0) {
      this.submission.video_feedback = [];
      const feedbacks = this.props.video.video_feedback[this.state.assignmentId];
      feedbacks.map((feedback) => {
        if (feedback.reminder) {
          delete feedback.reminder;
        }
        this.submission.video_feedback.push(feedback);
      });
    }
  }

  initializeVideos = () => {
    let questionVideos = [];
    let allVideos = [];
    if (this.state.assignment_details) {
      if (this.state.assignment_details.q_videos) {
        // questionVideos = Object.keys(this.state.assignment_details.q_videos);
        questionVideos = this.videosAtIndex(this.state.currentItem);
      }
      if (this.state.assignment_details.ws_videos) {
        const combinedVideos = questionVideos.concat(this.state.assignment_details.ws_videos);
        allVideos = _.uniqBy(combinedVideos, (video) => video.video_id);
      } else {
        allVideos = questionVideos;
      }
    }
    return this.getMP4Videos(allVideos);
  }

  isReadOutEnabled = () => {
    const { student } = this.props;
    let isReadOut = false;
    if (student && student.QuestionReadOut) {
      isReadOut = student.QuestionReadOut;
    }
    if (!isReadOut && this.state.worksheetMeta) {
      const worksheetGrade = this.state.worksheetMeta.grade;
      if ((worksheetGrade && (worksheetGrade === '1' || worksheetGrade.toLowerCase() === 'k')) || (student.grade && (student.grade.toLowerCase() === 'k' || student.grade === '1'))) {
        isReadOut = true;
      }
    }
    return isReadOut;
  }

  onPolaPlayClicked = () => {
    console.log('Clicked pola playback');
    this.sLayer.playScribbles();
  }

  showFlagOption = (worksheetType) => {
    const { user, student } = this.props;
    if (worksheetType === 'challenge') {
      return false;
    }
    // checking is it is product worksheets
    if (user.products && _.find(user.products, { id: student._id })) {
      return false;
    }

    this.state.flagComment = '';
    this.state.flagOptionNumber = 0;

    // checking if the current question has any flag details
    if (this.submission && this.submission.answers && this.submission.answers.Questions && this.submission.answers.Questions.length > this.state.currentItem) {
      const q = this.submission.answers.Questions[this.state.currentItem];
      if (q && q.FlagComment) {
        this.state.flagComment = q.FlagComment;
      }

      if (q && q.FlagOptionNumber) {
        this.state.flagOptionNumber = q.FlagOptionNumber;
      }
      if (((q.FlagComment && q.FlagComment !== '') || q.FlagStudentAudio || q.FlagOptionNumber > 0 || (q.FlagSkipMode > 0))) {
        return true;
      }
    }

    if (!this.state.isReviewMode) {
      return true;
    }

    return false;
  }

  onFlag = () => {
    const { student } = this.props;

    if (Common.authorized(student, features.FLAG)) {
      this.setState({ showFlagDialog: true });
      this.stopReadOut();
    } else {
      // show unauthorized message
      this.setState({
        showDialog: true,
        dialogMessage: 'Your current plan is not eligible for this feature. Please upgrade to Personalized Tutor-Led program to use this feature.',
      });
    }
    dataLayer.push({
      event: 'contentInteraction',
      eventName: 'Raise a Flag',
      timer: this.state.timeTaken,
    });
  }

  onCloseFlagDialog = () => {
    this.setState({ showFlagDialog: false });
  }

  onFlagRaised = (flagComment, flagOptionNumber, flagStudentAudio, isSubmitWorksheetWithSkip) => {
    this.submission.answers.Questions[this.state.currentItem].FlagComment = flagComment;
    this.submission.answers.Questions[this.state.currentItem].FlagOptionNumber = flagOptionNumber;
    // this.submission.answers.Questions[this.state.currentItem].FlagStudentAudio = flagStudentAudio;
    if (isSubmitWorksheetWithSkip) {
      this.onSubmitWorksheetWithSkip();
    } else {
      this.props.submissionFetched(this.submission); // to save it in store
    }
  }

  onEnteKeyPressed = () => {
    const _this = this;
    const tempArray = [];
    const elementArray = document.getElementsByClassName('lrn_focusable');
    let inputElements = [];
    let keys = Object.keys(elementArray);
    if (keys && keys.length > 0) {
      keys.forEach((key) => {
        if (elementArray[key] && elementArray[key].className === 'lrn_focusable') {
          tempArray.push(elementArray[key]);
        }
      });
    }
    inputElements = _.uniqBy(tempArray, (element) => element.id);

    keys = Object.keys(inputElements);
    const visibleInputElements = [];
    if (keys.length > 0) {
      keys.forEach((key) => {
        if (inputElements[key].className === 'lrn_focusable' && !isNaN(key)) {
          visibleInputElements.push(inputElements[key]);
          tempArray[key].onkeydown = function (evt) {
            const keyboardEvt = evt || window.event;
            if (keyboardEvt.code === 'Enter' || keyboardEvt.keyCode === 13) {
              if (_this.state.showDialog) {
                _this.onAcceptDialog();
                _this.setState({ inputBoxIndex: 0 });
              }
              if (_this.state.inputBoxIndex < visibleInputElements.length) {
                tempArray.forEach((element) => {
                  if (element.id === visibleInputElements[_this.state.inputBoxIndex].id) {
                    element.focus();
                  }
                });
                _this.setState({ inputBoxIndex: _this.state.inputBoxIndex + 1 });
              } else {
                _this.onSubmit();
                _this.setState({ inputBoxIndex: 0 });
              }
            } else if (keyboardEvt.code === 'ArrowLeft' || keyboardEvt.keyCode === 37) {
              if (_this.state.inputBoxIndex >= 0 && _this.state.inputBoxIndex <= visibleInputElements.length) {
                if (_this.state.inputBoxIndex === visibleInputElements.length && visibleInputElements[_this.state.inputBoxIndex - 2]) {
                  visibleInputElements[_this.state.inputBoxIndex - 2].focus();
                  _this.setState({ inputBoxIndex: _this.state.inputBoxIndex - 1 });
                } else if (visibleInputElements[_this.state.inputBoxIndex - 1]) {
                  visibleInputElements[_this.state.inputBoxIndex - 1].focus();
                  if ((_this.state.inputBoxIndex - 1) != 0) {
                    _this.setState({ inputBoxIndex: _this.state.inputBoxIndex - 1 });
                  }
                }
              } else {
                _this.setState({ inputBoxIndex: 0 });
              }
            }
          };
        }
      });
    }
    document.onkeydown = function (evt) {
      const keyboardEvt = evt || window.event;
      if (keyboardEvt.code === 'Enter' || keyboardEvt.keyCode === 13) {
        if (_this.state.showDialog) {
          _this.onAcceptDialog();
          _this.setState({ inputBoxIndex: 0 });
          return;
        }
        if (_this.state.inputBoxIndex < visibleInputElements.length) {
          tempArray.forEach((element) => {
            if (element.id === visibleInputElements[_this.state.inputBoxIndex].id) {
              element.focus();
            }
          });
          _this.setState({ inputBoxIndex: _this.state.inputBoxIndex + 1 });
        } else {
          _this.onSubmit();
          _this.setState({ inputBoxIndex: 0 });
        }
      } else if (keyboardEvt.code === 'ArrowLeft' || keyboardEvt.keyCode === 37) {
        if (_this.state.inputBoxIndex >= 0 && _this.state.inputBoxIndex <= visibleInputElements.length) {
          if (_this.state.inputBoxIndex === visibleInputElements.length && visibleInputElements[_this.state.inputBoxIndex - 2]) {
            visibleInputElements[_this.state.inputBoxIndex - 2].focus();
            _this.setState({ inputBoxIndex: _this.state.inputBoxIndex - 1 });
          } else {
            if (visibleInputElements[_this.state.inputBoxIndex - 1]) {
              visibleInputElements[_this.state.inputBoxIndex - 1].focus();
            }
            if ((_this.state.inputBoxIndex - 1) != 0) {
              _this.setState({ inputBoxIndex: _this.state.inputBoxIndex - 1 });
            }
          }
        } else {
          _this.setState({ inputBoxIndex: 0 });
        }
      }
    };
  }

  // onEnteKeyPressed = () => {
  //   const _this = this;
  //   document.onkeydown = function (evt) {
  //     evt = evt || window.event;
  //     if (evt.code === 'Enter' || evt.keyCode === 13) {
  //       if (_this.state.showDialog) {
  //         _this.onAcceptDialog();
  //         _this.setState({ inputBoxIndex: 0 });
  //         return;
  //       }
  //       const inputElements = document.getElementsByClassName('lrn_focusable');
  //       const keys = Object.keys(inputElements);
  //       const visibleInputElements = [];
  //       keys.forEach((key) => {
  //         if (inputElements[key].className === 'lrn_focusable') {
  //           visibleInputElements.push(inputElements[key]);
  //         }
  //       });
  //       if (_this.state.inputBoxIndex < visibleInputElements.length) {
  //         visibleInputElements[_this.state.inputBoxIndex].focus();
  //         _this.setState({ inputBoxIndex: _this.state.inputBoxIndex + 1 });
  //       } else {
  //         _this.onSubmit();
  //        _this.setState({ inputBoxIndex: 0 });
  //       }
  //     }
  //   };
  // }

  initializeAudeoPlayers = () => {
    this.tickPlayer = document.createElement('audio');
    this.tickPlayer.id = 'audio-player';
    this.tickPlayer.src = 'https://s3.amazonaws.com/tabtor-sounds/levelUp.wav';
    this.tickPlayer.type = 'audio/wav';
    this.tickPlayer.preload = 'auto';
    this.tickPlayer.volume = 1.0;
    this.tickPlayer.load();

    this.crossPlayer = document.createElement('audio');
    this.crossPlayer.id = 'audio-player';
    this.crossPlayer.src = 'https://s3.amazonaws.com/tabtor-sounds/slip.wav';
    this.crossPlayer.type = 'audio/wav';
    this.crossPlayer.preload = 'auto';
    this.crossPlayer.volume = 1.0;
    this.crossPlayer.load();
  }

  render() {
    const { student, submissions } = this.props;
    let worksheetType = '';
    if (this.state.worksheetMeta && this.state.worksheetMeta.type) {
      worksheetType = this.state.worksheetMeta.type.toLowerCase();
    }
    this.submission = submissions[this.state.assignmentId];
    const studentScribble = this.studentScribbleAtIndex(this.state.currentItem);
    const teacherScribble = this.teacherScribbleAtIndex(this.state.currentItem);
    const videos = this.initializeVideos();
    this.onEnteKeyPressed();
    let readOutText = '';
    if (this.state.readOutTexts && this.state.readOutTexts.length > this.state.currentItem + 1) {
      readOutText = this.state.readOutTexts[this.state.currentItem + 1];
    }
    let answer;
    // checking if the current question is attempted
    if (this.submission && this.submission.answers && this.submission.answers.Questions && this.submission.answers.Questions.length > this.state.currentItem) {
      const q = this.submission.answers.Questions[this.state.currentItem];
      answer = q.Answer;
    }
    const width = this.submission && this.submission.head_info.screen_resolution ? this.submission.head_info.screen_resolution.width : window.innerWidth;
    return (
      <div>
        {this.state.showSubmissionLoader ? <ProgressLoader message={this.state.isSkillsAssessment ? Localization.localizedStringForKey('Your Skills Assessment is being submitted.') : Localization.localizedStringForKey('Your Worksheet is being submitted')} /> : ''}
        <div className={`o-loadingScreenModal o-loadingScreenModal--${this.state.activityLoading ? 'show' : 'hide'}`}>
          <LoadingSpinner />
        </div>
        <Dialog
          show={this.state.showDialog}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
          cancelButtonLabel={this.state.cancelButtonLabel}
          onCancel={this.onCancelDialog}
          acceptButtonLabel={this.state.acceptButtonLabel}
          noButtons={this.state.dialogNoButton}
        />

        <SupportDialog
          show={this.state.showSupportDialog}
          onClose={this.onSupportDialogClose}
          onSubmit={this.onSupportDialogSubmit}
          getSupportTicket={this.supportTicketForOption}
        />

        <FlagDialog
          show={this.state.showFlagDialog}
          onClose={this.onCloseFlagDialog}
          onFlagRaised={this.onFlagRaised}
          isReviewMode={this.state.isReviewMode}
          submission={this.submission}
          questionNumber={this.state.currentItem}
          existingFlagComment={this.state.flagComment}
          existingFlagOptionNumber={this.state.flagOptionNumber}
        />


        <VideoModal
          createPolaEvent={this.props.createPolaEvent}
          submissionId={this.state.assignmentId}
          studentId={this.state.studentId}
          questionNumber={this.state.currentItem}
          show={this.state.showVideo}
          videoId={this.state.videoId}
          onCloseVideo={this.onCloseVideo}
          videoList={videos}
          assignmentId={this.state.assignmentId}
          worksheetId={this.state.worksheetId}
          source={`Worksheet Attempt - Question: ${this.state.currentItem + 1}, Entered Answer: ${answer || 'Not Attempted'}`}
        />


        <VideoPlaylist
          show={this.state.showVideoPlaylist}
          onCloseVideoPlayList={this.onCloseVideoPlayList}
          onVideo={this.onVideo}
          // videoList={videos.concat(this.props.video[this.state.assignment_details.meta.tabtor_mapping[0]])}
          videoList={videos}
        />

        <WorksheetHeader
          student={student}
          worksheetMeta={this.state.worksheetMeta}
          assignmentId={this.props.params.assignmentId}
          activityState={this.props.params.activityState}
        />

        <WorksheetPageHeader
          onPrevious={this.onPrevious}
          onNext={this.onNext}
          onPolaPlayClicked={this.onPolaPlayClicked}
          noOfQuestions={this.state.itemsCount}
          onSelectQuestion={this.onSelectQuestion}
          currentItem={this.state.currentItem + 1}
          submission={this.submission}
          correctCount={this.state.correctCount}
          inCorrectCount={this.state.inCorrectCount}
          skippedCount={this.state.skippedCount}
          secondAttemptCount={this.state.secondAttemptCount}
          rewardPoints={this.state.rewardPoints ? this.state.rewardPoints.totalRewardPoint : 0}
          timeTaken={this.state.timeTaken}
          isReviewMode={this.state.isReviewMode}
          showScore={this.state.maxAttempts !== -1}
          showTripplePoint={this.state.scoreResponse && this.state.scoreResponse.numberOfCorerctQuesAboveAccuracyThreshold >= 1 ? true : false}
        />

        <div className="o-worksheetPageFooter">
          <WorksheetTools
            onPrevious={this.onPrevious}
            onNext={this.onNext}
            onSubmit={this.onSubmit}
            showSubmit={this.state.showSubmit}
            showAudioNotes={this.state.showAudioNotes}
            isEraseOn={this.state.isEraseOn}
            isScribbleActive={this.state.showScribble}
            onSelectQuestion={this.onSelectQuestion}
            onToggleScribble={this.onToggleScribble}
            onToggleErase={this.onToggleErase}
            onToggleGarbage={this.onToggleGarbage}
            studentId={this.state.studentId}
            isGarbageOn={this.state.isGarbageOn}
            showErase={this.state.showErase}
            showScribble={!this.state.isReviewMode}
            showClearAll={this.state.showClearAll}
            showReadOut={this.isReadOutEnabled() && this.state.itemsCount > 0}
            readOutText={readOutText}
            ref={instance => { this.worksheetToolInstance = instance; }}
          />
          <WorksheetAids
            showVideo={videos && videos.length > 0 && this.state.itemsCount > 0}
            onVideo={this.onVideoPlayList}
            showVideoHint={this.state.showVideoHint}
            showSupport={!this.isGuestFlow()}
            onSupport={this.onSupport}
            onFlag={this.onFlag}
            showFlag={this.showFlagOption(worksheetType)}
            flagToolTip={this.state.isReviewMode ? 'Response to Flag' : 'Raise a Flag'}
          />
        </div>
        {/* <div className="a-appView a-appView--hasWorksheetTools a-appView--worksheet"> */}
        <div className={`a-appView ${this.state.isReviewMode ? 'a-appView--reviewWorksheet' : 'a-appView--worksheet'}`}>
          <div className="a-appView__contents" style={{ width }}>
            <div className="o-learnosity">
              <div id="learnosity_assess" />
            </div>
            <ScribbleLayer
              ref={(c) => { this.sLayer = c; }}
              createPolaEvent={this.props.createPolaEvent}
              studentScribble={studentScribble || undefined}
              teacherScribble={teacherScribble || undefined}
              canDraw={this.state.canDraw}
              isEraseOn={this.state.isEraseOn}
              isReviewMode={this.state.isReviewMode}
              submissionId={this.state.assignmentId}
              studentId={this.state.studentId}
              questionNumber={this.state.currentItem}
              showScribble={this.state.showScribble}
              clearAllScribble={this.state.clearAllScribble}
              onScribbleDrawn={this.onScribbleDrawn}
              onInputClick={this.onToggleScribble}
            />
          </div>

        </div>
        <Footer/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  student: state.student,
  user: state.user,
  submissions: state.submissions,
  studentWorkflow: state.studentWorkflow,
  video: state.video,
});

const actionCreators = {
  fetchSubmission,
  submissionFetched,
  submitWorksheet,
  studentFetched,
  createPolaEvent,
  createTrackingEvent,
};

export default connect(
  mapStateToProps,
  actionCreators
)(Worksheet);
