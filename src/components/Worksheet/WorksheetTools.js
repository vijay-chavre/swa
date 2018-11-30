import React, { Component } from 'react';
import WorksheetPageIndicator from './WorksheetPageIndicator';
import ScribbleIcon from '../Shared/Glyphs/ScribbleIcon';
import EraserIcon from '../Shared/Glyphs/EraserIcon';
import Garbage from '../Shared/Glyphs/Garbage';
import AudioSpeaker from '../Shared/Glyphs/AudioSpeaker';
import * as Localization from '../Shared/Localization';


class WorksheetTools extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
    }),
    onSubmit: React.PropTypes.func,
    showSubmit: React.PropTypes.bool,
    showAudioNotes: React.PropTypes.bool,
    onToggleScribble: React.PropTypes.func,
    onToggleErase: React.PropTypes.func,
    onToggleGarbage: React.PropTypes.func,
    onSelectQuestion: React.PropTypes.func,
    isScribbleActive: React.PropTypes.bool,
    isEraseOn: React.PropTypes.bool,
    isGarbageOn: React.PropTypes.bool,
    studentId: React.PropTypes.string,
    showErase: React.PropTypes.bool,
    showScribble: React.PropTypes.bool,
    showClearAll: React.PropTypes.bool,
    showReadOut: React.PropTypes.bool,
    readOutText: React.PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      isReadOutPlaying: false,
    };
  }

  componentWillUnmount() {
    this.stopReadOutPlaying();
  }

  getPaginationElements(count, currentPage) {
    const paginationElement = [];
    for (let i = 1; i <= count; i++) {
      paginationElement.push(<WorksheetPageIndicator
        onSelectQuestion={this.props.onSelectQuestion}
        pageNumber={i}
        isCurrentPage={i === currentPage}
      />);
    }
    return paginationElement;
  }

  createSpeech = () => {
    const options = {
      text: '',
      volume: 0.6,
      rate: 0.6,
      pitch: 1.5,
      lang: 'en-GB',
      voice: 'Daniel',
    };
    const speech = new SpeechSynthesisUtterance();

    speech.text = this.props.readOutText;
    speech.volume = options.volume;
    speech.rate = options.rate;
    speech.pitch = options.pitch;
    speech.lang = options.lang;
    speech.voiceURI = 'native';
    return speech;
  }

  playReadOut = () => {
    if (window.speechSynthesis.speaking) {
      this.stopReadOutPlaying();
      return;
    }
    this.speech = this.createSpeech();
    this.speech.onend = () => {
      this.stopReadOutPlaying();
    };
    window.speechSynthesis.speak(this.speech);
    this.setState({ isReadOutPlaying: true });
    dataLayer.push({
      event: 'contentInteraction',
      eventName: 'Hear This Question',
      timer: 735,
    });
  }

  stopReadOutPlaying = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    this.setState({ isReadOutPlaying: false });
  }
  render() {
    const { onToggleScribble, isScribbleActive, onSubmit, showSubmit, showAudioNotes, isEraseOn, onToggleErase, isGarbageOn, onToggleGarbage, studentId, showErase, showScribble, showClearAll, showReadOut } = this.props;
    const scribbleOnOffStyle = isScribbleActive ? 'b-iconBtn--toggleOn' : 'b-iconBtn a-glyph';
    const eraseOnOffStyle = isEraseOn ? 'b-iconBtn--toggleOn' : 'b-iconBtn a-glyph';
    const garbageOnOffStyle = isGarbageOn ? 'b-iconBtn--toggleOn' : 'b-iconBtn a-glyph';
    const readOutIconStyle = this.state.isReadOutPlaying ? `b-iconBtn b-iconBtn--toggleOn b-toolTips ${showScribble ? 'b-toolTips--top' : 'b-toolTips--topLeft'}` : `b-iconBtn b-toolTips ${showScribble ? 'b-toolTips--top' : 'b-toolTips--topLeft'} o-worksheetTools__btn b-iconBtn a-glyph`;
    return (
      <div className="o-worksheetTools">

        {showSubmit ?
          <button
            onClick={onSubmit}
            className="b-flatBtn b-flatBtn--active-3 o-worksheetNavigator__btn o-worksheetNavigator__submit"
          >
            <span className="b-button__label">{Localization.localizedStringForKey('Submit Answer')}</span>
          </button> : ''}

        {showAudioNotes ?
          <button className="b-flatBtn o-worksheetNavigator__btn o-worksheetNavigator__audio">
            <AudioSpeaker />
            <span className="b-button__label">
              Listen to Audio Notes
            </span>
          </button> : ''}
        {showScribble ?
          <button
            onClick={onToggleScribble}
            type="button" className={`b-iconBtn b-toolTips b-toolTips--topLeft o-worksheetTools__btn ${scribbleOnOffStyle}`} data-tooltip="Toggle Scribbles Mode"
          >
            <ScribbleIcon />
          </button> : ''
        }
        {showErase ?
          <button
            onClick={onToggleErase}
            type="button" className={`b-iconBtn b-toolTips b-toolTips--top o-worksheetTools__btn ${eraseOnOffStyle}`} data-tooltip="Toggle Eraser Mode"
          >
            <EraserIcon color={isEraseOn ? '#FFFFFF' : '#99A3A6'} />
          </button> : ''
        }

        {showReadOut ?
          <button className={readOutIconStyle} data-tooltip="Hear this question read aloud" onClick={() => this.playReadOut()}>
            <AudioSpeaker />
          </button>
          : ''
        }
        {showClearAll ?
          <button
            onClick={onToggleGarbage}
            type="button" className={`b-iconBtn b-toolTips b-toolTips--top o-worksheetTools__btn ${garbageOnOffStyle}`} data-tooltip="Clear All Scribbles"
          >
            <Garbage color={isGarbageOn ? '#FFFFFF' : '#99A3A6'} />
          </button> : ''
        }

      </div>
    );
  }
}

export default WorksheetTools;
