import Slider from 'rc-slider';
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import 'rc-slider/assets/index.css';


export default class MMSlider extends Component {

  constructor(props) {
    super(props);
    this.marks = this.getMarks(props.testingPeriods);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.testingPeriods !== undefined && newProps.testingPeriods !== undefined)
    if (Object.keys(this.props.testingPeriods) !== Object.keys(newProps.testingPeriods))
    this.marks = this.getMarks(newProps.testingPeriods);
  }

  getMarks(testingPeriods) {
    var marks = {};
    var i = 1;
    testingPeriods = _.sortBy(testingPeriods, 'startDate');
    for(var testingPeriod in testingPeriods) {
      marks[i] = ""+moment(testingPeriods[testingPeriod].endDate).format("DD-MMM-YYYY");
      i++;
    }

    return marks;
  }

  render() {
    return <Slider min={1} max={Object.keys(this.marks).length} onAfterChange={this.props.onChange} defaultValue={Object.keys(this.marks).length} marks={this.marks} />;
  }
}
