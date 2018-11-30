import React, { Component } from 'react';
import { Link } from 'react-router';

export default class SubmittedChallengeNode extends Component {
  static propTypes = {
    session: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    submission: React.PropTypes.shape({
    }),
  }

  render() {
    const { submission, student } = this.props;
    return (
      <div className="a-col a-col(fluid)">
        <Link to={`/student/${student._id}/${submission._id}/summary`} className="o-challengeTile o-challengeTile--submitted">
          <div className="o-challengeTile__details">
            <p className="a-s(12) o-challengeTile__id">
              {(submission && submission.worksheet_meta) ? `#${submission.worksheet_meta.worksheet_number}` : ''}
            </p>
            <h1 className="a-h(20) o-challengeTile__title">
              {(submission && submission.worksheet_meta) ? submission.worksheet_meta.name : ''}
            </h1>
            <p className="a-p(12) o-worksheetTile__playlist">
              Thinkster Challenge
            </p>
            <p className="o-challengeTile__explainer">
              Great job on taking up the Thinkster challenge. You will be assigned a new problem next week - stay tuned!
            </p>
          </div>
        </Link>
      </div>
    );
  }
}
