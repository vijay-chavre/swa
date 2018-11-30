import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { createSession, validateToken, logout } from '../../actions/session';
import * as UserActions from '../../actions/user';
import { workflowCompleted } from '../../actions/studentWorkflow';


class SSO extends Component {

  static propTypes = {
    location: React.PropTypes.shape({
      query: React.PropTypes.shape({
        token: React.PropTypes.string,
        id: React.PropTypes.string,
        // fromDemo: React.PropTypes.bool,
      }),
    }),
    session: React.PropTypes.shape,
    createSession: React.PropTypes.func,
    logout: React.PropTypes.func,
    validateToken: React.PropTypes.func,
    workflowCompleted: React.PropTypes.func,
  }


  componentDidMount() {
    this.props.createSession({
      token: this.props.location.query.token,
      user_id: this.props.location.query.id,
      fromDemo: this.props.location.query.fromDemo,
    });
    this.props.validateToken({
      token: this.props.location.query.token,
      user_id: this.props.location.query.id,
    });
    this.props.fetchUser({ userId: this.props.location.query.id });
  }

  componentWillReceiveProps = (nextProps) => {
    const { session } = nextProps;
    const nextPath = this.getNextPath(nextProps);
    if (session.token !== null) {
      browserHistory.replace(nextPath);
    }
  }

  getNextPath(nextProps) {
    const { location } = nextProps;
    if (location.state) {
      return location.state.nextPathname;
    }
    if (nextProps.location.query.fromDemo) {
      return `/?fromDemo=1&token=${nextProps.location.query.tokenForDemo}&userId=${nextProps.location.query.userId}`;
    }
    if (nextProps.location.query.studentId) {
      const workflow = {};
      workflow.key = `wb_session_${nextProps.location.query.studentId}`;
      workflow.value = true;
      this.props.workflowCompleted(workflow);

      return `/student/${nextProps.location.query.studentId}`;
    }

    if (nextProps.location.query.go === 'tour') {
      return '/payment/5';
    }
    return '/';
  }

  render() {
    return (
      <div />
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
});

const actionCreators = {
  createSession,
  validateToken,
  workflowCompleted,
  logout,
  fetchUser: UserActions.fetchUser,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(SSO);
