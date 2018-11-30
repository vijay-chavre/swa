import React, { Component } from 'react';
import { connect } from 'react-redux';

export default class ProgressLoader extends Component {

  static propTypes = {
    message: React.PropTypes.string,
  }
  render() {
    return (
      <div className="o-modal o-modal--show b-progressMeter__container">

        <div className="o-modal__box o-modal__box--small">
          <h1 className=" a-h(18)">
            {this.props.message}
          </h1>

          <div className="b-progressMeter b-progressMeter--loading">
            <p className="a-p(14) a-color(copy-2) b-progressMeter__status">
              &nbsp;
            </p>
            <div className="b-progressMeter__meter">
              <div className="b-progressMeter__fillBar" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
