import React, { Component } from 'react';
import moment from 'moment';
import browser from 'detect-browser';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import CreditCardIcon from './Glyphs/CreditCardIcon';
import DiplomaIcon from './Glyphs/DiplomaIcon';
import KeyholeIcon from './Glyphs/KeyholeIcon';
import ProfileIcon from './Glyphs/ProfileIcon';
import ToolsIcon from './Glyphs/ToolsIcon';
import ReferFriendIcon from './Glyphs/ReferFriendIcon';
import Support from './Glyphs/Support';
import PasswordResetIcon from './Glyphs/PasswordResetIcon';
import CheckReferralIcon from './Glyphs/CheckReferralIcon';
import * as Localization from '../Shared/Localization';
import Dialog from '../Shared/Dialog';
import SupportDialog from '../Shared/SupportDialog';
import config from '../../constants/config';
import * as SessionActions from '../../actions/session';

class ParentNav extends Component {

  static propTypes = {
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
  }
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      dialogHTML: '',
      dialogMessage: '',
      dialogAcceptButtonLabel: undefined,
      showSupportDialog: false,
    };
  }

  componentDidMount() {
    const { user } = this.props;

    if (!window._sqh || (window._sqh && window._sqh.length == 0)) {
      window._sqh = [];
      window._sqh.push(['init', {
        tenant_alias: ENV.REFERRALSAASQUATCH_TENANT_ALIAS,
        account_id: user._id,
        payment_provider_id: null,
        user_id: user._id,
        email: user.email_address,
        first_name: user.first_name,
        last_name: user.last_name,
        locale: user.country_code ? `en_${user.country_code}` : 'en_US',
      }]);

      (function () {
        function l() {
          const s = document.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = `${location.protocol}//d2rcp9ak152ke1.cloudfront.net/assets/javascripts/squatch.min.js`;
          const t = document.getElementsByTagName('script')[0];
          t.parentNode.insertBefore(s, t);
        }
        // if (window.attachEvent) {
        //   window.attachEvent('onload', l);
        // } else {
        //   window.addEventListener('load', l, false);
        // }
        l();
      }()
      );
    }
  }


  onSupport = () => {
    this.setState({ showSupportDialog: true });
  }

  onSupportDialogClose = () => {
    this.setState({ showSupportDialog: false, dialogMessage: '' });
  }

  onSupportDialogSubmit = (success) => {
    this.setState({ showSupportDialog: false, dialogMessage: '' });
    if (success) {
      this.setState({ showDialog: true, dialogMessage: 'Your query has been successfully submitted.' });
    } else {
      this.setState({ showDialog: true, dialogMessage: 'Error in sending the query. Please try later.' });
    }
  }

  onAcceptDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '', dialogAcceptButtonLabel: undefined });
  }

  supportTicketForOption = (option) => {
    const { student, user } = this.props;
    const ticket = {};
    ticket.body = `Profile ID: ${this.state.studentId}
            Profile Name: ${student.first_name} ${student.last_name || ''}
            Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
            User ID: ${user._id}
            App Version: StudentWebApp/${config.appversion}
            Browser: ${browser.name} ${browser.version}
            Date: ${moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]')}`;
    if (option === 1) {
      ticket.subject = `User feedback for Teacher from ${user.first_name} ${user.last_name}`;
    } else {
      ticket.subject = `User feedback on Thinkster Math from ${user.first_name} ${user.last_name}`;
    }
    ticket.name = `${user.first_name} ${user.last_name}`;
    ticket.email = user.email_address;
    return ticket;
  }

  getVisibilityStatus() {
    const { user } = this.props;
    if (user && user.students && Object.keys(user.students).length > 0) {
      return '';
    }

    return 'none';
  }

  render() {
    const { logout } = this.props;

    return (
      <div className="o-sideBar o-sideBar--parent">
        <Dialog
          show={this.state.showDialog}
          onAccept={this.onAcceptDialog}
          htmlBody={this.state.dialogHTML}
          message={this.state.dialogMessage}
          acceptButtonLabel={this.state.dialogAcceptButtonLabel || undefined}
        />
        <SupportDialog
          show={this.state.showSupportDialog}
          onClose={this.onSupportDialogClose}
          onSubmit={this.onSupportDialogSubmit}
          getSupportTicket={this.supportTicketForOption}
        />
        <nav className="o-sideBarNav">
          <ul className="o-sideBarNav__items">
            <li>
              <Link to="/students" className="o-sideBarNav__link a-p(14)">
                <ProfileIcon />
                <span className="o-sideBarNav__label">
                  { !this.getVisibilityStatus() ? Localization.localizedStringForKey('Students') : Localization.localizedStringForKey('Home') }
                </span>
              </Link>
            </li>
            <li>
              <Link to="/plans" className={`o-sideBarNav__link a-p(14) ${this.props.activeLink === 2 ? ' o-sideBarNav__link--active' : ''}`}>
                <DiplomaIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Manage Plans')}
                </span>
              </Link>
            </li>
            <li style={{ display: 'none' }}>
              <Link to="#" className="o-sideBarNav__link a-p(14)">
                <ToolsIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Account Settings')}
                </span>
              </Link>
            </li>
            <li style={{ display: (this.getVisibilityStatus()) }}>
              <Link to={(this.props.session ? '/payment/4' : '')} target="_self" className={`o-sideBarNav__link a-p(14)${this.props.activeLink === 3 ? ' o-sideBarNav__link--active' : ''}`}>
                <CreditCardIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Payment')}
                </span>
              </Link>
            </li>
            <li style={{ display: (ENV.showReferAFriend ? (this.getVisibilityStatus()) : 'none') }}>
              <Link to="#" className="o-sideBarNav__link a-p(14) squatchpop">
                <ReferFriendIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Refer a Friend')}
                </span>
              </Link>
            </li>
            <li style={{ display: (ENV.showReferAFriend ? '' : 'none') }}>
              <Link to="/referrals" className={"o-sideBarNav__link a-p(14) " + (this.props.activeLink == 5 ? 'o-sideBarNav__link--active' : '')}>
                <CheckReferralIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Check My Referrals')}
                </span>
              </Link>
            </li>
            <li>
              <button type="button" className="b-button--fullWidth o-sideBarNav__link" onClick={this.onSupport}>
                <Support />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Support')}
                </span>
              </button>
            </li>
            <li>
              <Link to="/reset" className="b-button--fullWidth o-sideBarNav__link">
                <PasswordResetIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Reset Password')}
                </span>
              </Link>
            </li>
            <li>
              <Link to="#" className="o-sideBarNav__link a-p(14)" onClick={() => { logout(); browserHistory.push('/login'); }}>
                <KeyholeIcon />
                <span className="o-sideBarNav__label">
                  {Localization.localizedStringForKey('Log Out')}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  user: state.user,
  session: state.session,
});

const actionCreators = {
  logout: SessionActions.logout,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ParentNav);
