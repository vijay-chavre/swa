import React, { Component } from 'react';
import paperjs from 'paper';

import * as Event from '../../constants/event';

export default class ScribbleLayer extends Component {
  static propTypes = {
    // Events Props - Change to Generic Pattern
    createPolaEvent: React.PropTypes.func,

    studentScribble: React.PropTypes.shape({
    }),
    canDraw: React.PropTypes.bool,
    isEraseOn: React.PropTypes.bool,
    showScribble: React.PropTypes.bool,
    teacherScribble: React.PropTypes.shape({
    }),
    questionNumber: React.PropTypes.number,
    submissionId: React.PropTypes.string,
    studentId: React.PropTypes.string,
    clearAllScribble: React.PropTypes.bool,
    onScribbleDrawn: React.PropTypes.func,
    isReviewMode: React.PropTypes.bool,
  }

  componentDidMount() {
    this.Scribbles = [];
    this.studentScribble = [];
    this.teacherScribble = [];
    this.scribbleIndex = 0;
    this.scribblePointIndex = 0;
    this.currentPlaybackTime = 0;
    this.scribbleStartTime = 0;
    this.playerStartTime = 0;
    this.tempPoints = {};
    this.scaleFactor = 1;
    if (!this.paper) {
      this.paper = new paperjs.PaperScope();
      this.paper.setup(this.canvas);
      this.paper.view.play();
      this.forceUpdate();
    }
    this.compoundPath = new this.paper.CompoundPath();
    if (this.props.canDraw) {
      this.initDrawing();
    }
    this.paper.view.setViewSize(new this.paper.Size(this.canvas.clientWidth, this.canvas.clientHeight));
    // this.scribbles = [];
    this.studentScribble = this.props.studentScribble;
    this.teacherScribble = this.props.teacherScribble;
    this.redrawScribbles();
    window.addEventListener('resize', () => {
      this.paper.view.scale(1 / this.paper.view.getZoom(), this.paper.view.bounds.topLeft);
      if (this.compoundPath.strokeBounds && this.compoundPath.strokeBounds.width) {
        let widthScaleFactor = 1;
        const heightScaleFactor = 1;
        if (window.innerWidth < this.compoundPath.strokeBounds.width + 500) {
          widthScaleFactor = window.innerWidth / (this.compoundPath.strokeBounds.width + 500);
        }
        if (this.props.isReviewMode) {
          if (widthScaleFactor < heightScaleFactor) {
            this.paper.view.setViewSize(new this.paper.Size(window.innerWidth, window.innerHeight));
            this.paper.view.scale(widthScaleFactor, this.paper.view.bounds.topLeft);
          }
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if ((this.props.questionNumber !== nextProps.questionNumber) || this.props.clearAllScribble) {
      this.Scribbles = [];
      this.studentScribble = nextProps.studentScribble;
      this.teacherScribble = nextProps.teacherScribble;
      this.redrawScribbles();
    }
    // this.canvas.getContext('2d').scale(1.5, 1.5);
    if (this.props.canDraw !== nextProps.canDraw) {
      this.initDrawing(nextProps.canDraw);
    }
  }

  playScribbles() {
    this.scribbleIndex = 0;
    this.scribblePointIndex = 0;
    this.paper.project.activeLayer.removeChildren();
    const scribble = this.studentScribble.Scribbles[this.scribbleIndex].Scribble;
    this.scribbleStartTime = scribble.points[this.scribblePointIndex].time;
    this.playerStartTime = new Date().getTime();
    window.requestAnimationFrame(this.drawWithAnimation);
  }

  drawWithAnimation = () => {
    const transformPoint = new this.paper.Point(this.compoundPath.strokeBounds.x, this.compoundPath.strokeBounds.y);
    // this.currentPlaybackTime += 1;
    const scribble = this.studentScribble.Scribbles[this.scribbleIndex].Scribble;
    if (!scribble) {
      return;
    }
    const x = scribble.points[this.scribblePointIndex].x;
    const y = scribble.points[this.scribblePointIndex].y;
    const time = scribble.points[this.scribblePointIndex].time;
    if ((new Date().getTime() - this.playerStartTime) < (time - this.scribbleStartTime)) {
      window.requestAnimationFrame(this.drawWithAnimation);
      return;
    }
    if (this.scribblePointIndex === 0) {
      this.path = new this.paper.Path({
        strokeColor: '#6666cc',
        strokeWidth: 2,
      });
      // this.path.translate(new this.paper.Point(-(transformX), -(transformY)));
    }

    if (scribble && scribble.isEraseOn === 'YES') {
      this.path.strokeColor = 'white';
      this.path.blendMode = 'destination-out';
      this.path.strokeWidth = 60;
    }
    this.path.add(new this.paper.Point(x, y).subtract(transformPoint));

    this.scribblePointIndex += 1;
    if (this.scribblePointIndex > scribble.points.length - 1) {
      this.path.simplify(1);
      // this.path.translate(new this.paper.Point(-(transformX), -(transformY)));
      this.scribblePointIndex = 0;
      this.scribbleIndex += 1;
      if (this.scribbleIndex < this.studentScribble.Scribbles.length) {
        window.requestAnimationFrame(this.drawWithAnimation);
      } else {
        this.onPlayCompleted();
      }
    } else {
      window.requestAnimationFrame(this.drawWithAnimation);
    }
  }

  onPlayCompleted = () => {
    if (this.teacherScribble) {
      this.drawScribbles(this.teacherScribble.Scribbles, 'red');
    }
  }

  requestAnimFrame = () => window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
              window.setTimeout(callback, 1000 / 60);
            }

  drawScribbles(scribbles, color) {
    const transformX = this.compoundPath.strokeBounds.x;
    const transformY = this.compoundPath.strokeBounds.y;
    for (const scribbleIndex in scribbles) {
      const scribble = scribbles[scribbleIndex].Scribble;
      this.Scribbles.push(scribbles[scribbleIndex]);
      this.path = new this.paper.Path({
        strokeColor: color,
        strokeWidth: 2,
      });
      if (scribble && scribble.isEraseOn === 'YES') {
        this.path.strokeColor = 'white';
        this.path.blendMode = 'destination-out';
        this.path.strokeWidth = 60;
      }
      for (const pointIndex in scribble.points) {
        const point = scribble.points[pointIndex];
        this.path.add(new this.paper.Point(point.x, point.y));
      }
      this.path.simplify(1);
      // this.path.scale(0.5);
      this.path.translate(new this.paper.Point(-(transformX), -(transformY)));
    }
    // var rectangle = new Rectangle(new Point(20, 20), new Size(60, 60));
    // var path = new Path.Rectangle(rectangle);
    // this.path = new this.paper.Path.Rectangle(new this.paper.Rectangle(this.compoundPath.strokeBounds));
    // this.path.strokeColor = 'black';
    // this.path.strokeWidth = 4;
  }

  getScribbles() {
    return this.Scribbles;
  }

  removeDrawing() {
    this.path.view.off();
  }
  redrawScribbles(scaleFactor) {
    this.compoundPath.removeChildren();
    const { onScribbleDrawn } = this.props;
    this.paper.project.activeLayer.removeChildren();
    if (this.studentScribble && this.studentScribble.Scribbles) {
      this.drawScribbles(this.studentScribble.Scribbles, '#6666cc');
    }
    if (this.teacherScribble && this.teacherScribble.Scribbles) {
      this.drawScribbles(this.teacherScribble.Scribbles, 'red');
    }
    onScribbleDrawn();
  }

  addScribbleToCompoundPath(scribbleObj) {
    const scribble = scribbleObj.Scribble;
    let hasNegativePoint = false;
    this.path = new this.paper.Path({
      segments: scribble.points.map((point) => {
        if (point.y < 0) {
          hasNegativePoint = true;
        }
        return [point.x, point.y];
      }),
      strokeWidth: 2,
    });
    if (!hasNegativePoint) {
      this.compoundPath.addChild(this.path);
    }
  }

  initDrawing() {
    this.path = null;
    this.paper.view.onMouseDown = (event) => {
      // If we produced a path before, deselect it:
      if (this.path) {
        // this.path.selected = false;
      }
      this.tempPoints[`${event.point.x}_${event.point.y}`] = new Date().getTime();
      // Create a new path and set its stroke color to black:
      this.path = new this.paper.Path({
        segments: [event.point],
        strokeColor: '#6666cc',
        strokeWidth: 2,
      });
      this.currentScribble = {
        canvasHeight: this.canvas.clientHeight,
        canvasWidth: this.canvas.clientWidth,
        color: '0.000000;0.000000;1.000000;1.000000',
        isEraseOn: this.props.isEraseOn ? 'YES' : 'NO',
        points: [],
        stroke: 2,
        startTime: new Date().getTime(),
        version: '2.0',
      };
      if (this.props.isEraseOn) {
        this.path.strokeColor = 'white';
        this.path.blendMode = 'destination-out';
        this.path.strokeWidth = 60;
      }
      this.canvas.style.display = 'none';
      try {
        let x, y;
        const originalEvent = event.event;
        if (originalEvent instanceof MouseEvent) {
          x = originalEvent.clientX;
          y = originalEvent.clientY;
        } else if (originalEvent instanceof TouchEvent) {
          x = originalEvent.pageX;
          y = originalEvent.pageY;
        }
        const elementAtEvent = document.elementFromPoint(x, y);
        
        if (elementAtEvent.className.indexOf("mq-root-block") > -1) {
          const textAreaSpan = elementAtEvent.previousSibling;
          console.log(textAreaSpan.firstChild);
          textAreaSpan.firstChild.click();
          textAreaSpan.firstChild.focus();
        } else {
          elementAtEvent.focus();
          elementAtEvent.click();
        }
        // console.log(document.elementFromPoint(x, y));
        // const clozeText = elementAtEvent.querySelector('textarea');
        // console.log(clozeText);
        // if (clozeText) { 
        //   clozeText.focus();
        // }
      } catch(e) {
        console.log(e);
      }
      this.canvas.style.display = '';
      //this.canvas.style.pointerEvents = 'auto';

      // Fire Event
      if (this.props.isEraseOn) {
        // Start Erase
        this.props.createPolaEvent({ source: 'onMouseDown',
          studentId: this.props.studentId,
          questionNumber: this.props.questionNumber + 1,
          submissionId: this.props.submissionId,
          eventType: Event.POLA_ERASE });
      } else {
        this.props.createPolaEvent({ source: 'onMouseDown',
          studentId: this.props.studentId,
          questionNumber: this.props.questionNumber + 1,
          submissionId: this.props.submissionId,
          eventType: Event.POLA_SCRIBBLE });
      }
    };

    this.paper.view.onMouseDrag = (event) => {
      this.tempPoints[`${event.point.x}_${event.point.y}`] = new Date().getTime();
      this.path.add(event.point);
    };

    this.paper.view.onMouseUp = () => {
      // When the mouse is released, simplify it:
      this.path.simplify(1);
      this.path.segments.forEach((segment) => {
        this.currentScribble.points.push({
          time: this.tempPoints[`${segment.point.x}_${segment.point.y}`],
          x: segment.point.x,
          y: segment.point.y,
        });
      });
      this.currentScribble.endTime = new Date().getTime();
      this.Scribbles.push({ Scribble: this.currentScribble });
      // Select the path, so we can see its segments:
      // this.path.fullySelected = true;

      // Fire Event
      // Fire Event
      if (this.props.isEraseOn) {
        // Start Erase
        this.props.createPolaEvent({ source: 'onMouseUp',
          studentId: this.props.studentId,
          questionNumber: this.props.questionNumber + 1,
          submissionId: this.props.submissionId,
          eventType: Event.POLA_ERASE_END });
      } else {
        this.props.createPolaEvent({ source: 'onMouseUp',
          studentId: this.props.studentId,
          questionNumber: this.props.questionNumber + 1,
          submissionId: this.props.submissionId,
          eventType: Event.POLA_SCRIBBLE_END });
      }
    };
  }

  render() {
    const zIndex = this.props.showScribble ? 100 : 1;
    return (
      <canvas
        id="canvas"
        className="o-worksheet__scribbles"
        style={{ zIndex }}
        ref={(c) => { this.canvas = c; }}
      />
    );
  }
}
