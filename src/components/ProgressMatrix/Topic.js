import React, { Component } from 'react';
import Concept from './Concept';

export default class Topic extends Component {

  static propTypes = {
    topic: React.PropTypes.shape({
    }),
    onRequestWorksheets: React.PropTypes.func,
  }

  componentDidMount() {
  }

  render() {
    const { topic, onRequestWorksheets, testingPeriods, sliderValue } = this.props;
    return (
      <div>
        <section className="o-matrixTopic">
          <div className="o-matrixTopic__meta">
            <h1 className="o-matrixTopic__name">
              {topic.topic_name}
            </h1>
          </div>
          <div className="o-matrixTopic__concepts">
            {topic.concepts.map((concept) => <Concept key={concept.concept_id} concept={concept} testingPeriods={testingPeriods} sliderValue={sliderValue} onRequestWorksheets={onRequestWorksheets} />)}
          </div>
        </section>
      </div>
    );
  }
}
