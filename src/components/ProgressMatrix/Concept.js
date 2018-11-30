import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import ExamIcon from '../Shared/Glyphs/ExamIcon';
import AddIcon from '../Shared/Glyphs/AddIcon';
import Checkmark from '../Shared/Glyphs/Checkmark';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';


class Concept extends Component {

  static propTypes = {
    concept: React.PropTypes.shape({
    }),
    onRequestWorksheets: React.PropTypes.func,
    student: React.PropTypes.shape({
    }),
    testingPeriods: React.PropTypes.shape({
    }),
    sliderValue: React.PropTypes.number,
  }

  getClassName() {
    console.log(this.props.sliderValue);
    const { concept } = this.props;
    const testingPeriodKeys = Object.keys(this.props.testingPeriods);
    const currentTestingPeriodId = testingPeriodKeys[this.props.sliderValue - 1];
    const sliderEndDate = this.props.testingPeriods[currentTestingPeriodId] ? this.props.testingPeriods[currentTestingPeriodId].endDate : null;
    console.log(sliderEndDate);
    const result = _.filter(concept.result, (o) => moment(o.end_date) <= moment(sliderEndDate));
    if (result !== undefined && result.length > 0) {
      const score = result[result.length - 1].total_score_percentage;
      let className = 'o-matrixConcept';

      if (result[result.length - 1].is_implied) {
        if (score > 60 && score < 90) {
          className += ' o-matrixConcept--medium';
          if (result[result.length - 1].contains_review_worksheet) {
            className += ' o-matrixConcept--hasReviewWorksheet';
          }
        } else if (score >= 90) {
          className += ' o-matrixConcept--high';
          if (result[result.length - 1].contains_review_worksheet) {
            className += ' o-matrixConcept--hasReviewWorksheet';
          }
        } else {
          className += ' o-matrixConcept--na';
        }
      } else if (score < 30) {
        className += ' o-matrixConcept--low';
        if (result[result.length - 1].contains_review_worksheet) {
          className += ' o-matrixConcept--hasReviewWorksheet';
        }
      } else if (score < 60) {
        className += ' o-matrixConcept--mediumLow';
        if (result[result.length - 1].contains_review_worksheet) {
          className += ' o-matrixConcept--hasReviewWorksheet';
        }
      } else if (score < 90) {
        className += ' o-matrixConcept--medium';
        if (result[result.length - 1].contains_review_worksheet) {
          className += ' o-matrixConcept--hasReviewWorksheet';
        }
      } else if (score >= 90) {
        className += ' o-matrixConcept--high';
        if (result[result.length - 1].contains_review_worksheet) {
          className += ' o-matrixConcept--hasReviewWorksheet';
        }
      } else {
        className += ' o-matrixConcept--na';
      }
      return className;
    }
    return 'o-matrixConcept o-matrixConcept--na';
  }

  render() {
    const { concept, onRequestWorksheets, student, testingPeriods, sliderValue } = this.props;
    return (
      <div className={this.getClassName()}>
        <h2 className="o-matrixConcept__name">
          {concept.concept_name}
        </h2>
        { (Common.authorized(student, features.REQUEST_WORKSHEET)) ?
          <div className="o-matrixConcept__requestWS">
            <button onClick={() => { onRequestWorksheets(concept); }} type="button" className="b-button b-button--w(128)">
              <div className="o-matrixConcept__requestWSIcon">
                <AddIcon />
              </div>
              <p className="b-button__label">
                {Localization.localizedStringForKey('Request Worksheets')}
              </p>
            </button>
          </div> : ''
        }
        {/*
        BEGIN REQUESTED STATE

        <div className="o-matrixConcept__requestWS o-matrixConcept__requestWS--activated">
          <Checkmark />
          <p>
            Requested
          </p>
        </div>
        {/*
        END REQUESTED STATE
        */}
        <p className="o-matrixConcept__score">
          {concept.result && concept.result[concept.result.length - 1] ? `${concept.result[concept.result.length - 1].total_score_percentage  }%` : 'NA'}
        </p>
        <div className="o-matrixConcept__reviewWSFlag">
          <ExamIcon />
        </div>
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
});

const actionCreators = {
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Concept);
