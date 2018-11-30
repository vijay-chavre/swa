import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Stopwatch from '../Shared/Glyphs/Stopwatch';
import ScribbleIcon from '../Shared/Glyphs/ScribbleIcon';
import Flag from '../Shared/Glyphs/Flag';
import AudioSpeaker from '../Shared/Glyphs/AudioSpeaker';
import CommentBubble from '../Shared/Glyphs/CommentBubble';
import * as Localization from '../Shared/Localization';

class QuestionsSummary extends Component {

  static propTypes = {
    className: React.PropTypes.string,
    studentId: React.PropTypes.string,
    assignmentId: React.PropTypes.string,
    hasStudentScribble: React.PropTypes.bool,
    hasTeacherScribble: React.PropTypes.bool,
    hasFlag: React.PropTypes.bool,
    flagComment: React.PropTypes.string,
    questionNumber: React.PropTypes.number,
    timeTaken: React.PropTypes.number,
    flagTeacherAudio: React.PropTypes.string,
    secondAttemptCorrect: React.PropTypes.string,
    isCorrect: React.PropTypes.bool,
  }
  render() {
    const { className, studentId, assignmentId, hasStudentScribble, hasTeacherScribble, hasFlag, flagComment, questionNumber, timeTaken, flagTeacherAudio, secondAttemptCorrect, isCorrect } = this.props;
    return (
      <div className="a-col a-col(1-3)">
        <Link to={`/student/${studentId}/${assignmentId}/review/summary/${questionNumber}`} className={`o-questionTile o-questionTile--${className}`}>
          {
            flagComment ? <div className="b-commentBadge b-toolTips b-toolTips--left b-toolTips--w(160) o-questionTile__commentBadge" data-tooltip={Localization.localizedStringForKey("Please check inside the worksheet and read your coach's feedback.")}>
              <CommentBubble />
            </div> : ''
          }
          <div className="o-questionTile__number">
            {questionNumber}
          </div>
          <div className="o-questionTile__answer">
            {isCorrect ? Localization.localizedStringForKey('Correct') : Localization.localizedStringForKey('Incorrect')}
          </div>

          <div className="o-questionTile__indicators">
            <div className="b-indicator b-indicator--copy-2 o-questionTile__indicatorsTimer">
              <Stopwatch />
              {moment.utc(timeTaken * 1000).format(`${timeTaken > 3600 ? 'HH.mm.ss' : 'mm:ss' }`)}
            </div>
            {
              hasStudentScribble ?
                <div className="b-indicator b-indicator--active-1b">
                  <ScribbleIcon />
                  {Localization.localizedStringForKey('Scribbles')}
                </div> : ''
            }
            {
              hasFlag ? <div className="b-indicator b-indicator--alert">
                <Flag />
                {Localization.localizedStringForKey('Flag raised')}
              </div> : ''
            }
            <p className="a-color(active-2) o-questionTile__indicator">
              {secondAttemptCorrect === 'Y' ? Localization.localizedStringForKey('2nd Try used') : ''}
            </p>
            {
              hasTeacherScribble ? <div className={'b-indicator b-indicator--active-1b'}>
                <ScribbleIcon />
                {Localization.localizedStringForKey("Coach's Scribbles")}
              </div> : ''
            }
            {
              flagTeacherAudio ? <div className={'b-indicator b-indicator--active-1b'}>
                <AudioSpeaker />
                {Localization.localizedStringForKey('Audible notes')}
              </div> : ''
            }
          </div>
        </Link>
      </div>
    );
  }
}

export default QuestionsSummary;
