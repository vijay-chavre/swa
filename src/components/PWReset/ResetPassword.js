import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import lodash from 'lodash';
import moment from 'moment';

import ParentNav from '../Shared/ParentNav';
import * as CredentialActions from '../../actions/credentials';
import * as UserActions from '../../actions/user';

import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

export class ResetPassword extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const fpt = this.props.location.query.fpt;
    const guid = this.props.location.query.guid;
    if (fpt && guid && this.props.user) {
      if (this.props.user.forgotPasswordToken == fpt && guid == this.props.user._id) {
        this.setState({ fptVerified: true });
      } else { this.setState({ fptVerified: false }); }
    } else {
      this.setState({ fptVerified: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && (nextProps.credentials.updatedPassword || nextProps.credentials.updatePasswordFailed)) {
      this.setState({ showResetModal: true });
    }
  }

  resetPassword(e) {
    const { updatePassword } = this.props;

    if (this.state && this.state.pwd && this.state.pwdRepeat && this.state.pwd === this.state.pwdRepeat && this.state.pwd.length >= 6) {
      updatePassword({ pwd: this.state.pwd, fpt:this.props.location.query.fpt, userId: this.props.location.query.guid });
    } else {
      if (this.state.pwd === '' || this.state.pwd == null) {
        this.setState({ newPwdMissing: true });
      }

      if (this.state.pwdRepeat === '' || this.state.pwdRepeat == null) {
        this.setState({ repeatPwdMissing: true });
      }

      if (this.state.pwd !== this.state.pwdRepeat) {
        this.setState({ mismatchingPwd: true });
      }

      if (this.state.pwd && this.state.pwd.length < 6) {
        this.setState({ lengthOfPwdLess: true });
      }
    }
  }

  backToPlansSection(e) {
    browserHistory.push('/plans');
  }

  backToResetPassword(e) {
    browserHistory.push('/reset');
  }

  render() {
    const { student } = this.props;
    return (
      <div>
        {/*
          BEGIN MODAL FOR SUCCESS DIALOG
        */}
        <div className={`o-modal o-modal--${this.state.showResetModal ? 'show' : 'hide'}`}>
          {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

          <div className="o-modal__box o-modal__box--dialog">
            <p className="a-p(14)">
              {this.props.credentials && this.props.credentials.updatedPassword ?
                Localization.localizedStringForKey('Password reset complete.') : ''
              }
              {this.props.credentials && this.props.credentials.updatePasswordFailed ?
                this.props.credentials.error : ''
              }

            </p>

            <div className="o-modal__actions">
              <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={(this.props.credentials && this.props.credentials.updatePasswordFailed ? this.backToResetPassword.bind(this) : this.backToPlansSection.bind(this))}>
                <span className="b-button__label">
                  {Localization.localizedStringForKey('OK')}
                </span>
              </button>
            </div>
          </div>
        </div>
        {/*
        END MODAL FOR SUCCESS DIALOG
        */}

        <header className="o-appHeader">

          {config.isViaAfrika ?
            <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
              <img width="200px" src={`/images/${config.appBannerLogo}`} />
            </div> :
            <Link to="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
              <ThinksterLogomark />
              <ThinksterWordmark />
            </Link>
          }

          <ul className="o-appHeader__actions">
            <li className="o-appHeader__actionItem o-appHeader__profile">
              <div className="o-appHeader__profileName" title="Parent Settings">
                {Localization.localizedStringForKey('Parent Settings')}
              </div>
              <img className="b-avatar b-avatar--size(32) o-appHeader__profilePortrait" src="/images/glyph-parent-setting.svg" type="image/png" />
            </li>
          </ul>

        </header>

        <div className="a-appView a-appView--altBG a-appView--hasSidebar">
          <div className="a-appView__contents">
            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.credentials && this.props.credentials.updatePassword ? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                  - Use className 'o-modal--hide' to hide modal
                  - Use className 'o-modal--show' to show modal
                */}
              <LoadingSpinner />
            </div>
            {/*
              BEGIN ADD STUDENT WIZARD
              */}

            <div className="a-container">
              <header className="a-viewHeader">
                <h1 className="a-h(28)">
                  Reset Password
                  </h1>
              </header>
            </div>

            {/*
              END ADD STUDENT WIZARD
              */}
            <div className="a-container">
              <div className="a-row a-justifyContent(center)">
                <div className="a-col a-col(2-3) a-col-med-1(1-2)">
                  <div className="o-studentForm">
                    <div className="o-studentForm__field">
                      <label className="b-formTextInput">
                        <input defaultValue={this.state.pwd} name="" placeholder="New Password" type="password" label="First Name" className="b-formTextInput__input " onChange={(e) => { this.setState({ pwd: e.target.value }); }} />
                      </label>
                      <label style={{ display: (this.state.newPwdMissing ? '' : 'none'), color: 'red'}}>
                        Please enter password<br />
                              </label>
                    </div>

                    <div className="o-studentForm__field">
                      <label className="b-formTextInput">
                        <input placeholder="Confirm Password" defaultValue={this.state.pwdRepeat} name="" type="password" label="Last Name" className="b-formTextInput__input " onChange={(e) => { this.setState({ pwdRepeat: e.target.value }); }} />
                      </label>
                      <label style={{ display: (this.state.repeatPwdMissing ? '' : 'none'), color: 'red'}}>
                        Please confirm password<br />
                              </label>
                    </div>
                    <label style={{ display: (this.state.mismatchingPwd ? '' : 'none'), color: 'red'}}>
                      Passwords do not match<br />
                            </label>
                    <label style={{ display: (this.state.lengthOfPwdLess ? '' : 'none'), color: 'red'}}>
                      Please enter at least 6 characters<br />
                            </label>
                    <div className="o-studentForm__action">
                      <button type="button" className="b-flatBtn b-flatBtn--w(180) b-flatBtn--gradient(active-1)" onClick={this.resetPassword.bind(this)}>
                        <span className="b-button__label">
                          Reset Password
                                </span>
                      </button>
                    </div>
                    <br />
                    <label style={{ display: (!this.state.fptVerified ? 'none' : 'none'), color: 'red' }}>
                      Password token not valid. Please request a new <Link to="/reset">reset</Link> mail.
                    </label>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />

        </div>


      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  loading: state.loading,
  credentials: state.credentials,
});

const actionCreators = {
  updatePassword: CredentialActions.updatePassword,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ResetPassword);
