import React, { Component } from 'react';
import Concept from './Concept';

export default class Topic extends Component {

  static propTypes = {
    topic: React.PropTypes.shape({

    }),
  }

  componentDidMount() {
  }

  render() {
    const { topic } = this.props;
    return (
      <div>
        <section className="o-matrixTopic">
          <div className="o-matrixTopic__meta">
            <h1 className="o-matrixTopic__name">
              {topic.topic_name}
            </h1>
          </div>
          <div className="o-matrixTopic__concepts">
            {topic.concepts.map((concept) => <Concept key={concept.concept_id} concept={concept} />)}
          </div>
        </section>
      </div>
    );
  }
}
