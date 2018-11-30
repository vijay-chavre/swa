import React, { Component } from 'react';
import Video from '../Shared/Glyphs/Video';


class WorksheetPOLA extends Component {
  static propTypes = {
    questionPOLA: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {scribbleStartTime: 0, totalDuration: 0, progress: 0, playStartTime: 0};
  }

  componentDidMount() {
    this.calculateStartTime(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.calculateStartTime(newProps);
  }

  calculateStartTime(props) {
    const { questionPOLA } = props;
    let scribbleStartTime = 0;
    let totalDuration = 0.0;
    let scribbleStarted = false;
    questionPOLA.map((pola) => {
      if (pola.eventType && pola.duration && pola.duration > 0) {
        totalDuration += pola.duration;
        if (pola.eventType.toLowerCase() === 'scribble') {
          scribbleStarted = true;
        }
        if (!scribbleStarted) {
          scribbleStartTime += pola.duration;
        }
      }
    });
    this.setState({
      totalDuration, scribbleStartTime, progress: 0,
    })
  }

  polaGraphView = () => {
    const { questionPOLA } = this.props;
    const polaGraph = [];
    let graphClassName = '';
    let totalDuration = 0.0;
    if (questionPOLA) {
      questionPOLA.map((pola) => {
        if (pola.eventType && pola.duration && pola.duration > 0) {
          totalDuration += pola.duration;
        }
      });
      questionPOLA.map((pola) => {

        if (pola.eventType && pola.duration && pola.duration > 0) {
          if (pola.eventType.toLowerCase() === 'scribble') {
            graphClassName = 'o-worksheetPolaGraph__bar o-worksheetPolaGraph__bar--scribble';
          } else if (pola.eventType.toLowerCase() === 'video') {
            graphClassName = 'o-worksheetPolaGraph__bar o-worksheetPolaGraph__bar--selection';
          } else if (pola.eventType.toLowerCase() === 'erase') {
            graphClassName = 'o-worksheetPolaGraph__bar o-worksheetPolaGraph__bar--erase';
          } else if (pola.eventType.toLowerCase() === 'thinking') {
            graphClassName = 'o-worksheetPolaGraph__bar o-worksheetPolaGraph__bar--thinking';
          }
          const width = ((100.0 * pola.duration) / totalDuration);

          polaGraph.push(
            <div className={graphClassName} style={{ width: `${width}%` }} />
          );
        }
      });
    }
    return polaGraph;
  }

  onPlayClicked = (e) => {
    console.log('Pola play clicked');
    this.props.onPolaPlayClicked(e);
    this.setState({currentTime: this.state.scribbleStartTime, playStartTime: new Date().getTime()});
    window.requestAnimationFrame(this.updateProgress);
  }

  updateProgress = () => {
    let currentTime = this.state.scribbleStartTime + ((new Date().getTime() - this.state.playStartTime)/1000);
    let progress = currentTime/this.state.totalDuration*100;
    this.setState({
      progress,
    })
    if (currentTime < this.state.totalDuration) {
      window.requestAnimationFrame(this.updateProgress);
    }
  }

  render() {
    return (
      <div className="o-worksheetPOLAContainer">
        <div className="o-worksheetPOLA">
          <button onClick={this.onPlayClicked} className="o-worksheetPOLA__playBtn">
            <Video />
          </button>
          <div className="o-worksheetPOLA__keys">
            <p className="a-allCaps a-p(10) a-color(active-5)">
              Video
            </p>
            <p className="a-allCaps a-p(10) a-color(copy-2)">
              Erase
            </p>
            <p className="a-allCaps a-p(10) a-color(active-1b)">
              Scribble
            </p>
            <p className="a-allCaps a-p(10) a-color(active-3)">
              Thinking
            </p>
          </div>
          <div className="o-worksheetPolaGraph">
            <div className="o-worksheetPolaGraph__progress" style={{ width: this.state.progress+"%" }} />
            <div className="o-worksheetPolaGraph__bars">
              {this.polaGraphView()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WorksheetPOLA;
