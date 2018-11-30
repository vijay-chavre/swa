import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import * as SessionActions from '../../actions/session';
import * as UserActions from '../../actions/user';

import ParentNav from '../Shared/ParentNav';

import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

import moment from 'moment';


class Referrals extends Component {
  static propTypes = {
    logout: React.PropTypes.func,

    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { fetchReferrals, user } = this.props;
    fetchReferrals({});
  }

  getReferralsUI = () => {
    const { user } = this.props;
    const referrals = user.referrals;

    return (
        referrals && referrals.length > 0 ?


          <table className="o-referralList">
          <tbody className="o-referralList__body">
            <tr className="o-referralList__header">
              <th className="o-referralList__headerItemFriend">
                {Localization.localizedStringForKey('Friend')}
              </th>
              <th className="o-referralList__headerItemEmail">
                {Localization.localizedStringForKey('Email')}
              </th>
              <th className="o-referralList__headerItemEmail">
                {Localization.localizedStringForKey('Enrolled Date')}
              </th>
              <th className="o-referralList__headerItemStatus">
                {Localization.localizedStringForKey('Enrollment Status')}
              </th>
            </tr>
            {
            referrals && referrals.map((obj, i) => { // Leaders Table
              const imageUrl = `https://s3.amazonaws.com/tabtor-profile-pictures/${obj._id}.png`;
              const row = `allrow${i.toString()}`;
              return (
                <tr key={row} className="o-referralList__bodyItem" key={obj._id} >
                  <td className="o-referralList__bodyItemFriend">
                    {`${obj.first_name} ${obj.last_name}`}
                  </td>
                  <td className="o-referralList__bodyItemEmail">
                    {obj.email_address}
                  </td>
                  <td className="o-referralList__bodyItemEmail">
                    {moment(obj.date_created).format('LL')}
                  </td>
                  <td className="o-referralList__bodyItemStatus">
                    {obj.subscription_status && obj.subscription_status.toLowerCase() === 'ccverified' ? 'Pending' : obj.subscription_status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        :
        'No Referrals found.'


          /* <table style={{ width: '50%', align: 'center' }}>
              <tbody style={{ background: 'white' }} >
                <tr style={{ borderBottom: '0.5px solid #f0f0f0', borderTop: '0.5px  #f0f0f0', fontSize: '15px' }}>
                    <th style={{ paddingLeft: '20px', width: '250px', height: '60px', verticalAlign: 'middle', textAlign: 'left' }}>
                        {Localization.localizedStringForKey('Name')}
                      </th>
                    <th />
                    <th style={{ width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
                        {Localization.localizedStringForKey('Email')}
                      </th>
                  </tr>
                {
                        referrals && referrals.map((obj, i) => { // Leaders Table
                          const imageUrl = `https://s3.amazonaws.com/tabtor-profile-pictures/${obj._id}.png`;
                          const row = `allrow${ i.toString()}`;
                          return (
                            <tr key={row} style={{ borderBottom: '0.5px solid #f0f0f0' }} key={obj._id} >
                                <td style={{ width: '250px', height: '45px', verticalAlign: 'middle', color: 'rgb(0, 180, 241)' }}>
                                    {`${obj.first_name} ${obj.last_name}`}
                                  </td>
                                <td style={{ verticalAlign: 'middle' }}>
                                    <div>
                                        {// <img style={{ width: '40px', height: '40px', border: '1px solid #ADADAD', borderTopLeftRadius: '100px', borderTopRightRadius: '100px', borderBottomLeftRadius: '100px', borderBottomRightRadius: '100px' }} src={imageUrl} ref={img => this.img = img} onError={() => this.img.src = 'images/default_user.png'} />}
                                        <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
                                        {// <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" /> }
                                      </div>
                                  </td>
                                <td style={{ width: '150px', fontSize: '15px', textAlign: 'center', verticalAlign: 'middle', color: 'rgb(0, 180, 241)' }}>{obj.email_address}</td>
                              </tr>
                          );
                        })}
              </tbody>
            </table>
            :
            'No Referrals found'*/
      );
  }

  backToPlansSection(e) {

  }

  render() {
    return (
      <div>
          {/*
            BEGIN MODAL FOR SUCCESS DIALOG
          */}
          <div className={`o-modal o-modal--${this.state.showAddStudentModal ? this.state.showAddStudentModal : 'hide'}`}>
              {/* Dialog notification
              - Use className 'o-modal--hide' to hide modal
              - Use className 'o-modal--show' to show modal
            */}

              <div className="o-modal__box o-modal__box--dialog">
                  <p className="a-p(14)">
                      {this.props.student && this.props.student.addedNewStudent && this.state && !this.state.addingStudent ?
                                Localization.localizedStringForKey('Student has been added successfully.') : Localization.localizedStringForKey('An error occured. Student could not be added. Please try again later.')
                            }

                    </p>

                  <div className="o-modal__actions">
                      <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={this.backToPlansSection.bind(this)}>
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

          <ParentNav activeLink={5} />

          <div className="a-appView a-appView--hasSidebar">
              <div className="a-appView__contents">
                  <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.user && this.props.user.fetchingReferrals ? 'show' : 'hide'}`}>
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
                          Track Your Referrals
                        </h1>
                      </header>
                      <p className="a-p(16)">
                          If you are in the Silver, Gold, or Platinum plan, for ever friend that signs up for a Silver, Gold, or Platinum subscription, you&rsquo;ll get a $50 gift card and your friend gets $50 in Thinkster Math credits toward their second month.
                        </p>
                      {this.getReferralsUI()}
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
});

const actionCreators = {
  logout: SessionActions.logout,
  fetchReferrals: UserActions.fetchReferrals,
};

export default connect(
    mapStateToProps,
    actionCreators,
)(Referrals);
