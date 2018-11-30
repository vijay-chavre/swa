import React, { Component } from 'react';
import moment from 'moment';
import WorksheetPageIndicator from './WorksheetPageIndicator';
import WorksheetReviewNavigator from './WorksheetReviewNavigator';
import WorksheetPOLA from './WorksheetPOLA';
import Stopwatch from '../Shared/Glyphs/Stopwatch';
import ArrowLeft from '../Shared/Glyphs/ArrowLeft';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import * as Localization from '../Shared/Localization';


class WorksheetPageHeader extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
    }),
    onPrevious: React.PropTypes.func,
    onNext: React.PropTypes.func,
    noOfQuestions: React.PropTypes.number,
    onSelectQuestion: React.PropTypes.func,
    currentItem: React.PropTypes.number,
    correctCount: React.PropTypes.number,
    inCorrectCount: React.PropTypes.number,
    skippedCount: React.PropTypes.number,
    secondAttemptCount: React.PropTypes.number,
    rewardPoints: React.PropTypes.number,
    timeTaken: React.PropTypes.number,
    showScore: React.PropTypes.bool,
    isReviewMode: React.PropTypes.bool,
    submission: React.PropTypes.shape({
    }),
  }

  getQuestionDotColor = (pageNumber, submission, showScore, isReviewMode) => {
    if (submission !== undefined) {
      if (showScore) {
        const q = submission.answers.Questions[pageNumber - 1];
        if (!q.SecondAttemptCorrect) {
          q.SecondAttemptCorrect = 'N';
        }

        if (q.Skipped === 'N' || isReviewMode) {
          if (q.Correct === 'Y') {
            return '#14C81F';
          } else if (q.SecondAttemptCorrect === 'Y') {
            return '#FD7F20';
          }
          return '#DD0000';
        }
      } else {
        const q = submission.answers.Questions[pageNumber - 1];
        if (q.Skipped === 'N') {
          return '#666666'; // dark gray
        }
      }
    }
    return '#DEDEDE';
  }
  getQuestionFontColor = (pageNumber, submission, showScore, isReviewMode) => {
    if (submission !== undefined) {
      if (showScore) {
        const q = submission.answers.Questions[pageNumber - 1];
        if (!q.SecondAttemptCorrect) {
          q.SecondAttemptCorrect = 'N';
        }
        if (q.Skipped === 'N' || isReviewMode) {
          if (q.Correct === 'Y') {
            return '#14C81F';
          } else if (q.SecondAttemptCorrect === 'Y') {
            return '#FD7F20';
          }
          return '#DD0000';
        }
      } else {
        const q = submission.answers.Questions[pageNumber - 1];
        if (q.Skipped === 'N') {
          return '#666666'; // dark gray
        }
      }
    }
    return '#000000';
  }

  getPaginationElements(count, currentItem, submission, showScore, isReviewMode) {
    const paginationElement = [];
    for (let i = 1; i <= count; i++) {
      paginationElement.push(<WorksheetPageIndicator
        key={`page_${i}`}
        onSelectQuestion={this.props.onSelectQuestion}
        pageNumber={i}
        isCurrentPage={i === currentItem}
        dotColor={this.getQuestionDotColor(i, submission, showScore, isReviewMode)}
        numberColor={this.getQuestionFontColor(i, submission, showScore, isReviewMode)}
      />);
    }
    return paginationElement;
  }
  polaForQuestion = (submission, currentItem) => {
    if (submission && submission.pola_aggregated && currentItem > 0 && currentItem <= submission.pola_aggregated.length && submission.pola_aggregated[currentItem - 1]) {
      return submission.pola_aggregated[currentItem - 1];
    }
    return undefined;
  }
  render() {
    const { onPrevious, onNext, noOfQuestions, currentItem, submission, correctCount, inCorrectCount, secondAttemptCount, skippedCount, rewardPoints, timeTaken, showScore, isReviewMode } = this.props;
    const questionPOLA = this.polaForQuestion(submission, currentItem);
    let tallyBarClassName = 'o-worksheetMetaBar__tallyBar hide-section';
    if (showScore) {
      tallyBarClassName = 'o-worksheetMetaBar__tallyBar';
    }
    return (
      <div className="o-worksheetPageHeader">
        <div className="o-worksheetMetaBar">

          {!isReviewMode ?
            <div className="o-worksheetNavigator">
              <button onClick={onPrevious} className="b-flatBtn b-flatBtn--white o-worksheetNavigator__btn">
                <ArrowLeft />
              </button>
              <div className="o-worksheetNavigator__pages">
                {this.getPaginationElements(noOfQuestions, currentItem, submission, showScore, isReviewMode)}
              </div>
              <button onClick={onNext} className="b-flatBtn b-flatBtn--white o-worksheetNavigator__btn">
                <ArrowRight />
              </button>
            </div> :
            <WorksheetReviewNavigator
              noOfQuestions={noOfQuestions}
              currentItem={currentItem}
              submission={submission}
              onSelectQuestion={this.props.onSelectQuestion}
            />
          }

          <div className="o-worksheetMetaBar__stats">
            {
              <div className={tallyBarClassName}>
                <span className={`b-count b-count--correct b-toolTips ${!isReviewMode ? 'b-toolTips--bottomLeft' : 'b-toolTips--bottom'}`} data-tooltip={Localization.localizedStringForKey('Correct Answers')}>
                  {correctCount}
                </span>
                <span className="b-count  b-count--secondTry b-toolTips b-toolTips--bottom" data-tooltip={Localization.localizedStringForKey('Second Tries')}>
                  {secondAttemptCount}
                </span>
                {!isReviewMode ?
                  <span className="b-count b-count--skipped b-toolTips b-toolTips--bottom" data-tooltip={Localization.localizedStringForKey('Pending Questions')}>
                    {skippedCount}
                  </span> : ''}
                <span className={`b-count  b-count--incorrect b-toolTips ${!isReviewMode ? 'b-toolTips--bottom' : 'b-toolTips--bottomRight'}`} data-tooltip={Localization.localizedStringForKey('Incorrect Answers')}>
                  {inCorrectCount}
                </span>
              </div>
            }
            <div className="o-worksheetMetaBar__indicators">
              {showScore ?
                <div className="a-color(copy-2) b-count  b-count--points b-toolTips b-toolTips--bottom" data-tooltip="Reward Points">
                  {rewardPoints}
                </div> : ''
              }
              <div className="b-indicator o-worksheetMetaBar__indicatorsTimer">
                <Stopwatch />
                <span className="a-color(copy-2)">{moment.utc(timeTaken * 1000).format(`${timeTaken > 3600 ? 'HH.mm.ss' : 'mm:ss' }`)}</span>
              </div>
              {
                this.props.showTripplePoint ? <div className="b-indicator">
                <img height="20" src={require("../../../static/images/3stars.png")}/>
              </div> : ' '
              }
            </div>
          </div>

        </div>

        {(questionPOLA && questionPOLA.length > 0 && noOfQuestions > 0) ? <WorksheetPOLA onPolaPlayClicked={this.props.onPolaPlayClicked} questionPOLA={questionPOLA} /> : ''}

      </div>
    );
  }
}

export default WorksheetPageHeader;
