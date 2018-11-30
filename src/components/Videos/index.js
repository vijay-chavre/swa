import React, { Component } from 'react';
import { connect } from 'react-redux';

class Videos extends Component {

  static propTypes = {
  }

  componentDidMount() {
  }

  render() {
    return (
      <div>
        Video Component
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
});

const actionCreators = {
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Videos);
