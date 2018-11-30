import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, browserHistory } from "react-router";
import Helmet from "react-helmet";
import ResetForm from "./ResetForm";
import ThinksterLogomark from "../Shared/Glyphs/ThinksterLogomark";
import ThinksterWordmark from "../Shared/Glyphs/ThinksterWordmark";
import * as CredentialActions from "../../actions/credentials";
import errorAction from "../../actions/error";
import * as Localization from "../Shared/Localization";
import LoadingSpinner from "../Shared/Glyphs/LoadingSpinner";

class PWReset extends Component {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps &&
      (nextProps.credentials.resetPasswordComplete ||
        nextProps.credentials.resetPasswordFailed)
    ) {
      this.setState({ showResetModal: true });
    }
  }

  backToPlansSection(e) {
    browserHistory.push("/plans");
  }

  render() {
    return (
      <div className="o-login">
        <div className="o-loginBox">
          <Helmet
            title="Thinkster Math | Account Password Reset"
            meta={[
              {
                name: "description",
                content:
                  "Reset your Thinkster Math account password to access the student account and parent settings."
              }
            ]}
          />
          <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
            <ThinksterLogomark />
            <ThinksterWordmark />
            <p className="o-thinkster__tagline a-p(14) a-color(copy-2)">
              {Localization.localizedStringForKey(
                "Guided by Expert Coaches. Powered by AI."
              )}
            </p>
          </div>

          <ResetForm {...this.props} />

          <div
            className={`o-loadingScreenModal o-loadingScreenModal--${
              this.props.credentials && this.props.credentials.resetPassword
                ? "show"
                : "hide"
            }`}
          >
            {/* Loading screen animation notification
                  - Use className 'o-modal--hide' to hide modal
                  - Use className 'o-modal--show' to show modal
                */}
            <LoadingSpinner />
          </div>

          <div
            className={`o-modal o-modal--${
              this.state && this.state.showResetModal ? "show" : "hide"
            }`}
          >
            {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

            <div className="o-modal__box o-modal__box--dialog">
              <p className="a-p(14)">
                {this.props.credentials &&
                this.props.credentials.resetPasswordComplete
                  ? Localization.localizedStringForKey(
                      "Password reset mail sent. Please check your mail."
                    )
                  : ""}
                {this.props.credentials &&
                this.props.credentials.resetPasswordFailed
                  ? Localization.localizedStringForKey(
                      "Invalid email address. Please correct and retry."
                    )
                  : ""}
              </p>

              <div className="o-modal__actions">
                <button
                  type="button"
                  className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)"
                  onClick={this.backToPlansSection.bind(this)}
                >
                  <span className="b-button__label">
                    {Localization.localizedStringForKey("OK")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const actionCreators = {
  onError: errorAction,
  onSubmit: CredentialActions.resetPassword
};

const mapStateToProps = state => ({
  session: state.session,
  credentials: state.credentials
});

export default withRouter(connect(mapStateToProps, actionCreators)(PWReset));
