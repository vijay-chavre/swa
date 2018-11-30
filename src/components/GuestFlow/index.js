import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import * as SessionActions from '../../actions/session';
import { fetchGuestToken, clearGuestToken } from '../../actions/guestSession';

class GuestFlow extends Component {
  static propTypes = {
    logout: React.PropTypes.func,
    guestSession: React.PropTypes.shape({
    }),
    fetchGuestToken: React.PropTypes.func,
    clearGuestToken: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.props.logout();
    this.props.fetchGuestToken();
  }

  componentWillReceiveProps = (nextProps) => {
    const { guestSession } = nextProps;
    // redirecting to guest flow
    if (guestSession.token && guestSession.user_id) {
      browserHistory.push(`/sso?id=${guestSession.user_id}&token=${guestSession.token}` + (this.props.location.query.fromDemo ? '&fromDemo=1&tokenForDemo=' + this.props.location.query.token + '&userId=' + this.props.location.query.id : ''));
      return;
    }
    if (guestSession.error) {
      browserHistory.push('/');
      this.props.clearGuestToken();
      // clear guets flow error
    }
  }

  render() {
    return (
      <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
        <LoadingSpinner />
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  guestSession: state.guestSession,
  loading: state.loading,
});

const actionCreators = {
  logout: SessionActions.logout,
  fetchGuestToken,
  clearGuestToken,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(GuestFlow);
