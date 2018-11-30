import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import SilverMedal from '../Shared/Glyphs/SilverMedal';
import GoldMedal from '../Shared/Glyphs/GoldMedal';
import BronzeMedal from '../Shared/Glyphs/BronzeMedal';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import GiftCards from './GiftCards';
import Footer from '../Footer';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';

class Rewards extends Component {
  static propTypes = {
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      rewardHistory: [],
      noOfGoldMedals: 0,
      noOfSilverMedals: 0,
      noOfBronzeMedals: 0,
      goldMedalPoints: 7500,
      silverMedalPoints: 5000,
      bronzeMedalPoints: 2500,
      tabs: this.initializeTabs(),
      activeTab: undefined,
    };
  }
  componentWillMount() {
    const { student } = this.props;
    if (student) {
      this.state.rewardHistory = this.rewardsHistoryforProfile(student);
      this.state.rewardHistory.forEach((obj) => {
        this.initializeMedalsCount(obj.reward_balance);
      });
    }
  }

  onTabClicked = (isMedalsTabActive) => {
    if (isMedalsTabActive) {
      this.setState({ medalsTabActive: true });
    } else {
      this.setState({ medalsTabActive: false });
    }
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  initializeTabs = () => {
    const { user, student } = this.props;
    const tabs = [];
    let rewardTab = {};

    rewardTab.key = 'medals';
    rewardTab.name = Localization.localizedStringForKey('Medals');
    tabs.push(rewardTab);

    if (Common.eligibleForGiftCards(user, student) || this.isGuestFlow()) {
      rewardTab = {};
      rewardTab.key = 'rewards';
      rewardTab.name = Localization.localizedStringForKey('Rewards');
      tabs.push(rewardTab);
    }

    return tabs;
  }

  tabsForReward = () => {
    const rewardTabs = [];
    this.state.tabs.forEach((tab) => {
      let tabClassname = 'o-tabHeader__tab';
      if (tab.key === this.state.activeTab) {
        tabClassname = 'o-tabHeader__tab o-tabHeader__tab--active';
      }
      rewardTabs.push(
        <button
          type="button"
          onClick={() => { this.setState({ activeTab: tab.key }); }}
        >
          <span className={tabClassname}>
            <span className="o-tabHeader__label">
              {tab.name}
            </span>
          </span>
        </button>
      );
    });

    return rewardTabs;
  }

  initializeMedalsCount = (rewardBalance) => {
    if (parseInt(rewardBalance, 10) >= this.state.goldMedalPoints) {
      this.state.noOfGoldMedals += 1;
    } else if (parseInt(rewardBalance, 10) >= this.state.silverMedalPoints) {
      this.state.noOfSilverMedals += 1;
    } else if (parseInt(rewardBalance, 10) >= this.state.bronzeMedalPoints) {
      this.state.noOfBronzeMedals += 1;
    }
  }

  medalForPoints = (points) => {
    if (parseInt(points, 10) >= this.state.goldMedalPoints) {
      return (<GoldMedal />);
    } else if (parseInt(points, 10) >= this.state.silverMedalPoints) {
      return (<SilverMedal />);
    } else if (parseInt(points, 10) >= this.state.bronzeMedalPoints) {
      return (<BronzeMedal />);
    }

    return (
      <p className="a-color(copy-3) o-lifetimeMedals__tileInfo">
        {Localization.localizedStringForKey('No rewards earned this month')}
      </p>
    );
  }

  medalsHistoryView = () => {
    const medalArray = [];
    this.state.rewardHistory.forEach((obj) => {
      medalArray.push(
        <li className="a-col a-col-med-2(1-5) a-col(1-3)">
          <div className="o-lifetimeMedals__tile">
            <p className="a-s(14) a-allCaps o-lifetimeMedals__tileDate">
              {obj.month} {obj.year}
            </p>
            {this.medalForPoints(obj.reward_balance)}
            <p className="o-lifetimeMedals__tilePoints">
              {obj.reward_balance} pts
            </p>
          </div>
        </li>
      );
    });

    return (<ol className="a-row a-justifyContent(center)">{medalArray}</ol>);
  }

  convertToMonthYearRewardBalance = (obj) => {
    const key = Object.keys(obj)[0];
    const value = obj[key];
    const monthYearRewardBalance = {};
    if (key.length === 6) {
      monthYearRewardBalance.year = key.substr(0, 4);
      monthYearRewardBalance.month = moment().month(key.substr(4, 2) - 1).format('MMM');
      monthYearRewardBalance.reward_balance = parseInt(value, 10);
    }
    return monthYearRewardBalance;
  }

  rewardsHistoryforProfile = (student) => {
    const array = [];
    if (student && student.summary && !this.isGuestFlow()) {
      const outStandingRewardBalance = student.summary.outstanding_rewardbalance;

      if (student.summary.reward_balance && student.summary.reward_balance.length > 0) {
        student.summary.reward_balance.forEach((obj) => {
          array.push(this.convertToMonthYearRewardBalance(obj));
        });
      }
      const currentMonthRewardBalance = {};
      currentMonthRewardBalance.month = moment().format('MMM');
      currentMonthRewardBalance.year = moment().format('YYYY');
      currentMonthRewardBalance.reward_balance = outStandingRewardBalance;
      array.push(currentMonthRewardBalance);
    }
    return array.reverse();
  }
  medalsView = () => {
    const { student } = this.props;
    if (this.state.rewardHistory.length === 0) {
      return (
        < div className="a-container">
          <div className="a-container__intro">
            <h1 className="a-h(28)">
              {Localization.localizedStringForKey('You have not earned any medals yet.')}
            </h1>
            <p className="a-p(14) a-color(copy-2)">
              {Localization.localizedStringForKey('As you complete your assignments, you earn reward points. With enough reward points, you can unlock a medal. Every month you will get a medal based on your total reward points.')}
            </p>
          </div>

          <div className="a-row  a-justify(center) o-medalValues">
            <div className="a-col a-col-tablet(1-3)">
              <div className="o-medalValues__medal">
                <SilverMedal />
                <p className="o-medalValues__medalName">
                  Silver
              </p>
                <p className="a-color(copy-3) o-medalValues__value">
                  {this.state.silverMedalPoints} Points
              </p>
              </div>
            </div>
            <div className="a-col a-col(1-3)">
              <div className="o-medalValues__medal">
                <GoldMedal />
                <p className="o-medalValues__medalName">
                  Gold
              </p>
                <p className="a-color(copy-3) o-medalValues__value">
                  {this.state.goldMedalPoints} Points
              </p>
              </div>
            </div>
            <div className="a-col a-col(1-3)">
              <div className="o-medalValues__medal">
                <BronzeMedal />
                <p className="o-medalValues__medalName">
                  Bronze
              </p>
                <p className="a-color(copy-3) o-medalValues__value">
                  {this.state.bronzeMedalPoints} Points
              </p>
              </div>
            </div>
          </div>
        </div>);
    } else {
      return (
        <div className="a-container">
          <div className="a-container__intro">
            <h1 className="a-h(28)">
              {Localization.localizedStringForKey('Lifetime Reward Points')} : {parseInt(student.summary.lifetime_rewardbalance, 10)}
            </h1>
          </div>


          <div className="a-row a-justifyContent(center) o-lifetimeMedals">

            <div className="o-lifetimeMedals__medal">
              <GoldMedal />
              <p className="o-lifetimeMedals__medalPoints">
                {this.state.noOfGoldMedals}
              </p>
            </div>

            <div className="o-lifetimeMedals__medal">
              <SilverMedal />
              <p className="o-lifetimeMedals__medalPoints">
                {this.state.noOfSilverMedals}
              </p>
            </div>

            <div className="o-lifetimeMedals__medal">
              <BronzeMedal />
              <p className="o-lifetimeMedals__medalPoints">
                {this.state.noOfBronzeMedals}
              </p>
            </div>
          </div>
          {
            this.medalsHistoryView()
          }
        </div>);
    }
  }
  render() {
    const { student } = this.props;
    if (!this.state.activeTab) {
      this.state.activeTab = this.state.tabs[0].key;
    }
    return (
      <div>
        <StudentHeader currentNavigation={features.REWARD} />
        <StudentNav currentSelectedFeature={features.REWARD} />
        <div className="a-appView a-appView--hasSidebar">
          <div className="a-appView__contents">
            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                - Use className 'o-modal--hide' to hide modal
                - Use className 'o-modal--show' to show modal
              */}
              <LoadingSpinner />
            </div>
            <header className="o-tabHeader">
              <h1 className="a-h(28)">
                {student.first_name}&rsquo;s Rewards
              </h1>
              <div className="o-tabHeader__tabs">
                {this.tabsForReward()}
              </div>
            </header>
            {this.state.activeTab === 'medals' ?
              this.medalsView()
              : <GiftCards />
            }
          </div>
          <Footer />

        </div>
      </div >
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  user: state.user,
  loading: state.loading,
});

export default connect(
  mapStateToProps,
)(Rewards);
