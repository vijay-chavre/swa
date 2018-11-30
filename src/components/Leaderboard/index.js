import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as SessionActions from '../../actions/session';
import * as UserActions from '../../actions/user';
import * as LeadersActions from '../../actions/leaders';
import * as SurroundingUserActions from '../../actions/surroundingUsers';
import Helmet from 'react-helmet';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import Footer from '../Footer';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import * as Localization from '../Shared/Localization';
import config from '../../constants/config';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';
import ChooseUsername from '../Leaderboard/ChooseUsername';

class Leaderboard extends Component {
  static propTypes = {
    logout: React.PropTypes.func,

    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    student: React.PropTypes.shape({
    }),
  }
  constructor(props) {
    super(props);
    const { student } = this.props;
    this.state = {
      showLeaderboard: true,
      imgeUrl: '',
      allTimebgColor: '#555655',
      allTimeColor: 'white',
      thisMonthbgColor: 'white',
      thisMonthColor: 'black',
      globalbgColor: '#555655',
      globalColor: 'white',
      myCountrybgColor: 'white',
      myCountryColor: 'black',
      allGradebgColor: '#555655',
      allGradeColor: 'white',
      myGradebgColor: 'white',
      myGradeColor: 'black',

      isAllTime: 'true',
      isThisMonth: 'false',

      isGlobal: 'true',
      isMyCountry: 'false',

      isAllGrade: 'true',
      isMyGrade: 'false',
    };
    if (student && student.leaderboard_screen_name) {
      this.state.showLeaderboard = true;
    } else {
      this.state.showLeaderboard = false;
    }
  }
  // for First Button Group
  handleAllTime() {
    this.setState({
      allTimebgColor: '#555655',
      thisMonthbgColor: 'white',
      allTimeColor: 'white',
      thisMonthColor: 'black',
      isAllTime: 'true',
      isThisMonth: 'false',

    });
    const { fetchLeaders, fetchSurroundingUsers, student, leaders } = this.props;
    fetchLeaders({
      student,
      isAllTime: 'true',
      isThisMonth: 'false',
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
    fetchSurroundingUsers({
      student,
      isAllTime: 'true',
      isThisMonth: 'false',
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
  }

  handleThisMonth() {
    this.setState({
      allTimebgColor: 'white',
      thisMonthbgColor: '#555655',
      allTimeColor: 'black',
      thisMonthColor: 'white',
      isAllTime: 'false',
      isThisMonth: 'true',
    });
    const { fetchLeaders, fetchSurroundingUsers, student, leaders } = this.props;
    fetchLeaders({
      student,
      isAllTime: 'false',
      isThisMonth: 'true',
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
    fetchSurroundingUsers({
      student,
      isAllTime: 'false',
      isThisMonth: 'true',
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
  }

  // for Second Button Group
  handleGlobal() {
    this.setState({
      globalbgColor: '#555655',
      myCountrybgColor: 'white',
      globalColor: 'white',
      myCountryColor: 'black',
      isGlobal: 'true',
      isMyCountry: 'false',

    });
    const { fetchLeaders, fetchSurroundingUsers, student, leaders } = this.props;
    fetchLeaders({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: 'true',
      isMyCountry: 'false',
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
    fetchSurroundingUsers({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: 'true',
      isMyCountry: 'false',
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
  }

  handleMyCountry() {
    this.setState({
      globalbgColor: 'white',
      myCountrybgColor: '#555655',
      globalColor: 'black',
      myCountryColor: 'white',
      isGlobal: 'false',
      isMyCountry: 'true',
    });
    const { fetchLeaders, fetchSurroundingUsers, student, leaders } = this.props;
    fetchLeaders({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: 'false',
      isMyCountry: 'true',
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
    fetchSurroundingUsers({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: 'false',
      isMyCountry: 'true',
      isAllGrade: this.state.isAllGrade,
      isMyGrade: this.state.isMyGrade,
    });
  }

  // for Third Button Group
  handleAllgrade() {
    this.setState({
      allGradebgColor: '#555655',
      myGradebgColor: 'white',
      allGradeColor: 'white',
      myGradeColor: 'black',
      isAllGrade: 'true',
      isMyGrade: 'false',
    });
    const { fetchLeaders, fetchSurroundingUsers, student, leaders } = this.props;
    fetchLeaders({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: 'true',
      isMyGrade: 'false',
    });
    fetchSurroundingUsers({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: 'true',
      isMyGrade: 'false',
    });
  }

  handleMyGrade() {
    this.setState({
      allGradebgColor: 'white',
      myGradebgColor: '#555655',
      allGradeColor: 'black',
      myGradeColor: 'white',
      isAllGrade: 'false',
      isMyGrade: 'true',
    });
    const { fetchLeaders, fetchSurroundingUsers, student, leaders } = this.props;
    fetchLeaders({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: 'false',
      isMyGrade: 'true',
    });
    fetchSurroundingUsers({
      student,
      isAllTime: this.state.isAllTime,
      isThisMonth: this.state.isThisMonth,
      isGlobal: this.state.isGlobal,
      isMyCountry: this.state.isMyCountry,
      isAllGrade: 'false',
      isMyGrade: 'true',
    });
  }

  componentDidMount() {
    const { fetchLeaders, fetchSurroundingUsers, student, leaders, fetchLeadersForGuestUser } = this.props;
    
    if (this.isGuestFlow()) {
      fetchLeadersForGuestUser({ skip: 0 });
    } else {
      dataLayer.push({
        uid: student._id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
        event: 'swaViewLeaderboard',
      });
      fetchLeaders({
        student,
        isAllTime: this.state.isAllTime,
        isThisMonth: this.state.isThisMonth,
        isGlobal: this.state.isGlobal,
        isMyCountry: this.state.isMyCountry,
        isAllGrade: this.state.isAllGrade,
        isMyGrade: this.state.isMyGrade,
      });
      fetchSurroundingUsers({
        student,
        isAllTime: this.state.isAllTime,
        isThisMonth: this.state.isThisMonth,
        isGlobal: this.state.isGlobal,
        isMyCountry: this.state.isMyCountry,
        isAllGrade: this.state.isAllGrade,
        isMyGrade: this.state.isMyGrade,
      });
    }
  }
  getGrade = (gradeValue) => {
    let grade;
    if (gradeValue) {
      if (gradeValue.toLowerCase() === 'k' && config.isViaAfrika) {
        grade = 'R';
      } else if (gradeValue.toLowerCase() === 'k' && !config.isViaAfrika) {
        grade = 'K';
      } else {
        grade = gradeValue;
      }
    } else if (config.isViaAfrika) {
      grade = 'R';
    } else {
      grade = 'K';
    }
    return grade;
  }

  showLeaderboard = (value) => {
    this.setState({ showLeaderboard: value });
  }
  getLeaderboardView = () => {
    const { leaders, surroudingUsers, logout, session, student } = this.props;
    const { bgColor } = this.state;
    const images = ['gold', 'silver', 'bronze'];
    if (this.isGuestFlow()) {
      return (
        <table style={{ width: '100%' }}>
          <tbody style={{ width: '100%', background: 'white' }} >
            <tr style={{ borderBottom: '0.5px solid #f0f0f0', borderTop: '0.5px  #f0f0f0', fontSize: '15px' }}>
              <th style={{ paddingLeft: '20px', width: '250px', height: '60px', verticalAlign: 'middle', textAlign: 'left' }}>
                {Localization.localizedStringForKey('Leaders')}
              </th>
              <th>
              </th>
              <th style={{ width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
                {Localization.localizedStringForKey('Lifetime')}
              </th>
              <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                {Localization.localizedStringForKey('Country')}
              </th>
              <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                {Localization.localizedStringForKey('Grade')}
              </th>
              <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                {Localization.localizedStringForKey('Points this month')}
              </th>
            </tr>
            {
              this.props.guestLeaders.data && this.props.guestLeaders.data.map((obj, i) => {//Leaders Table
                const imageUrl = `https://s3.amazonaws.com/${ENV.leaderboardAvatarBucket}/${obj._id}.png`;
                const row = 'allrow' + i.toString();
                const imageCell = 'image' + i.toString();
                const index = obj._position - 1;
                if (obj._position <= 3) {
                  return (
                    <tr key={row} style={{ borderBottom: '0.5px solid #f0f0f0' }} key={obj._id} >
                      <td style={{ width: '250px', height: '45px', verticalAlign: 'middle' }}>
                        <div style={{ marginLeft: '10px', float: 'left' }}  >
                          <img style={{ border: '0', bottom: '18px' }} src={`/images/${images[index]}.png`} />
                        </div>
                        <div style={{ position: 'relative', top: '17px', marginRight: '10px' }}>
                          <p style={{ color: '#00b4f1', fontSize: '15px', overflowX: 'auto' }}>{obj.name}</p>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div>
                          {/*<img style={{ width: '40px', height: '40px', border: '1px solid #ADADAD', borderTopLeftRadius: '100px', borderTopRightRadius: '100px', borderBottomLeftRadius: '100px', borderBottomRightRadius: '100px' }} src={imageUrl} ref={img => this.img = img} onError={() => this.img.src = 'images/default_user.png'} />*/}
                          <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
                        </div>
                      </td>
                      <td style={{ width: '150px', fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{obj.rewardPoints.lifetime}</td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <p style={{ color: '#777777', fontSize: '17px', textTransform: 'uppercase', textAlign: 'center' }} >{obj.country}</p>
                      </td>
                      <td style={{ fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{this.getGrade(obj.grade)}</td>
                      <td style={{ fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{obj.rewardPoints.outstanding}</td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={row} style={{ borderBottom: '0.5px solid #f0f0f0', height: '60', backgroundColor: this.studentRowBacground }} >
                      <td style={{ width: '250px', height: '45px', verticalAlign: 'middle' }}>
                        <div style={{ marginLeft: '20px', float: 'left', marginRight: '20px' }}  >
                          {obj._position}
                        </div>
                        <div style={{ marginLeft: '50px' }}>
                          <p style={{ color: '#00b4f1', fontSize: '17px' }}>{obj.name}</p>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div>
                          <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
                        </div>
                      </td>
                      <td style={{ width: '150px', verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{obj.rewardPoints.lifetime}</td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <p style={{ color: '#777777', fontSize: '17px', textTransform: 'uppercase', textAlign: 'center' }} >{obj.country}</p>
                      </td>
                      <td style={{ verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{this.getGrade(obj.grade)}</td>
                      <td style={{ verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{obj.rewardPoints.outstanding}</td>
                    </tr>
                  );
                }
              })}
          </tbody>
        </table>);

    }

    return (
      <table style={{ width: '100%' }}>
        <tbody style={{ width: '100%', background: 'white' }} >
          <tr style={{ borderBottom: '0.5px solid #f0f0f0', borderTop: '0.5px solid #f0f0f0', fontSize: '15px' }}>
            <th style={{ paddingLeft: '20px', width: '250px', height: '60px', verticalAlign: 'middle', textAlign: 'left' }}>
              {Localization.localizedStringForKey('Leaders')}
            </th>
            <th>
            </th>
            <th style={{ width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
              {Localization.localizedStringForKey('Lifetime')}
            </th>
            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              {Localization.localizedStringForKey('Country')}
            </th>
            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              {Localization.localizedStringForKey('Grade')}
            </th>
            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              {Localization.localizedStringForKey('Points this month')}
            </th>
          </tr>


          {leaders.data && leaders.data.map((obj, i) => {//Leaders Table
            const imageUrl = `https://s3.amazonaws.com/${ENV.leaderboardAvatarBucket}/${obj._id}.png`;
            const row = 'allrow' + i.toString();
            const imageCell = 'image' + i.toString();
            const index = obj._position - 1;
            return (
              <tr key={row} style={{ borderBottom: '0.5px solid #f0f0f0' }} key={obj._id} >
                <td style={{ width: '250px', height: '45px', verticalAlign: 'middle' }}>
                  <div style={{ marginLeft: '10px', float: 'left' }}  >
                    <img style={{ border: '0', bottom: '18px' }} src={`/images/${images[index]}.png`} />
                  </div>
                  <div style={{ position: 'relative', top: '17px', marginRight: '10px' }}>
                    <p style={{ color: '#00b4f1', fontSize: '15px', overflowX: 'auto' }}>{obj.name}</p>
                  </div>
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <div>
                    {/*<img style={{ width: '40px', height: '40px', border: '1px solid #ADADAD', borderTopLeftRadius: '100px', borderTopRightRadius: '100px', borderBottomLeftRadius: '100px', borderBottomRightRadius: '100px' }} src={imageUrl} ref={img => this.img = img} onError={() => this.img.src = 'images/default_user.png'} />*/}
                    <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
                  </div>
                </td>
                <td style={{ width: '150px', fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{obj.rewardPoints.lifetime}</td>
                <td style={{ verticalAlign: 'middle' }}>
                  <p style={{ color: '#777777', fontSize: '17px', textTransform: 'uppercase', textAlign: 'center' }} >{obj.country}</p>
                </td>
                <td style={{ fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{this.getGrade(obj.grade)}</td>
                <td style={{ fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{obj.rewardPoints.outstanding}</td>
              </tr>
            )
          })
          }
          <tr style={{ height: '20px', background: '#cccccc' }}>
            <td ></td>
            <td ></td>
            <td ></td>
            <td ></td>
            <td ></td>
            <td ></td>
          </tr>
          {surroudingUsers.data && surroudingUsers.data.map((obj, i) => {//SurroundingUsers Table Row
            const imageUrl = `https://s3.amazonaws.com/${ENV.leaderboardAvatarBucket}/${obj._id}.png`;
            const row = 'allrow' + i.toString();
            if (obj._id == student._id) {
              return ( //For Highlight the Student Row
                <tr key={row} style={{ borderBottom: '0.5px solid #f0f0f0', height: '60', backgroundColor: '#00b5ec', color: 'white' }} >
                  <td style={{ width: '250px', height: '45px', verticalAlign: 'middle' }}>
                    <div style={{ marginLeft: '20px', float: 'left', marginRight: '20px' }}  >
                      {obj._position}
                    </div>
                    <div style={{ marginLeft: '50px', }}>
                      <p style={{ fontSize: '17px' }}>{obj.name}</p>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div>
                      <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
                    </div>
                  </td>
                  <td style={{ width: '150px', fontSize: '15px', textAlign: 'center', verticalAlign: 'middle' }}>{obj.rewardPoints.lifetime}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <p style={{ fontSize: '17px', textTransform: 'uppercase', textAlign: 'center' }} >{obj.country}</p>
                  </td>
                  <td style={{ verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{this.getGrade(obj.grade)}</td>
                  <td style={{ verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{obj.rewardPoints.outstanding}</td>
                </tr>
              )
            }
            else {
              return (
                <tr key={row} style={{ borderBottom: '0.5px solid #f0f0f0', height: '60', backgroundColor: this.studentRowBacground }} >
                  <td style={{ width: '250px', height: '45px', verticalAlign: 'middle' }}>
                    <div style={{ marginLeft: '20px', float: 'left', marginRight: '20px' }}  >
                      {obj._position}
                    </div>
                    <div style={{ marginLeft: '50px' }}>
                      <p style={{ color: '#00b4f1', fontSize: '17px' }}>{obj.name}</p>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div>
                      <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
                    </div>
                  </td>
                  <td style={{ width: '150px', verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{obj.rewardPoints.lifetime}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <p style={{ color: '#777777', fontSize: '17px', textTransform: 'uppercase', textAlign: 'center' }} >{obj.country}</p>
                  </td>
                  <td style={{ verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{this.getGrade(obj.grade)}</td>
                  <td style={{ verticalAlign: 'middle', fontSize: '15px', textAlign: 'center' }}>{obj.rewardPoints.outstanding}</td>
                </tr>
              )
            }
          })
          }
        </tbody>
      </table>
    );

  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  render() {
    return (
      <div>

        <StudentHeader currentNavigation={features.LEADERBOARD} showLeaderboard={this.showLeaderboard} />
        <Helmet
          title="Student Leaderboard and Points | Thinkster Math"
          meta={[
            {name:"description", content:"Student Leaderboard and Standings on Thinkster Math with monthly and all-time point accumulations."}
          ]}
        />
        <StudentNav currentSelectedFeature={features.LEADERBOARD} />
        {
          !this.state.showLeaderboard ? <div className="a-appView a-appView--hasSidebar"> <ChooseUsername student={this.props.student} showLeaderboard={this.showLeaderboard} currentNavigation={features.LEADERBOARD} /> </div> :
            <div className="a-appView a-appView--hasSidebar">
              <div className="a-appView__contents">
                <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
                  {/* Loading screen animation notification
                - Use className 'o-modal--hide' to hide modal
                - Use className 'o-modal--show' to show modal
              */}
                  <LoadingSpinner studentId={this.props.student._id} />
                </div>
                {!this.isGuestFlow() ?
                  <header className="a-viewHeader" style={{ paddingTop: '20px', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '10px' }} >
                    <table style={{ width: '100%' }}>
                      <tr>
                        <td>
                          <div className="btn-group" style={{ textAlign: 'center', display: 'inline-block', border: '1px solid #555655' }}>
                            <button onClick={(e) => this.handleAllTime(e)} className="button" style={{ backgroundColor: this.state.allTimebgColor, color: this.state.allTimeColor, padding: ' 6px 13px', fontSize: '16px' }}>{Localization.localizedStringForKey('All Time')}</button>
                            <button onClick={(e) => this.handleThisMonth(e)} className="button" style={{ backgroundColor: this.state.thisMonthbgColor, color: this.state.thisMonthColor, padding: ' 6px 12px', fontSize: '16px' }}>{Localization.localizedStringForKey('This month')}</button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="btn-group" style={{ textAlign: 'center', display: 'inline-block', border: '1px solid #555655' }}>
                            <button onClick={(e) => this.handleGlobal(e)} className="button" style={{ backgroundColor: this.state.globalbgColor, color: this.state.globalColor, padding: ' 6px 13px', fontSize: '16px' }}>{Localization.localizedStringForKey('Global')}</button>
                            <button onClick={(e) => this.handleMyCountry(e)} className="button" style={{ backgroundColor: this.state.myCountrybgColor, color: this.state.myCountryColor, padding: ' 6px 13px', fontSize: '16px' }}>{Localization.localizedStringForKey('My country')}</button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="btn-group" style={{ textAlign: 'center', display: 'inline-block', border: '1px solid #555655' }}>
                            <button onClick={(e) => this.handleAllgrade(e)} className="button" style={{ backgroundColor: this.state.allGradebgColor, color: this.state.allGradeColor, padding: ' 6px 13px', fontSize: '16px' }}>{Localization.localizedStringForKey('All grades')}</button>
                            <button onClick={(e) => this.handleMyGrade(e)} className="button" style={{ backgroundColor: this.state.myGradebgColor, color: this.state.myGradeColor, padding: ' 6px 13px', fontSize: '16px' }}>{Localization.localizedStringForKey('My grade')}</button>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </header>
                  : ''}
                {
                  this.getLeaderboardView()
                }

              </div>
              {/*
            HIDE THIS FOOTER WHEN SHOWING THE CHOOSEUSERNAME COMPONENT
          */}
              <Footer />
            </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  student: state.student,
  leaders: state.leaders,
  guestLeaders: state.guestLeaders,
  surroudingUsers: state.surroudingUsers,
  loading: state.loading,
});

const actionCreators = {
  logout: SessionActions.logout,
  fetchUser: UserActions.fetchUser,
  fetchLeaders: LeadersActions.fetchLeaders,
  fetchLeadersForGuestUser: LeadersActions.fetchLeadersForGuestUser,

  fetchSurroundingUsers: SurroundingUserActions.fetchSurroundingUsers,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Leaderboard);
