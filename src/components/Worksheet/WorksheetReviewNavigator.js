import React, { Component } from 'react';
import Flag from '../Shared/Glyphs/Flag';
import AudioSpeaker from '../Shared/Glyphs/AudioSpeaker';
import ArrowLeft from '../Shared/Glyphs/ArrowLeft';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import ScribbleIcon from '../Shared/Glyphs/ScribbleIcon';
import * as Localization from '../Shared/Localization';


class WorksheetReviewNavigator extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
    }),
    noOfQuestions: React.PropTypes.number,
    onSelectQuestion: React.PropTypes.func,
    currentItem: React.PropTypes.number,
    submission: React.PropTypes.shape({
    }),
  }
  constructor(props) {
    super(props);
    const { submission } = this.props;
    this.state = {
      isShowAllTabActive: true,
      sliderStartItem: this.props.currentItem,
      showTabs: false,
      sliderAdjusetd: false,
    };

    const inCorrectOrFlagQuestions = submission.answers.Questions.filter((q) => {
      if (this.isInCorrectOrFlagQuestion(q)) {
        return true;
      }
      return false;
    });

    if (inCorrectOrFlagQuestions && inCorrectOrFlagQuestions.length > 0) {
      this.state.showTabs = true;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.sliderStartItem !== nextProps.currentItem && !this.state.sliderAdjusetd) {
      const numberOfTiles = this.numberOfTilesinPage();
      this.state.sliderAdjusetd = true;
      if (nextProps.currentItem >= (this.props.noOfQuestions - numberOfTiles) + 1) {
        this.state.sliderStartItem = (this.props.noOfQuestions - numberOfTiles) + 1;
      } else {
        this.state.sliderStartItem = nextProps.currentItem;
      }
    }
  }

  onNext = () => {
    const { submission } = this.props;

    if (this.state.isShowAllTabActive) {
      if (this.props.currentItem < this.props.noOfQuestions) {
        this.props.onSelectQuestion(this.props.currentItem + 1); // move to next item
        this.moveSliderForword();
      }
    } else {
      submission.answers.Questions.forEach((q) => {
        if (this.isInCorrectOrFlagQuestion(q) && (q.Number > this.props.currentItem)) {
          this.props.onSelectQuestion(q.Number);
          this.moveSliderForword();
        }
      });
    }
  }

  onPrevious = () => {
    const { submission } = this.props;
    if (this.state.isShowAllTabActive) {
      if (this.props.currentItem > 1) {
        this.props.onSelectQuestion(this.props.currentItem - 1);
        this.moveSliderBackword();
      }
    } else {
      for (let i = (this.props.currentItem - 2); i > 0; i--) {
        if (submission.answers.Questions.length > i) {
          const q = submission.answers.Questions[i];

          if (this.isInCorrectOrFlagQuestion(q)) {
            this.props.onSelectQuestion(q.Number);
            this.moveSliderBackword();
            break;
          }
        }
      }
    }
  }

  isInCorrectOrFlagQuestion = (q) => {
    if ((q.Correct === 'N' && (q.SecondAttemptCorrect ? q.SecondAttemptCorrect === "N" : true )) || q.Skipped === 'Y' || this.hasFlag(q)) {
      return true;
    }
    return false;
  }

  hasFlag = (q) => {
    if (((q.FlagComment && q.FlagComment !== '') || q.FlagStudentAudio || q.FlagOptionNumber > 0 || (q.FlagSkipMode > 0))) {
      return true;
    }
    return false;
  }
  questionSlider = () => {
    const { submission } = this.props;
    const sliderElements = [];

    for (let i = this.state.sliderStartItem; i <= this.props.noOfQuestions; i++) {
      if (i > 0) {
        if (this.state.isShowAllTabActive) {
          sliderElements.push(this.sliderQuestionView(submission.answers.Questions[i - 1]));
        } else {
          const q = submission.answers.Questions[i - 1];
          if (this.isInCorrectOrFlagQuestion(q)) {
            sliderElements.push(this.sliderQuestionView(q));
          }
        }
      }
    }
    return (<div className="o-reviewNavigator__questionsSlider -p0">{sliderElements}</div>);
  }

  numberOfTilesinPage = () => {
    const pageWidth = window.outerWidth;
    let numberOfTiles = 1;
    if (pageWidth > 1150) {
      numberOfTiles = 7;
    } else if (pageWidth > 960) {
      numberOfTiles = 5;
    } else if (pageWidth > 800) {
      numberOfTiles = 4;
    } else if (pageWidth > 640) {
      numberOfTiles = 3;
    }

    return numberOfTiles;
  }
  moveSliderForword = () => {
    const numberOfTiles = this.numberOfTilesinPage();
    const lastVisibleItem = this.state.sliderStartItem + (numberOfTiles - 1);
    if (this.props.currentItem >= this.noOfQuestions) {
      return;
    }
    if ((this.props.currentItem + 1) > lastVisibleItem) {
      this.state.sliderStartItem = this.state.sliderStartItem + 1;
    }
  }

  moveSliderBackword = () => {
    if (this.props.currentItem <= 1) {
      return;
    }
    if ((this.props.currentItem - 1) < this.state.sliderStartItem) {
      this.state.sliderStartItem = this.state.sliderStartItem - 1;
    }
  }

  hasStudentScribble = (submission, q) => {
    const studentScribbles = submission ?
      submission.scribble_layers[`Scribbles_Student_${submission.user_id}`] : '';
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

  sliderQuestionView = (q) => {
    const { submission } = this.props;

    let tileClassName = 'correct';
    let selectedQuestionClassName = '';

    if (this.isInCorrectOrFlagQuestion(q)) {
      tileClassName = 'incorrect';
    } else if (q.SecondAttemptCorrect === 'Y') {
      tileClassName = 'secondTry';
    }

    if (q.Number === this.props.currentItem) {
      selectedQuestionClassName = 'o-reviewTile--active';
    }

    const hasStudentScribble = this.hasStudentScribble(submission, q);
    const hasTeacherScribble = this.hasTeacherScribble(submission, q);

    return (
      <div key={q.Number} className={`o-reviewTile o-reviewTile--${tileClassName} ${selectedQuestionClassName}`} onClick={() => this.props.onSelectQuestion(q.Number)}>
        <span>
          <div className="o-reviewTile__id">
            {q.Number}
          </div>
          <div className="o-reviewTile__teacherIndicators">
            <div title="Scribbles from Coach">
              {hasTeacherScribble ? <ScribbleIcon /> : ''}
            </div>
            <div title="Audible notes">
              {
                q.FlagTeacherAudio ? <AudioSpeaker /> : ''
              }
            </div>
          </div>
          <div className="o-reviewTile__studentIndicators">
            <div title="Scribbles">
              {hasStudentScribble ? <ScribbleIcon /> : ''}
            </div>
            <div title="Flag raised">
              {
                this.hasFlag(q) ? <Flag /> : ''
              }
            </div>
          </div>
        </span>
      </div>
    );
  }

  tabClicked = (showAllTabSelected) => {
    const { submission } = this.props;
    let questionNumber = 1;
    if (!showAllTabSelected) {
      questionNumber = this.props.noOfQuestions;
      submission.answers.Questions.forEach((q) => {
        if (this.isInCorrectOrFlagQuestion(q)) {
          if (questionNumber > q.Number) {
            questionNumber = q.Number;
          }
        }
      });
    }
    this.props.onSelectQuestion(questionNumber);
    this.state.sliderStartItem = questionNumber;
    this.setState({ isShowAllTabActive: showAllTabSelected });
  }


  render() {
    const classNameForShowaAllTab = this.state.isShowAllTabActive ? 'b-toggleSelector__option b-toggleSelector__option--selected' : 'b-toggleSelector__option';
    const classNameForIncorrectTab = this.state.isShowAllTabActive ? 'b-toggleSelector__option' : 'b-toggleSelector__option b-toggleSelector__option--selected';
    const classNameToggleSwitch = this.state.isShowAllTabActive ? 'b-toggleSelector__btn b-toggleSelector__btn--showAll' : 'b-toggleSelector__btn b-toggleSelector__btn--incorrect';
    return (
      (this.props.noOfQuestions > 0) ?
        <div className="o-reviewNavigator">
          {this.state.showTabs ?
            <div className="b-toggleSelector o-reviewNavigator__selector" >
              <button className={classNameForShowaAllTab} onClick={() => this.tabClicked(true)}>
                <span className="b-toggleSelector__optionName" >
                  {Localization.localizedStringForKey('Show All')}
                </span>
              </button>
              <button className={classNameToggleSwitch} onClick={() => this.tabClicked(!this.state.isShowAllTabActive)}>
                <span className="b-toggleSelector__btnControl">
                </span>
              </button>
              <button className={classNameForIncorrectTab} onClick={() => this.tabClicked(false)}>
                <span className="b-toggleSelector__optionName" >
                  {Localization.localizedStringForKey('Incorrect')} <span>{Localization.localizedStringForKey('Only')}</span>
                </span>
              </button>
            </div> :
            <div className="b-toggleSelector o-reviewNavigator__selector" style={{ display: 'block', visibility: 'hidden' }} >
              <button className={classNameForShowaAllTab} onClick={() => this.tabClicked(true)}>
                <span className="b-toggleSelector__optionName" >
                  {Localization.localizedStringForKey('Show All')}
                </span>
              </button>
              <button className={classNameToggleSwitch} onClick={() => this.tabClicked(!this.state.isShowAllTabActive)}>
                <span className="b-toggleSelector__btnControl">
                </span>
              </button>
              <button className={classNameForIncorrectTab} onClick={() => this.tabClicked(false)}>
                <span className="b-toggleSelector__optionName" >
                  {Localization.localizedStringForKey('Incorrect')} <span>{Localization.localizedStringForKey('Only')}</span>
                </span>
              </button>
            </div>
          }
          <div className="o-reviewNavigator__questions">
            <button className="o-reviewNavigator__navBtn o-reviewNavigator__navBtn--prev" onClick={() => this.onPrevious()}>
              <ArrowLeft />
            </button>
            <button className="o-reviewNavigator__navBtn o-reviewNavigator__navBtn--next" onClick={() => this.onNext()}>
              <ArrowRight />
            </button>

            <div className="o-reviewNavigator__questionsPane">
              {this.questionSlider()}
            </div>
          </div>
        </div>
        : <div className="o-reviewNavigator" />
    );
  }
}

export default WorksheetReviewNavigator;
