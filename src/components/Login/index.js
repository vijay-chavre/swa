import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Link, withRouter, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import LoginForm from './LoginForm';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import FacebookLogo from '../Shared/Glyphs/FacebookLogo';
import GoogleLogo from '../Shared/Glyphs/GoogleLogo';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import Dialog from '../Shared/Dialog';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import * as SessionActions from '../../actions/session';
import { fetchGuestToken, clearGuestToken } from '../../actions/guestSession';
import errorAction from '../../actions/error';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';


class Login extends Component {

  static propTypes = {
    createSession: React.PropTypes.func,
    fetchGuestToken: React.PropTypes.func,
    clearGuestToken: React.PropTypes.func,
    session: React.PropTypes.shape({
    }),
    guestSession: React.PropTypes.shape({
    }),
    location: React.PropTypes.shape({
      query: React.PropTypes.shape({
      }),
    }),
  }
  constructor(props) {
    super(props);
    this.state = {
      showDialog: null,
      dialogMessage: undefined,
    };
  }
  componentDidMount() {
    window.Intercom('shutdown');
  }

  componentWillReceiveProps = (nextProps) => {
    const { location, session, guestSession } = nextProps;
    const nextPath = location.state ? location.state.nextPathname : '/';
    if (session.token !== null) {
      nextProps.router.replace(nextPath);
      return;
    }
    // redirecting to guest flow
    if (guestSession.token && guestSession.user_id) {
      nextProps.router.replace(`/sso?id=${guestSession.user_id}&token=${guestSession.token}`);
      return;
    }
    if (guestSession.error) {
      this.showGuestFlowSessionError();
      this.props.clearGuestToken();
      // clear guets flow error
    }
  }

  onAcceptDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '' });
  }

  startGuestFlow = () => {
    this.props.fetchGuestToken();
  }
  showGuestFlowSessionError = () => {
    this.setState({ showDialog: true, dialogMessage: 'Unable to load Guest Account. Please try later.' });
  }
  render() {
    return (
      <div className="o-login">
        <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
          {/* Loading screen animation notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}
          <LoadingSpinner />
        </div>
        <Dialog
          show={this.state.showDialog}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
        />
        <Helmet
          title="Thinkster Math | Account Login"
          meta={[
            {name:"description", content:"Login to your Thinkster Math account for access to the student account and parent settings."}
          ]}
        />
        <div className="o-loginBox">
          {config.isViaAfrika ?
            <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
              <img width="200px" src={`/images/${config.appLogo}`} />
            </div> :
            <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
              <ThinksterLogomark />
              <ThinksterWordmark />
              <p className="o-thinkster__tagline a-p(14) a-color(copy-2)">
                {Localization.localizedStringForKey('Guided by Expert Coaches. Powered by AI.')}
              </p>
            </div>}

          <LoginForm session={this.props.session} {...this.props} authenticationError={!!(this.props.session && this.props.session.error)} />

          {/* <div className="o-loginAlts">
            <div className="o-loginAlts__methods">
              <button className="o-loginAlts__method">
                <span className="b-flexBtn b-flexBtn--facebook">
                  <FacebookLogo />
                  <span className="b-button__label">
                    <span className="b-button__labelCompanion">
                      {Localization.localizedStringForKey('Log In with')}
                    </span>
                    <strong>Facebook</strong>
                  </span>
                </span>
              </button>
              <button className="o-loginAlts__method">
                <span className="b-flexBtn b-flexBtn--google">
                  <GoogleLogo />
                  <span className="b-button__label">
                    <span className="b-button__labelCompanion">
                      {Localization.localizedStringForKey('Log In with')}
                    </span>
                    <strong>Google</strong>
                  </span>
                </span>
              </button>
            </div>
          </div>*/}

          <div className="o-loginActions">
            {/* <p className="a-p(14) o-loginActions__link">
              <Link to="/reset" title="Reset Password" className="a-color(active-1b)">
                {Localization.localizedStringForKey('Password Reset')}
              </Link>
            </p>*/}
            {/* <p className="a-p(14) o-loginActions__link">*/}

            <p className="a-p(14) o-loginActions__link">
              <a href="/reset" className="a-color(active-1b)">
                {Localization.localizedStringForKey('Forgot Password?')}
              </a>
            </p>
            <p className="a-p(14) o-loginActions__link">
              <a href={config.isViaAfrika ? ENV.viaAfrikaEnrollURL : ENV.enrollURL} className="a-color(active-1b)">
                {Localization.localizedStringForKey('New User? Sign Up Today!')}
              </a>
            </p>

          </div>
          <Link className="o-loginBox__guest" onClick={() => this.startGuestFlow()}>
            {Localization.localizedStringForKey('Explore as Guest')}
            <ArrowRight />
          </Link>
        </div>
      </div>
    );
  }
}

const actionCreators = {
  onError: errorAction,
  onSubmit: SessionActions.submitLoginForm,
  createSession: SessionActions.createSession,
  fetchGuestToken,
  clearGuestToken,
};

const mapStateToProps = (state) => ({
  session: state.session,
  guestSession: state.guestSession,
  loading: state.loading,
});

export default withRouter(connect(
  mapStateToProps,
  actionCreators,
)(Login));
