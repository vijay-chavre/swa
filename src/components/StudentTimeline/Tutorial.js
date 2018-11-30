import React, { Component } from 'react';
import ArrowLeft from '../Shared/Glyphs/ArrowLeft';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import Close from '../Shared/Glyphs/Close';


export default class Tutorial extends Component {
  static propTypes = {
    show: React.PropTypes.bool,
    onCloseTutorial: React.PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      index: 1,
      currentTutorialClass: 'o-helpPoints -p1',
      totalTutorials: 8,
      toolTipIndex: -1,
    };
  }

  onSelectTutorial = (index) => {
    this.state.index = index;
    this.setState({ currentTutorialClass: `o-helpPoints -p${this.state.index}` });
  }
  onNext = () => {
    if (this.state.index < this.state.totalTutorials) {
      this.state.index = this.state.index + 1;
    } else {
      this.state.index = 1;
    }
    this.setState({ currentTutorialClass: `o-helpPoints -p${this.state.index}` });
  }
  onPrevious = () => {
    if (this.state.index > 1) {
      this.state.index = this.state.index - 1;
      this.setState({ currentTutorialClass: `o-helpPoints -p${this.state.index}` });
    }
  }
  pageNavigator = () => {
    const paginationElement = [];
    for (let i = 1; i <= this.state.totalTutorials; i++) {
      paginationElement.push(
        <span
          onClick={() => this.onSelectTutorial(i)}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => { this.setState({ toolTipIndex: i }); }}
          onMouseLeave={() => { this.setState({ toolTipIndex: -1 }); }}
          className={(this.state.index === i || this.state.toolTipIndex === i) ? 'o-worksheetNavigator__page o-worksheetNavigator__page--current' : 'o-worksheetNavigator__page'}
        >
          <span className="o-worksheetNavigator__pageMarker" />
        </span>
      );
    }
    return (
      <div className="o-worksheetNavigator__pages">
        {paginationElement}
      </div>
    );
  }

  render() {
    const { show } = this.props;
    const showStatus = show ? 'o-tutorial--show' : 'o-tutorial--hide';

    return (
      <div id="worksheet-tutorial" className={`o-tutorial ${showStatus}`}>
        <button
          onClick={this.props.onCloseTutorial}
          className="o-modal__closeBtn o-tutorial__closeBtn"
        >
          <Close />
        </button>
        <div className="o-tutorialNavigator">
          <div className="o-worksheetNavigator">
            <button className="b-flatBtn b-flatBtn--white o-worksheetNavigator__btn" onClick={this.onPrevious}>
              <ArrowLeft />
            </button>
            {this.pageNavigator()}
            <button className="b-flatBtn b-flatBtn--white o-worksheetNavigator__btn" onClick={this.onNext}>
              <ArrowRight />
            </button>
          </div>
        </div>

        <div className={this.state.currentTutorialClass}>
          <div className="o-helpPoint o-helpPoint--1">
            <div className="o-helpPoint__tip">
              Try out a set of sample questions. 
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--2">
            <div className="o-helpPoint__tip">
              Check how coaches grade your child’s work.
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--worksheets o-helpPoint--3">
            <div className="o-helpPoint__tip">
              Your child's dedicated coach assigns work appropriate for your child.
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--leaderboard o-helpPoint--4">
            <div className="o-helpPoint__tip">
              Students earn reward points on various positive behaviors in the program.
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--progress o-helpPoint--5">
            <div className="o-helpPoint__tip">
              The Progress matrix tracks student progress based on test attempts across the curriculum of a given grade.
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--videoLibrary o-helpPoint--6">
            <div className="o-helpPoint__tip">
              Get access to our video library that teaches various strategies to solve problems.
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--curriculum o-helpPoint--7">
            <div className="o-helpPoint__tip">
              World class curriculum designed to master basic skills as well as critical thinking skills, helping students excel above grade level and participate in Math contests
            </div>
          </div>
          <div className="o-helpPoint o-helpPoint--rewards o-helpPoint--8">
            <div className="o-helpPoint__tip">
              Students are motivated to stay active in the program by earning gift cards of their choice based on the accumulated reward points.
            </div>
          </div>
        </div>
      </div>
    );
  }
}
