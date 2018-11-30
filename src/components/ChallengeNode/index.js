import React, { Component } from 'react';
import { Link } from 'react-router';

export default class ChallengeNode extends Component {

  static propTypes = {
    assignment: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
  }

  render() {
    const { assignment, student } = this.props;
    const activityState = (assignment && assignment.state) ? assignment.state : 'initial';
    return (
      <div className="a-col a-col(fluid)">
        <Link className="o-challengeTile" to={`/student/${student._id}/attempt/${assignment.id}/${activityState}/preview`} >
          <div className="o-challengeTile__details">
            <p className="a-s(12) o-challengeTile__id">
              {(assignment && assignment.meta) ? `#${assignment.meta.worksheet_number}` : ''}
            </p>
            <h1 className="a-h(20) o-challengeTile__title">
              {assignment.meta.name}
            </h1>
            <p className="a-p(12) o-worksheetTile__playlist">
              Family Math Challenge
            </p>
            <p className="o-challengeTile__explainer">
              This is a family math challenge. These are special brain teasers that are meant to get your child thinking in different ways.
            </p>
            <p className="o-challengeTile__explainer">
              Can you solve it? Click on the worksheet to try.
            </p>
          </div>
        </Link>
      </div>
    );
  }
}
