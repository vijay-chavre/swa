import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import * as Localization from '../Shared/Localization';
import * as ZendeskActions from '../../actions/zendesk';
import * as AddonActions from '../../actions/addon';

import * as SessionActions from '../../actions/session';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

export class SwitchModal extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { fetchAddons, user, addons, switchToBillingSubject } = this.props;
    if (user && addons && !addons.addons) {
      fetchAddons({ user });
    }
  }

  dismissModal(e) {
    const { resetZendeskData } = this.props;
    resetZendeskData();
    if (this.props.hide3MonthBillingModal) {
      this.props.hide3MonthBillingModal();
    }
  }

  createZendeskTicket(e) {
    const { user, createZendeskTicket } = this.props;
    const parentName = `${user.first_name} ${user.last_name}`;
    const data = {
      subject: this.props.switchToBillingSubject,
      body: this.props.switchToBillingSubject + `\n Name: ${parentName}\nEmail Address: ${user.email_address}`,
      user: user._id,
      name: parentName,
      email: user.email_address,
    };
    createZendeskTicket({ data });
  }

  getPlanSavings() {
    const { addons, user } = this.props;
    let savingsPerMonth = 0;
    let studentsPlanKeys;
    let addonsKeys;

    if (addons && addons.addons && user && user.planDetails) {
      studentsPlanKeys = Object.keys(user.planDetails);
      addonsKeys = Object.keys(addons.addons);

      for (let index = 0; index < studentsPlanKeys.length; index++) {
        const serviceId = user.planDetails[studentsPlanKeys[index]].service_id;
        const gradeRange = user.planDetails[studentsPlanKeys[index]].grade_range;
        if (addons.addons[gradeRange] && addons.addons[gradeRange][serviceId] && addons.addons[gradeRange][serviceId][3] && addons.addons[gradeRange][serviceId][1]) {
          const amountPerMonth = addons.addons[gradeRange][serviceId][1].amount;
          const amountPer3Month = addons.addons[gradeRange][serviceId][3].amount;
          const savings = (amountPerMonth * 3 - amountPer3Month) / 3;
          savingsPerMonth += savings;
        }
      }
      const currency = this.getCurrency(studentsPlanKeys[0]);


      if (this.props.billingType === 1) {
        return (<p className="a-p(14) a-p(14)--spacerTop">
          {Localization.localizedStringForKey('Based on your current plan')}, <strong className="a-color(active-3)">{Localization.localizedStringForKey(`you'll be paying ${currency}${savingsPerMonth} more.`)}</strong>
          <br /><br />
          {Localization.localizedStringForKey('Your request to switch to 1 month plan will be sent to our support team. They will be in touch with you soon.')}
        </p>);
      }
      return (<p className="a-p(14) a-p(14)--spacerTop">
        {Localization.localizedStringForKey('Based on your current plan')}, <strong className="a-color(active-3)">{Localization.localizedStringForKey(`you'll save ${currency}${savingsPerMonth} a month!`)}</strong>
        <br /><br />
        {Localization.localizedStringForKey('Your request to switch to 3 month plan will be sent to our support team. They will be in touch with you soon.')}
      </p>);
    }
  }

  getCurrency(studentId) {
    const { user } = this.props;
    if (studentId) {
      if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId] && user.planDetails[studentId].currency) {
        return user.planDetails[studentId].currency.symbol_native;
      }
    } else if (user && user.students) {
      const students = Object.keys(user.students);
      if (user && user.students && user.students[students[0]] && user.planDetails && user.planDetails[students[0]] && user.planDetails[students[0]].currency) {
        return user.planDetails[students[0]].currency.symbol_native;
      }
    }
    return '';
  }

  getPaymentDetails() {
    const { user } = this.props;

    return (user.paymentStatus ?
      <p className="a-p(14) a-p(14)--spacerTop">
        {user.paymentStatus.nextBillingDate && user.paymentStatus.currency_code && user.paymentStatus.nextBillAmount != 0 && user.paymentStatus.nextBillingDate ?
          [<span>{Localization.localizedStringForKey('Your upcoming payment of ')}</span>,
          <span className="a-color(copy-1)">{user.paymentStatus.currency_code + user.paymentStatus.nextBillAmount}</span>,
          <span>{Localization.localizedStringForKey(' will be processed on ')}</span>,
          <span className="a-color(copy-1)">{moment(user.paymentStatus.nextBillingDate).format('LL')}</span>]
          :
          Localization.localizedStringForKey('No upcoming payments.')
        }
        <br />
        {user.paymentStatus.nextBillingDate && user.paymentStatus.currency_code && user.paymentStatus.nextBillAmount != 0 && user.paymentStatus.nextBillingDate && user.paymentStatus.creditcard ?
          [<span>{Localization.localizedStringForKey('Your Visa ending in ')}</span>,
          <span className="a-color(copy-1)">{user.paymentStatus.creditcard.last4}</span>,
          <span>{Localization.localizedStringForKey(' will be charged automatically.')}</span>]
          :
          ''
        }
      </p>
      : 'NA');
  }

  render() {
    const { addons, zendesk } = this.props;
    return (
      <div className={`o-modal o-modal--${this.props.showModal ? 'show' : 'hide'}`}>
        {addons && !addons.addons && this.props.loading && this.props.loading.isLoading ?
          <div className={'o-loadingScreenModal o-loadingScreenModal--show'}>
            {/* Loading screen animation notification
              - Use className 'o-modal--hide' to hide modal
              - Use className 'o-modal--show' to show modal
            */}
            <LoadingSpinner />
          </div>
          :
          <div className="o-modal__box o-modal__box--small">
            {zendesk && (zendesk.createdTicket || zendesk.createTicketFailed) ?
              [<div className="a-color(copy-2)">
                <p className="a-p(14) a-p(14)--spacerTop" style={{ textAlign: 'center' }}>
                  {zendesk.createdTicket ? 'Request sent successfully.' : 'Request could not be sent at the moment. Please try again later'}
                </p>
              </div>,
              <div className="o-modal__actions">
                <button className="b-button b-button--fullWidth b-button--borderless a-mTop(8)" type="button" onClick={this.dismissModal.bind(this)}>
                  <span className="b-button__label a-color(active-2)">
                    <strong>
                      {Localization.localizedStringForKey('Ok')}
                    </strong>
                  </span>
                </button>
              </div>] :

              [<h1 className="a-s(22) a-justify(center)">
                {Localization.localizedStringForKey(this.props.switchToBillingSubject + '?')}
              </h1>,
              <div className="a-color(copy-2)">
                <p className="a-p(14) a-p(14)--spacerTop">
                  {Localization.localizedStringForKey(`Starting your next billing cycle, all your plans will be charged on a ${ this.props.billingType} month billing cycle.`)}
                </p>
                {this.getPlanSavings()}
                {/* this.getPaymentDetails() */}
              </div>,
              <div className="o-modal__actions">
                <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--fullWidth b-flatBtn--large" onClick={this.createZendeskTicket.bind(this)}>
                  <span className="b-button__label">
                  {
                    this.props.billingType === 1 ? Localization.localizedStringForKey(this.props.switchToBillingSubject) : Localization.localizedStringForKey(this.props.switchToBillingSubject + ' & Save!')
                  }   
                  </span>
                </button>
                <button className="b-button b-button--fullWidth b-button--borderless a-mTop(8)" type="button" onClick={this.dismissModal.bind(this)}>
                  <span className="b-button__label a-color(active-2)">
                    <strong>
                    {
                    this.props.billingType === 1 ? Localization.localizedStringForKey("No thanks, I like saving money.") : Localization.localizedStringForKey("No thanks, I don't like saving money.")
                    }
                    </strong>
                  </span>
                </button>
              </div>]

            }
          </div>
        }

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  loading: state.loading,
  zendesk: state.zendesk,
  addons: state.addons,
});

const actionCreators = {
  createZendeskTicket: ZendeskActions.createZendeskTicket,
  resetZendeskData: ZendeskActions.resetZendeskData,
  fetchAddons: AddonActions.fetchAddons,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(SwitchModal);
