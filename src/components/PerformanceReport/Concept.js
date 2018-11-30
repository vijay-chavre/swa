import React, { Component } from 'react';
import { connect } from 'react-redux';

class Concept extends Component {

  static propTypes = {
    concept: React.PropTypes.shape({

    }),
  }

  getClassName() {
    const { concept } = this.props;
    const result = concept.result;
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
      }
      return className;
    }
    return 'o-matrixConcept';
  }

  render() {
    const { concept } = this.props;
    return (
      <div className={this.getClassName()}>
        <h2 className="o-matrixConcept__name">
          {concept.concept_name}
        </h2>
        <p className="o-matrixConcept__score">
          {concept.result ? concept.result[concept.result.length - 1].total_score_percentage + '%' : 'NA'}
        </p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
});

const actionCreators = {
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Concept);
