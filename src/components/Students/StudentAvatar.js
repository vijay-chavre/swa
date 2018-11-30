import React, { Component } from 'react';
import { Link } from 'react-router';
import * as Localization from '../Shared/Localization';
import config from '../../constants/config';
import * as SubscriptionState from '../../constants/subscriptionState';

export default class StudentAvatar extends Component {
  static propTypes = {
    student: React.PropTypes.shape({
      _id: React.PropTypes.string,
      first_name: React.PropTypes.string,
      last_name: React.PropTypes.string,
      grade: React.PropTypes.string,
    }),
    subscriptionState: React.PropTypes.string,
    onStudentSelect: React.PropTypes.func,
    studentFetched: React.PropTypes.func,
  };

  gradeOfStudent = () => {
    // if(this.props.student.grade === 'K' && config.isViaAfrika){
    //   return `${Localization.localizedStringForKey('Grade')} ${'R'}`;
    // }
    // else{
    //   if(this.props.userCountryCode && this.props.userCountryCode == 'GB'){
    //     return `${Localization.localizedStringForKey('Grade')} ${this.props.student.grade}`;
    //   }
    //   else{
    //     return `${Localization.localizedStringForKey('Grade')} ${this.props.student.grade}`;
    //   }
    // }
    return `${Localization.localizedStringForKey('Grade')} ${this.props.student.grade === 'K' && config.isViaAfrika ? 'R' : this.props.student.grade }`;
  }
  avatarForState = (subscriptionState) => {
    const imageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${this.props.student._id}.png`;
    if (subscriptionState.toLowerCase() === SubscriptionState.ONHOLD) {
      return (
        <div className="a-col a-col(1-4)">
          <button onClick={() => this.props.onStudentSelect(this.props.student)}>
            <div className="o-studentSelection__student o-studentSelection__student--status(on-hold)">
              <h2 className="a-s(14) a-allCaps o-studentSelection__studentPlan">
                Account On Hold
              </h2>

              <img className="b-avatar o-studentSelection__studentPortrait" src={imageUrl} onError="" />
              <h3 className="o-studentSelection__studentName a-p(16)">
                {this.props.student.first_name} {this.props.student.last_name}
              </h3>
              <p className="a-p(12) a-color(copy-2)">
                {this.gradeOfStudent()}
              </p>
            </div>
          </button>
        </div>
      );
    } else if (subscriptionState.toLowerCase() === SubscriptionState.CANCELED) {
      return (
        <div className="a-col a-col(1-4)">
          <button onClick={() => this.props.onStudentSelect(this.props.student)}>
            <div className="o-studentSelection__student o-studentSelection__student--status(canceled)">
              <h2 className="a-s(14) a-allCaps o-studentSelection__studentPlan">
                Account Canceled
              </h2>

              <img className="b-avatar o-studentSelection__studentPortrait" src={imageUrl} onError="" />
              <h3 className="o-studentSelection__studentName a-p(16)">
                {this.props.student.first_name} {this.props.student.last_name}
              </h3>
              <p className="a-p(12) a-color(copy-2)">
                {this.gradeOfStudent()}
              </p>
            </div>
          </button>
        </div>
      );
    } else if (subscriptionState.toLowerCase() === SubscriptionState.INACTIVE) {
      return (
        <div className="a-col a-col(1-4)" onClick={() => this.props.onStudentSelect(this.props.student)}>
          <div className="o-studentSelection__student o-studentSelection__student--status(activate)">
            <h2 className="a-s(14) a-allCaps o-studentSelection__studentPlan">
              Activate Account
            </h2>

            <img className="b-avatar o-studentSelection__studentPortrait" src={imageUrl} onError="" />
            <h3 className="o-studentSelection__studentName a-p(16)">
              {this.props.student.first_name} {this.props.student.last_name}
            </h3>
            <p className="a-p(12) a-color(copy-2)">
              {this.gradeOfStudent()}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="a-col a-col(1-4)">
        <div className="o-studentSelection__student o-studentSelection__student--plan(platinum)">
          <Link to={`/student/${this.props.student._id}`} className="o-studentSelection__studentLink" onClick={() => this.props.onStudentSelect(this.props.student)} />

          <h2 className="a-s(14) a-allCaps o-studentSelection__studentPlan">
            &nbsp;{ (this.props.student.service_id !== ENV.baseServiceId && subscriptionState.toLowerCase() !== SubscriptionState.TUTORING_SESSIONS) ? this.props.student.service_id : ''}&nbsp;
          </h2>

          <img className="b-avatar o-studentSelection__studentPortrait" src={imageUrl} onError="" />
          <h3 className="o-studentSelection__studentName a-p(16)">
            {this.props.student.first_name} {this.props.student.last_name}
          </h3>
          <p className="a-p(12) a-color(copy-2)">
            {this.gradeOfStudent()}
          </p>
        </div>
      </div>
    );
  }
  render() {
    const { subscriptionState } = this.props;
    return (
      this.avatarForState(subscriptionState)
    );
  }
}
