import React, { Component } from 'react';
//import Recorder from 'react-recorder';
import Close from '../Shared/Glyphs/Close';
import Checkmark from '../Shared/Glyphs/Checkmark';
//import AudioSpeaker from '../Shared/Glyphs/AudioSpeaker';
//import PlayIcon from '../Shared/Glyphs/PlayIcon';
//import Garbage from '../Shared/Glyphs/Garbage';
import * as Localization from '../Shared/Localization';

class FlagDialog extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
    }),
    show: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    onFlagRaised: React.PropTypes.func,
    isReviewMode: React.PropTypes.bool,
    questionNumber: React.PropTypes.number,
    submission: React.PropTypes.shape({}),
    existingFlagComment: React.PropTypes.string,
    existingFlagOptionNumber: React.PropTypes.number,

  }

  constructor(props) {
    super(props);
    this.state = {
      flagComments: [],
      selectedOptionIndex: -1,
      showAudioPlayer: false,
      studentAudio: '',
      isSubmitWorksheet: false,
    };

    this.initializeFlagComments();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.show !== nextProps.show) {
      this.state.selectedOptionIndex = nextProps.existingFlagOptionNumber;
      this.state.isSubmitWorksheet = false;
      if (this.textarea && !nextProps.isReviewMode) {
        this.textarea.value = nextProps.existingFlagComment;
      }
    }
  }

  onSubmit = () => {
    let flagComment = '';
    let isSubmitWorksheetWithSkip = false;
    if (this.textarea && this.textarea.value !== '') {
      flagComment = this.textarea.value;
    }
    if (this.state.isSubmitWorksheet) {
      isSubmitWorksheetWithSkip = true;
    }
    if ((flagComment === '') && this.state.selectedOptionIndex === -1 && (this.state.studentAudio === '') && (!isSubmitWorksheetWithSkip)) {
      return;
    }
    this.props.onFlagRaised(flagComment, this.state.selectedOptionIndex, this.state.studentAudio, isSubmitWorksheetWithSkip);
    this.onClose();
  }

  // onStop = (blob) => {
  //   const reader = new window.FileReader();
  //   const _this = this;
  //   reader.readAsBinaryString(blob);
  //   reader.onloadend = function () {
  //     const binaryData = reader.result;
  //     const base64String = window.btoa(binaryData);
  //     _this.setState({ studentAudio: base64String });
  //   };
  //   const audioURL = window.URL.createObjectURL(blob);
  //   document.getElementById('audio').src = audioURL;
  // }

  onClose = () => {
    if (!this.state.isReviewMode && this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
    }
    this.props.onClose();
  }
  startRecording = () => {
    this.child.start();
    this.setState({ showAudioPlayer: false });
  }

  stopRecording = () => {
    this.child.stop();
    this.setState({ showAudioPlayer: true });
  }

  initializeFlagComments = () => {
    const comments = [];
    comments[1] = Localization.localizedStringForKey("I'm stuck on this problem");
    comments[2] = Localization.localizedStringForKey('The worksheet is tough for me.');
    comments[3] = Localization.localizedStringForKey('I find this calculation difficult');
    comments[4] = Localization.localizedStringForKey("I don't understand the word problem.");
    this.state.flagComments = comments;
  }

  flagOptions = () => {
    const options = [];
    let index = 1;
    this.state.flagComments.forEach((comment) => {
      options.push(
        <label className="b-checkbox">
          <input type="checkbox" className="b-checkbox__input" name="flag-option" value={index} onChange={e => this.handleCheckBoxChange(e)} checked={(this.state.selectedOptionIndex === index)} />
          <span className="b-checkbox__display">
            <Checkmark />
          </span>
          <span className="b-checkbox__label">
            {comment}
          </span>
        </label>
      );
      index += 1;
    });
    return options;
  }
  handleCheckBoxChange = (e) => {
    if (parseInt(e.target.value, 10) === 5) {
      this.setState({ isSubmitWorksheet: !this.state.isSubmitWorksheet }); // toggle the checkbox
    } else {
      this.setState({ selectedOptionIndex: parseInt(e.target.value, 10) });
    }
  }
  gotStream = (stream) => {
    this.stream = stream;
  }

  render() {
    const { show, isReviewMode, submission, questionNumber } = this.props;
    let currentQuestion = {};
    let teacherAudio;
    // let studentAudio;
    if (isReviewMode && submission) {
      currentQuestion = submission.answers.Questions[questionNumber];
      if (currentQuestion.FlagTeacherAudio && currentQuestion.FlagTeacherAudio !== '') {
        teacherAudio = `data:audio/wav;base64,${currentQuestion.FlagTeacherAudio}`;
      }

      // if (currentQuestion.FlagStudentAudio !== '') {
      //   studentAudio = 'data:audio/wav;base64,' + currentQuestion.FlagStudentAudio;
      // }
    }

    const flagDialogClass = show ? 'o-modal o-modal--show' : 'o-modal o-modal--hide';
    return (
      <div className={flagDialogClass}>
        <div className="o-modal__box o-modal__box--small">
          <button className="o-modal__closeBtn" onClick={() => this.onClose()}>
            <Close />
          </button>
          {
            isReviewMode ?
              <div className="o-flagDialog">
                <p className="a-p(14)">
                  <strong>{Localization.localizedStringForKey('Response to Flag')}</strong>
                </p>
                <div className="o-flagDialog__options">
                  {
                    (currentQuestion.FlagOptionNumber) ?
                      <label className="b-checkbox">
                        <input type="checkbox" className="b-checkbox__input" name="flag-option" value="1" checked />
                        <span className="b-checkbox__display">
                          <Checkmark />
                        </span>
                        <span className="b-checkbox__label">
                          {(this.state.flagComments && this.state.flagComments.length > currentQuestion.FlagOptionNumber && this.state.flagComments[currentQuestion.FlagOptionNumber]) ? this.state.flagComments[currentQuestion.FlagOptionNumber] : ''}
                        </span>
                      </label>
                      : ''
                  }

                  <label className="b-checkbox">
                    <span className="b-checkbox__label">
                      {Localization.localizedStringForKey('Your Comments')}
                    </span>
                  </label>
                  <textarea style={{ width: '100%', backgroundColor: '#F4F4F4', border: '0.0625rem solid #DEDEDE', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#242424', lineHeight: '1.5rem', minHeight: '5.5rem' }} placeholder="Additional comments" value={currentQuestion.FlagComment} />
                  <label className="b-checkbox">
                    <span className="b-checkbox__label">
                      {Localization.localizedStringForKey('Teachers Response')}
                    </span>
                  </label>
                  <textarea style={{ width: '100%', backgroundColor: '#F4F4F4', border: '0.0625rem solid #DEDEDE', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#242424', lineHeight: '1.5rem', minHeight: '5.5rem' }} placeholder="Additional comments" value={currentQuestion.FlagResponse} />
                  {
                    (currentQuestion.FlagStudentAudio !== '' || currentQuestion.FlagTeacherAudio !== '') ?
                      <div>
                        <label className="b-checkbox">
                          <span className="b-checkbox__label">
                            <strong>{Localization.localizedStringForKey('Audio Notes')}</strong>
                          </span>
                        </label>
                        {/* currentQuestion.FlagStudentAudio !== '' ? <div>
                          <label className="b-checkbox">
                            <span className="b-checkbox__lable">
                              Yours :
                        </span>
                          </label>
                          <audio controls >
                            <source src={studentAudio} type="audio/mp4"/>
                          </audio>
                        </div> : '' */}
                        {
                          (currentQuestion.FlagTeacherAudio !== '') ?
                            <div>
                              <label className="b-checkbox">
                                <span className="b-checkbox__label">
                                  Teachers Response :
                              </span>
                              </label>
                              <audio controls >
                                <source src={teacherAudio} type="audio/wav" />
                              </audio>
                            </div> : ''
                        }
                      </div>
                    : ''
                  }
                </div>
              </div>
            :
              <div className="o-flagDialog">

                <p className="a-p(14)">
                  {Localization.localizedStringForKey('Flag this question.')}
                </p>
                <p className="a-p(14) a-color(copy-2)">
                  {Localization.localizedStringForKey('Your coach will review your comments after you have submitted this worksheet.')}
                </p>
                <div className="o-flagDialog__options">
                  {this.flagOptions()}
                  <label className="b-checkbox">
                    <input type="checkbox" className="b-checkbox__input" name="flag-option" value="5" onChange={e => this.handleCheckBoxChange(e)} checked={this.state.isSubmitWorksheet} />
                    <span className="b-checkbox__display">
                      <Checkmark />
                    </span>
                    <span className="b-checkbox__label">
                      <strong>{Localization.localizedStringForKey('Submit this worksheet. ')}</strong>{Localization.localizedStringForKey('Skip any remaining questions and send the worksheet to your coach for review.')}
                    </span>
                  </label>
                </div>
                {/* <Recorder
                  onStop={this.onStop}
                  ref={instance => { this.child = instance; }}
                  gotStream={this.gotStream}
                /> */}
                <textarea className="b-textarea" placeholder="Additional comments" ref={(c) => { this.textarea = c; }} />
                { (this.state.showAudioPlayer) ? <audio id="audio" controls /> : ''}
                <div className="o-modal__actions">
                  <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={() => this.onSubmit()}>
                    <span className="b-button__label">
                      Submit
                    </span>
                  </button>
                </div>
              </div>
          }
        </div>
      </div>
    );
  }
}

export default FlagDialog;
