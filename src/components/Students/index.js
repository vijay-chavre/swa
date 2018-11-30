import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import moment from 'moment';
import KeyholeIcon from '../Shared/Glyphs/KeyholeIcon';
import ExamIcon from '../Shared/Glyphs/ExamIcon';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import * as SessionActions from '../../actions/session';
import * as UserActions from '../../actions/user';
import { studentFetched } from '../../actions/student';
import StudentAvatar from './StudentAvatar';
import Footer from '../Footer';
import config from '../../constants/config';
import GradeSelector from '../GradeSelector';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as SubscriptionState from '../../constants/subscriptionState';
import Dialog from '../Shared/Dialog';
import errorAction from '../../actions/error';

let renderNow = false;

class Students extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    fetchUser: React.PropTypes.func,
    studentFetched: React.PropTypes.func,
    fetchUserPaymentStatus: React.PropTypes.func,
    checkPassword: React.PropTypes.func,
    resetReloginData: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({
    }),
    lastFetchedStudent: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      showActivateAlert: false,
      showOnHoldAlert: false,
      showCanceledAlert: false,
      password: '',
      settingsAccessed: false,
      showDialog: false,
      authenticationError: false,
      products: [],
    };
  }

  componentDidMount() {
    const { user, fetchUser, fetchUserPaymentStatus, resetReloginData } = this.props;
    renderNow = false;
    let fetchSynchronously = false;
    if (user && !user.paymentStatus) {
      fetchSynchronously = true;
    }
    fetchUserPaymentStatus({ userId: this.props.session.user_id, fetchSynchronously });
    fetchUser({ userId: this.props.session.user_id });
    resetReloginData();
    this.setState({ showFailedFetchUser: true });
  }

  componentWillReceiveProps = (nextProps) => {
    const { session } = nextProps;


    this.checkWelcomeScreenNeeded(nextProps);

    const nextPath = this.getNextPath(nextProps);
    if (this.state.settingsAccessed) {
      if (session.reloginValid) {
        this.setState({
          showDialog: false,
          settingsAccessed: false,
          authenticationError: false,
        });
        browserHistory.push(nextPath);
      } else {
        this.setState({
          showDialog: true,
          settingsAccessed: true,
          authenticationError: true,
        });
      }
    }
  }

  checkWelcomeScreenNeeded(nextProps) {
    let skipWelcomeBack = false;

    if (nextProps.user && nextProps.user.fetchedUser) {
      let noOfStudents = 0;
      let noOfProducts = 0;
      let userType = '';

      if (nextProps.user.products) {
        noOfProducts = Object.keys(nextProps.user.products).length;
      }
      if (nextProps.user.students) {
        noOfStudents = Object.keys(nextProps.user.students).length;
      }

      if (nextProps.user.type) {
        userType = nextProps.user.type;
      }

      if (nextProps.user.fetchedPaymentStatus) {
        if (nextProps.user.grace_period && nextProps.user.grace_period_end_date) {
          if (moment(nextProps.user.grace_period_end_date).isAfter(moment())) { // allow access for grace period user
            skipWelcomeBack = true;
          }
        }
        if (noOfProducts > 0) { // allow access Product purchase
          skipWelcomeBack = true;
        }
        if (Common.isGuest(nextProps.user)) { // allow access Guest User
          skipWelcomeBack = true;
        }



        if ((noOfStudents === 0 || (!nextProps.user.paymentStatus.creditcard && !nextProps.user.paymentStatus.paypalAccount && !nextProps.user.paymentStatus.isPaid)) && !skipWelcomeBack) {
          browserHistory.push('/continue-registration');
          renderNow = false;
          return;
        }
        renderNow = true;
      }
      if (nextProps.user.fetchUserPaymentStatusFailed) {
        if (userType.toLowerCase() !== 'parent') { // allow access to non parent type (School, Class, Teacher)
          renderNow = true;
        }
        if (userType.toLowerCase() === 'parent' && noOfProducts > 0) { // allow access Product purchase
          renderNow = true;
        }
      }
    }
  }

  getNextPath(nextProps) {
    const { user } = nextProps;
    if ((user && user.students && Object.keys(user.students).length > 0) || (user && user.products && user.products.length > 0)) {
      return '/plans';
    }

    return `/${user._id}/addstudent`;
  }

  onCancelHide(e) {
    this.setState({
      showDialog: false,
      settingsAccessed: false,
    });

    e.stopPropagation();
  }

  checkLogin(e) {
    const { checkPassword } = this.props;

    this.setState({
      showDialog: false,
      settingsAccessed: true,
      authenticationError: false,
    });

    if (e) { e.stopPropagation(); }

    checkPassword({ username: (this.state.username ? this.state.username : this.props.session.username), password: this.state.password });
  }

  askPassword(e) {
    this.setState({
      showDialog: true,
      settingsAccessed: true,
      authenticationError: false,
    });

    e.stopPropagation();
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  onStudentSelect = (student) => {
    const { user, lastFetchedStudent } = this.props;
    const subscriptionState = Common.stateOfStudent(student, user);
    if (subscriptionState === SubscriptionState.INACTIVE) {
      this.setState({ showActivateAlert: true });
    } else if (subscriptionState === SubscriptionState.ONHOLD) {
      this.setState({ showOnHoldAlert: true });
    } else if (subscriptionState === SubscriptionState.CANCELED) {
      this.setState({ showCanceledAlert: true });
    } else {
      let overrideLastFetchedStudent = true;
      if (student && lastFetchedStudent && student._id === lastFetchedStudent._id) {
        overrideLastFetchedStudent = false;
      }
      if (overrideLastFetchedStudent) {
        this.props.studentFetched(student);
      }
    }
  }

  removeReadonlyAttribute(e) {
    if (e && e.target) {
      e.target.readOnly = false;
    }
  }

  setPassword(e) {
    this.setState({ password: e.target.value });
  }

  checkKeyPress(e) {
    if (e.charCode === 13) {
      e.preventDefault();
      e.stopPropagation();

      this.checkLogin(null);
    }
  }
  gradeLabel = (product) => `${Localization.localizedStringForKey('Grade')} ${product.product_grade === 'K' && config.isViaAfrika ? 'R' : product.product_grade}`


  getProductStyle(product) {
    switch (product.product_id) {
      case '519816bb-5fae-401d-af1e-48e0220172a1': return 'state';
      case 'd5ec54e4-6a71-486c-98f5-487bd46fdba7': return 'parcc';
      case 'de9362a8-74f1-4177-9515-6fbb509fc736': return 'competitive';
      case 'e0c461a7-9745-43cc-8315-4a87a4b619ea': return 'sbac';
      case '11c6d819-5370-11e8-9ed0-22000a98236e': return 'state';
      case '1a4b54c2-5370-11e8-9ed0-22000a98236e': return 'parcc';
    }
    return 'state';
  }

  checkUserData(e) {
    this.setState({ showFailedFetchUser: false });
    this.props.logout();
    browserHistory.push('/login');
  }

  showProducts = () => {
    const products = [];
    if (this.state.products && this.state.products.length > 0) {
      this.state.products.map((product) => {
        const productClassName = `o-productSelection__product o-productSelection__product--name(${this.getProductStyle(product)})`;
        products.push(
          <div className="a-col a-col(1-4)" key={product.id}>
            <div className={productClassName}>
              <Link to={`/student/${product.id}`} className="o-productSelection__productLink" />
              <h2 className="a-s(14) a-allCaps o-productSelection__productName">
                {product.product_name}
              </h2>
              <div className="o-productSelection__productPortrait">
                <ExamIcon />
              </div>
              {product.hide_grade ? '' :
                <h3 className="o-productSelection__productGrade a-p(16)">
                  {this.gradeLabel(product)}
                </h3>
              }
            </div>
          </div>
        );
      });
    }
    return products;
  }

  getStudentMsg() {
    const { user } = this.props;
    if (user && user.paymentStatus && user.paymentStatus.students) {
      const students = Object.keys(user.paymentStatus.students);
      if (students && students.length > 0) {
        for (let i = 0; i < students.length; i++) {
          if (!user.paymentStatus.students[students[i]].isCanceled && user.paymentStatus.students[students[i]].isPaid && user.paymentStatus.students[students[i]].is_active) {
            return 'Choose a student to begin OR select Parent Settings to activate new students on this account.';
          }
        }
      }
    }

    return <div>Select Parent Settings to activate new students on this account OR click <a style={{ cursor: 'pointer' }} target="_blank" href={ENV.productTourURL}>here</a> to view our interactive demo.</div>;
  }

  render() {
    const { user, logout, session } = this.props;
    // filter the tutoring sessions
    if (user.products && user.products.length > 0) {
      this.state.products = user.products.filter(product => product.product_type !== 'SESSIONS');
    } else {
      this.state.products = [];
    }
    return (
      renderNow ?
        (user && user.fetchedUser ?
          this.isGuestFlow() ? < GradeSelector userId={this.props.location.query.userId} token={this.props.location.query.token} fromDemo={!!(this.props.location.query.fromDemo || session.fromDemo)} /> :
            <div>

              <Helmet
                title="Students and Workbooks Selection | Thinkster Math"
                meta={[
                  { name: 'description', content: 'Choose a student, workbook, or parent settings to begin. Modification available in parent settings.' },
                ]}
              />
              <header className="o-appHeader">

                {config.isViaAfrika ?
                  <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
                    <img width="200px" src={`/images/${config.appBannerLogo}`} />
                  </div> :
                  <Link href="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
                    <ThinksterLogomark />
                    <ThinksterWordmark />
                  </Link>
                }

                <ul className="o-appHeader__actions">
                  <li onClick={() => { logout(); browserHistory.push('/login'); }} className="o-appHeader__actionItem">
                    <Link to="#" className="o-appHeader__actionLink" >
                      {this.isGuestFlow() ? Localization.localizedStringForKey('Exit Guest Flow') : Localization.localizedStringForKey('Log Out')}
                    </Link>
                  </li>
                </ul>
              </header>
              <Dialog
                show={this.state.showDialog}
                htmlBody={[<span>Please login again to access settings</span>,
                <label className="b-formTextInput">
                  <span className="b-formTextInput__label a-color(copy-1)">
                    Username
                          </span>
                  <input readOnly autoComplete="off" name="" type="text" label="User name" value={this.props.session ? this.props.session.username : ''} className="b-formTextInput__input " onChange={(e) => { this.setState({ username: e.target.value }); }} />
                </label>, <br />,
                <label className="b-formTextInput">
                  <span className="b-formTextInput__label a-color(copy-1)">
                    Password
                          </span>
                  <input autoComplete="new-password" name="" type="password" label="" className="b-formTextInput__input" defaultValue="" onChange={this.setPassword.bind(this)} onKeyPress={this.checkKeyPress.bind(this)} />
                </label>, <br />,
                <label className="b-formTextInput" style={{ display: (session.reloginValid ? 'none' : (session.reloginValid === false ? 'block' : 'none')), color: 'red' }}>
                  {Localization.localizedStringForKey('Incorrect username/password. Please try again.')}
                </label>, <br />,
                <div style={{ display: 'inline-block', marginRight: '20px' }}>
                  <button onClick={this.checkLogin.bind(this)} type="button">
                    <span className="b-flexBtn--large b-flatBtn b-flatBtn--gradient(active-1)">
                      <span className="b-button__label">
                        {Localization.localizedStringForKey('Login')}
                      </span>
                    </span>
                  </button>
                </div>,
                <div style={{ display: 'inline-block', textAlign: 'right', marginLeft: '20px' }}>
                  <button onClick={this.onCancelHide.bind(this)} type="button">
                    <span className="b-flexBtn--large b-flatBtn b-flatBtn--gradient(active-3)">
                      <span className="b-button__label">
                        {Localization.localizedStringForKey('Cancel')}
                      </span>
                    </span>
                  </button>
                </div>]}
                noButtons
              />
              <div className="a-appView a-appView--altBG o-studentSelection">
                <div className="a-appView__contents">
                  {((user.students && Object.keys(user.students).length > 0) || (!this.state.products || (this.state.products && this.state.products.length === 0))) ?
                    <div>
                      <div className="o-studentSelection__intro a-container">
                        <h1 className="a-h(28)">
                          {Localization.localizedStringForKey('Thinkster Students')}
                        </h1>
                        <p className="a-p(14) a-color(copy-2) a-limiter a-limiter(800)">
                          {Localization.localizedStringForKey(this.getStudentMsg())}
                        </p>
                      </div>

                      <div className="a-container">
                        <div className="a-row a-justifyContent(center)">

                          {user.students ? Object.keys(user.students).map((studentId) => {
                            const student = user.students[studentId];
                            const subscriptionState = Common.stateOfStudent(student, user);
                            return <StudentAvatar key={studentId} student={student} userCountryCode={user.country_code} subscriptionState={subscriptionState} onStudentSelect={this.onStudentSelect} />;
                          }) : ''}
                          {(user && user.type && user.type.toLowerCase() === 'parent') ?
                            <div className="a-col a-col(1-4)" onClick={this.askPassword.bind(this)} style={{ cursor: 'pointer' }}>
                              <div className="o-studentSelection__student o-studentSelection__student--plan(parent)">
                                <h2 className="a-s(14) a-allCaps o-studentSelection__studentPlan">
                                  {Localization.localizedStringForKey('Parent Settings')}
                                </h2>
                                <div className="o-studentSelection__studentPortrait">
                                  <KeyholeIcon />
                                </div>
                                <h3 className="o-studentSelection__studentName a-p(16)">
                                  {Localization.localizedStringForKey('Manage Your Account')}
                                </h3>
                                <p className="a-p(12) a-color(copy-2)">
                                  ({Localization.localizedStringForKey('Parent Password Required')})
                        </p>
                              </div>
                            </div> : ''}

                        </div>
                      </div>
                    </div>
                    : ''
                  }
                  {(this.state.products && this.state.products.length > 0) ?
                    <div>
                      <div className="o-productSelection__intro a-container">
                        <h1 className="a-h(28)">
                          {Localization.localizedStringForKey('Thinkster Workbooks')}
                        </h1>
                        <p className="a-p(14) a-color(copy-2) a-limiter a-limiter(800)">
                          {Localization.localizedStringForKey('Choose a workbook to get started OR select Parent Settings to purchase additional workbooks.')}
                        </p>
                      </div>
                      <div className="a-container">
                        <div className="a-row a-justifyContent(center)">

                          {(user.students && Object.keys(user.students).length === 0 && ENV.showMangeParentSettings) ?
                            <div className="a-col a-col(1-4)" onClick={this.askPassword.bind(this)} style={{ cursor: 'pointer' }}>
                              <div className="o-studentSelection__student o-studentSelection__student--plan(parent)">
                                <h2 className="a-s(14) a-allCaps o-studentSelection__studentPlan">
                                  {Localization.localizedStringForKey('Parent Settings')}
                                </h2>
                                <div className="o-studentSelection__studentPortrait">
                                  <KeyholeIcon />
                                </div>
                                <h3 className="o-studentSelection__studentName a-p(16)">
                                  {Localization.localizedStringForKey('Manage Your Account')}
                                </h3>
                                <p className="a-p(12) a-color(copy-2)">
                                  ({Localization.localizedStringForKey('Parent Password Required')})
                        </p>
                              </div>
                            </div> : ''}


                          {this.showProducts()}

                        </div>
                      </div>
                    </div>
                    : ''}
                </div>

                <Footer />
              </div>
              <div className="a-appView a-appView--altBG o-studentSelection">
                <div className="a-appView__contents">
                  <div className="a-container">
                    <div className="a-row a-justifyContent(center)">
                      <div className={`o-modal o-modal--${this.state.showCanceledAlert ? 'show' : 'hide'}`}>
                        <div className="o-modal__box o-modal__box--dialog">
                          <h3 className="a-p(14)">
                            <strong>Your account has been canceled.</strong>
                          </h3>
                          <p className="a-p(14)">
                            {/* To restart Thinkster Math, please select a program to activate your account. If you have any questions please email us at <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a>. */}
                            Your subscription is currently canceled/inactive. If you would like to restart using Thinkster Math, please click on ‘Parent Settings’ to reactivate your account. Email <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a> if you have questions.
                    </p>

                          <div className="o-modal__actions">
                            <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={() => { this.setState({ showCanceledAlert: false }); }} >
                              <span className="b-button__label">
                                OK
                        </span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className={`o-modal o-modal--${this.state.showActivateAlert ? 'show' : 'hide'}`}>
                        <div className="o-modal__box o-modal__box--dialog">
                          <h3 className="a-p(14)">
                            {/* <strong>Please activate your account to continue.</strong> */}
                            <strong>Your account is inactive.</strong>
                          </h3>
                          <p className="a-p(14)">
                            {/* To start Thinkster Math, please select a program to activate your account. If you have any questions please email us at <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a>. */}
                            Your subscription is currently canceled/inactive. If you would like to restart using Thinkster Math, please click on ‘Parent Settings’ to reactivate your account. Email <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a> if you have questions.
                    </p>

                          <div className="o-modal__actions">
                            <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={() => { this.setState({ showActivateAlert: false }); }}>
                              <span className="b-button__label">
                                OK
                        </span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className={`o-modal o-modal--${this.state.showOnHoldAlert ? 'show' : 'hide'}`}>
                        <div className="o-modal__box o-modal__box--dialog">
                          <h3 className="a-p(14)">
                            <strong>Your account is on hold.</strong>
                          </h3>
                          <p className="a-p(14)">
                            Your subscription is currently on hold. If you would like to restart your learning on Thinkster Math, please contact us at <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a>.
                    </p>

                          <div className="o-modal__actions">
                            <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={() => { this.setState({ showOnHoldAlert: false }); }}>
                              <span className="b-button__label">
                                OK
                        </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> :
          (user.fetchUserFailed ?
            <div className={`o-modal o-modal--${this.state.showFailedFetchUser ? 'show' : 'hide'}`}>
              <div className="o-modal__box o-modal__box--dialog">
                <p className="a-p(14)">
                  <strong>Unable to fetch user information. Please login again.</strong>
                </p>

                <div className="o-modal__actions">
                  <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={this.checkUserData.bind(this)}>
                    <span className="b-button__label">
                      OK
              </span>
                  </button>
                </div>
              </div>
            </div> :
            <div className={'o-loadingScreenModal o-loadingScreenModal--show'}>
              {/* Loading screen animation notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}
              <LoadingSpinner />
            </div>)) : <div className={'o-loadingScreenModal o-loadingScreenModal--show'}>
          <LoadingSpinner />
        </div>);
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  lastFetchedStudent: state.student,
  loading: state.loading,
});

const actionCreators = {
  logout: SessionActions.logout,
  fetchUser: UserActions.fetchUser,
  onError: errorAction,
  onSubmit: SessionActions.submitLoginForm,
  fetchUserPaymentStatus: UserActions.fetchUserPaymentStatus,
  checkPassword: SessionActions.checkPassword,
  resetReloginData: SessionActions.resetReloginData,
  studentFetched,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Students);
