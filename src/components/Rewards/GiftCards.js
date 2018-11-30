import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as StudentActions from '../../actions/student';
import * as ConfigurationActions from '../../actions/configuration';
import Dialog from '../Shared/Dialog';
import * as features from '../../constants/feature';
import * as SubscriptionState from '../../constants/subscriptionState';

class GiftCards extends React.Component {

  static propTypes = {
    fetchStudent: React.PropTypes.func,
    fetchConfiguration: React.PropTypes.func,
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    configuration: React.PropTypes.shape({
    }),
    session: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      rewardCards: [],
      rewardConfiguration: undefined,
      profileRewardCard: undefined,
      profileRewardCategory: undefined,
      headerNote: '',
      detailNote: '',
      footerNote: '',
      lastRewardNote: '',
      unRedeemAmountNote: '',
      generalDisclaimer: '',
      emailAddress: '',
      showDialog: false,
      dialogMessage: '',
      rewardCategories: {
        GUEST: 0,
        TRIAL: 1,
        INELIGIBLE_PLAN: 2,
        B2C: 3,
      },
    };
    this.initializeRewardConfiguration();
  }

  onAcceptDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '', acceptButtonLabel: undefined });
  }

  onCardSelectionDone = (selectedCard) => {
    const { student, fetchStudent } = this.props;
    const profileSummary = {};
    if (selectedCard) {
      profileSummary.reward_card = selectedCard;
      if (this.state.redemptionPossible) {
        profileSummary.reward_gracePeriodStatus = true;
      }
      //const url = `user/${student._id}/summary`;
      const url = `/v1/students/${student._id}/updatesummary`;
      this.saveSelectedcard(url, profileSummary).then((response, error) => {
        if (response && response.data && response.data.status.toLowerCase() === 'ok') {
          this.state.profileRewardCard = selectedCard;
          fetchStudent({ studentId: student._id });
          this.setState({ showDialog: true, dialogMessage: Localization.localizedStringForKey('Reward Card Saved Sucessfully.'), acceptButtonLabel: 'OK' });
        } else if (error) {
          console.log(error);
        }
      });
    }
  }

  onRewardCardSelect = (rewardCard) => {
    if (this.state.profileRewardCategory !== this.state.rewardCategories.B2C) {
      return;
    }
    if (!this.state.profileRewardCard || (this.state.profileRewardCard && (this.state.profileRewardCard.sku !== rewardCard.sku))) {
      this.setState({ profileRewardCard: rewardCard });
      this.onCardSelectionDone(rewardCard);
    }
  }

  rewardCategoryForProfile = () => {
    const { student, user } = this.props;
    const state = Common.stateOfStudent(student, user);
    let rewardCategory = this.state.rewardCategories.TRIAL;

    if (Common.isGuest(user)) {
      rewardCategory = this.state.rewardCategories.GUEST;
    } else if (!Common.authorized(student, features.REWARD_GIFT)) {
      rewardCategory = this.state.rewardCategories.INELIGIBLE_PLAN;
    } else if (state.toLowerCase() === SubscriptionState.ONBOARDING || state.toLowerCase() === SubscriptionState.ONGOING) {
      rewardCategory = this.state.rewardCategories.B2C;
    }

    return rewardCategory;
  }

  saveSelectedcard = (url, profileSummary) => {
    const { session } = this.props;
    return axios({
      method: 'POST',
      baseURL: ENV.apiEndPoint,
      url,
      data: profileSummary,
      headers: { Authorization: `JWT ${session.token}` },
    });
  }

  rewardCardView = () => {
    const rewardCards = [];
    if (this.state.rewardCards) {
      this.state.rewardCards.forEach((rewardCard) => {
        rewardCards.push(
          <li className="a-col a-col-lg-1(1-5) a-col-med-1(1-4) a-col(1-3) a-col-mobile(1-2)">
            <button className="o-giftCard" onClick={() => this.onRewardCardSelect(rewardCard)}>
              <img src={rewardCard.imageUrl} className="o-giftCard__image" />
              <span className="a-p(14) o-giftCard__title">
                {rewardCard.description}
              </span>
            </button>
          </li>
        );
      });
    }
    return (
      <ol className="a-row a-justifyContent(center)">{rewardCards}</ol>
    );
  }

  initializeRewardConfiguration = () => {
    // fetch configuration everytime page is visited
    this.props.fetchConfiguration({
      type: 'reward_redemption',
    });
  }

  redeemDetailsForCountry = (countryCode) => {
    let redeemDetails;
    if (this.state.rewardConfiguration.country_redeem_amount) {
      const filteredByCountry = this.state.rewardConfiguration.country_redeem_amount.filter((obj) => {
        return obj.country.toLowerCase() === countryCode;
      });
      if (filteredByCountry && filteredByCountry.length > 0) {
        redeemDetails = filteredByCountry[0];
      }
    }

    return redeemDetails;
  }

  approvedCardsForCountry = (countryCode) => {
    const approvedCards = this.state.rewardConfiguration.ApprovedCards;
    const rewardCards = [];
    if (approvedCards.length > 0) {
      approvedCards.forEach((approvedCard) => {
        const rewardCard = {};
        if (approvedCard.country.includes(countryCode.toUpperCase())) {
          rewardCard.description = approvedCard.description;
          rewardCard.imageUrl = this.localImageUrl(approvedCard.sku);
          rewardCard.sku = approvedCard.sku;
          rewardCard.maxPrice = approvedCard.maxPrice;
          rewardCard.minPrice = approvedCard.minPrice;
          rewardCard.unitPrice = approvedCard.unitPrice;
          rewardCard.denomination = 0;
          if (approvedCard.denomination) {
            rewardCard.denomination = approvedCard.denomination;
          }
          rewardCard.disclaimer = approvedCard.disclaimer;
          rewardCards.push(rewardCard);
        }
      });
      return rewardCards;
    }
  }

  initializeData = () => {
    const { student, user, configuration } = this.props;
    let userCountryRedeemDetails;
    if (student && student.summary && student.summary.reward_card) { // if reward card is already selected
      if (!this.state.profileRewardCard) {
        this.state.profileRewardCard = student.summary.reward_card;
      }
    }

    if (user && configuration && configuration.reward_redemption) {
      this.state.rewardConfiguration = configuration.reward_redemption;
    }

    if (this.state.rewardConfiguration) {
      let userCountryCode = user.country_code.toLowerCase();
      if (user.reward_country_code) { // overriding the country code incase reward country code is present.
        userCountryCode = user.reward_country_code.toLowerCase();
      }
      this.state.rewardCards = this.approvedCardsForCountry(userCountryCode);
      userCountryRedeemDetails = this.redeemDetailsForCountry(userCountryCode);
    }

    if (userCountryRedeemDetails) {
      const locale = userCountryRedeemDetails.country_locale_code;
      this.state.profileRewardCategory = this.rewardCategoryForProfile();
      const pointsPerCurrencyUnit = this.state.rewardConfiguration.maximum_redeem_points / userCountryRedeemDetails.redeemAmount;
      this.state.detailNote = `For every ${pointsPerCurrencyUnit} points you get ${Localization.formatNumberToCurrency(1, locale)} in giftcards, up to a maximum of ${Localization.formatNumberToCurrency(userCountryRedeemDetails.redeemAmount, locale)}/month. That means your monthly goal of ${this.state.rewardConfiguration.maximum_redeem_points} points will get you ${Localization.formatNumberToCurrency(userCountryRedeemDetails.redeemAmount, locale)} in giftcards. We also accrue your unredeemed gifts and you can change your selection any time. Start tracking your points! Make giftcard selection now!`;
      if (this.state.profileRewardCategory === this.state.rewardCategories.GUEST) {
        this.state.headerNote = Localization.localizedStringForKey('You will be eligible for this once you register and subscribe.');
      } else if (this.state.profileRewardCategory === this.state.rewardCategories.TRIAL) {
        this.state.headerNote = Localization.localizedStringForKey('You will be eligible for this once you subscribe.');
      } else if (this.state.profileRewardCategory === this.state.rewardCategories.INELIGIBLE_PLAN) {
        this.state.headerNote = Localization.localizedStringForKey('Your current plan is not eligible for this feature. Please upgrade to Personalized Tutor-Led program to use this feature.');
      } else if (this.state.profileRewardCategory === this.state.rewardCategories.B2C) {
        if (this.state.profileRewardCard) {
          this.state.profileRewardCard.imageUrl = this.localImageUrl(this.state.profileRewardCard.sku);
          this.state.headerNote = Localization.localizedStringForKey(`Reach Your Goal of ${this.state.rewardConfiguration.maximum_redeem_points} Points This Month and Earn a Gift Card!`);
          this.state.detailNote = `Thinkster Math subscribers can exchange reward points for gift cards. You have selected a ${this.state.profileRewardCard.description}*`;

          let email = user.email_address;
          if (user.updates_emails) {
            email = `${email}, ${user.updates_emails}`;
          }
          this.state.emailAddress = email;
          if (student.summary && student.summary.reward_unredeemAmount) {
            const rewardUnredeemAmount = student.summary.reward_unredeemAmount;
            if (rewardUnredeemAmount > 0) {
              this.state.unRedeemAmountNote = Localization.localizedStringForKey(`You have a current un-redeemed gift for ${Localization.formatNumberToCurrency(rewardUnredeemAmount, locale)}`);
            }
          }
          if (student.summary.reward_orders) {
            const redemptionOrders = student.summary.reward_orders;
            if (redemptionOrders && redemptionOrders.length > 0) {
              const latestOrder = redemptionOrders.slice(-1)[0];
              let cardAmount = latestOrder.amount;
              // overriding incase country specific amount exists
              if (latestOrder.base_amount) {
                cardAmount = latestOrder.base_amount;
              }
              cardAmount = parseFloat(cardAmount) / 100; // convert to $
              const datePart = moment(latestOrder.delivered_at).format('ll');
              this.state.lastRewardNote = `Your last reward card worth ${Localization.formatNumberToCurrency(cardAmount, locale)} was sent on ${datePart}. Congratulations and keep earning those points!`;
            }
          }
        } else {
          this.state.headerNote = Localization.localizedStringForKey('Thinkster Math Students Can Exchange their Reward Points for a Giftcard.');
          this.state.footerNote = 'Make your giftcard selection below.';
        }
      }
      this.state.generalDisclaimer = this.state.rewardConfiguration.general_disclaimer;
    } else {
      // this.setState({ showDialog: true, dialogMessage: Localization.localizedStringForKey('Giftcards are not available for your country.'), acceptButtonLabel: 'OK' });
    }
  }

  localImageUrl = (sku) => {
    if (sku === 'AMZN-E-V-STD') {
      return ('/images/amazon-gift-card.jpg');
    } else if (sku === 'TRGT-E-500-BULS') {
      return ('/images/target-gift-card.jpg');
    } else if (sku === 'BSTB-E-500-STD') {
      return ('/images/best-buy-gift-card.jpg');
    } else if (sku === 'WALM-E-500-STD') {
      return ('/images/walmart-gift-card.jpg');
    } else if (sku === 'TNGO-E-V-STD') {
      return ('/images/tango-gift-card.jpg');
    } else if (sku === 'CHIL-E-V-STD') {
      return ('/images/chilis-gift-card.jpg');
    } else if (sku === 'APPL-E-1000-STD') {
      return ('/images/itunes-gift-card.jpg');
    } else if (sku === 'FAND-E-1000-STD') {
      return ('/images/chilis-gift-card.jpg');
    } else if (sku === 'AMUK-E-500-STD') {
      return ('/images/amazon-gift-card.jpg');
    }
    return '';
  }


  render() {
    const { user } = this.props;
    this.initializeData();
    return (
      <div>
        <Dialog
          show={this.state.showDialog}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
          acceptButtonLabel={this.state.acceptButtonLabel}
        />
        { !this.state.profileRewardCard ?
          <div className="a-container">
            <div className="a-container__intro">
              <h1 className="a-h(28)">
                {this.state.headerNote}
              </h1>
              <p className="a-limiter a-limiter(800) a-p(14) a-color(copy-2)">
                {this.state.detailNote}
              </p>
              <p className="a-limiter a-limiter(800) a-p(14)">
                { this.state.footerNote }
              </p>
            </div>
            {this.rewardCardView()}
            <p className="a-p(14) a-color(copy-2) b-fineprint">
              {this.state.generalDisclaimer}
            </p>
          </div> :
          <div className="a-container v-rewardsStatus">
            <div className="a-container__intro v-rewardsStatus__intro">
              <h1 className="a-h(28)">
                {this.state.headerNote}
              </h1>
              <p className="a-limiter a-limiter(800) a-p(14) a-color(copy-2)">
                {this.state.detailNote}
              </p>
              <p className="a-limiter a-limiter(800) a-p(14)">
                {Localization.localizedStringForKey(`Your Reward will be sent to ${this.state.emailAddress}.`)}
              </p>
            </div>
            <div>
              <ol className="a-row a-row(tablet) a-justifyContent(center)">
                <li className="a-col a-col-lg-1(1-5) a-col-med-1(1-4) a-col(1-3) a-col-mobile(1-2)">
                  <button className="o-giftCard v-rewardsStatus__card">
                    <img src={this.state.profileRewardCard.imageUrl} className="o-giftCard__image" />
                    <span className="a-p(14) o-giftCard__title">
                      {this.state.profileRewardCard.description}
                    </span>
                  </button>
                </li>
              </ol>
              <p className="a-p(14) a-strong a-justify(center)">
                {this.state.unRedeemAmountNote || ''}
              </p>
              <p className="a-p(14) a-justify(center)">
                {this.state.lastRewardNote || ''}
              </p>
            </div>
            <div className="a-justify(center) v-rewardsStatus__giftCardSelector">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('Prefer a different card? Pick from one of our other available options:')}
              </p>
            </div>
            {this.rewardCardView()}
            <p className="a-p(14) a-color(copy-2) b-fineprint">
              {this.state.profileRewardCard.disclaimer}
            </p>
            <p className="a-p(14) a-color(copy-2) b-fineprint">
              {this.state.generalDisclaimer}
            </p>
          </div>
        }
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  student: state.student,
  user: state.user,
  configuration: state.configuration,
  session: state.session,
});
const actionCreators = {
  fetchStudent: StudentActions.fetchStudent,
  fetchConfiguration: ConfigurationActions.fetchConfiguration,
};
export default connect(
  mapStateToProps,
  actionCreators,
)(GiftCards);
