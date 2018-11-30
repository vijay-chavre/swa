import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import config from '../../constants/config';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import Checkmark from '../Shared/Glyphs/Checkmark';
import * as Localization from '../Shared/Localization';

import * as StudentActions from '../../actions/student';
import * as AddonActions from '../../actions/addon';
import * as SessionActions from '../../actions/session';


const studentappUrl =
  process.env.STUDENT_APP_URL || 'https://studentapp.hellothinkster.com';

class ContinueRegistration extends Component {

  componentDidMount(){
    const { fetchAddons, user } = this.props;
    fetchAddons({ user });
  }

  startSkillsAssessment = () => {
    browserHistory.push('/students');
  }

  checkUserStatus(e) {
    const { saveStudentDetails } = this.props;
    if (this.props.user && this.props.user.fetchedUser && this.props.user.fetchedPaymentStatus) {
      if (this.props.user.students && Object.keys(this.props.user.students).length === 0) {
        browserHistory.push(`/${this.props.user._id}/addstudent/1`);
      } else if (!this.props.user.paymentStatus.creditcard) {
        saveStudentDetails({ 
          nextURL: '/thank-you',
          firstTimeCC: true, });
        browserHistory.push('/payment/5');
        //Removing summary page for users who have aborted after step 2 as its inconsistent with add student flow
        // browserHistory.push('/summarybeforepayment');
        
      }
    }
  }

  getUserFirstName() {
    const { user } = this.props;
    if (user && user.first_name) { return user.first_name; }
    if (user && user.last_name) { return user.last_name; }
  }

  getSecondStepStatus() {
    const { user } = this.props;
    if (user && user.students && Object.keys(user.students).length > 0) {
      return <Checkmark />;
    }

    return 2;
  }

  render() {
    const { logout } = this.props;
    var isLitePlan = false;
    if (this.props.user && this.props.user.userData && this.props.user.userData.data && this.props.user.userData.data.service && this.props.user.userData.data.service.toLowerCase() === 'lite') {
      isLitePlan = true;
    }

    return (
      <div>
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
          <div className="o-appHeader__breadcrumb">
            : &nbsp;
            <span className="a-strong a-color(copy-1)">
              Continue Registering
            </span>
          </div>

          <ul className="o-appHeader__actions">
            <li onClick={() => { logout(); browserHistory.push('/login'); }} className="o-appHeader__actionItem">
              <Link to="#" className="o-appHeader__actionLink" >
                {Localization.localizedStringForKey('Log Out')}
              </Link>
            </li>
          </ul>

        </header>
        <Helmet
          title="Thinkster Math | Continue Registration"
          meta={[
            {
              name: 'description',
              content: 'Welcome to your Thinkster Free trial! Get started by taking the Skills Assessment.' },
          ]}
        />
        <div className="a-appView a-appView--altBG o-gradeSelection">
          <div className="a-appView__contents">
            <div className="a-container a-container__intro b-section b-section__intro">
              <h2 className="a-h(28)">
                {Localization.localizedStringForKey(`Welcome back, ${this.getUserFirstName()}!`)}
              </h2>
              <p className="a-p(14) a-color(copy-2) a-limiter a-limiter(800)">
                We&rsquo;re excited to have you try Thinkster Math.
              </p>

              <div className="a-row a-justifyContent(center) o-trialSteps">
                <div className="a-col a-col(1-3)">
                  <div className="o-trialSteps__step o-trialSteps__step--(1) o-trialSteps__step--current">
                    <div className="b-circleBox b-circleBox--size(48) b-circleBox--color(active-1)">
                      <p className="o-trialSteps__stepStatus">
                        <Checkmark />
                      </p>
                    </div>
                    <p className="a-p(16) o-trialSteps__stepLabel">
                      Create Your Parent Account
                    </p>
                  </div>
                </div>
                <div className="a-col a-col(1-3)">
                  <div className="o-trialSteps__step o-trialSteps__step--(2)">
                    <div className="b-circleBox b-circleBox--size(48) b-circleBox--color(active-1)">
                      <p className="o-trialSteps__stepStatus">
                        {this.getSecondStepStatus()}
                      </p>
                    </div>
                    <p className="a-p(16) o-trialSteps__stepLabel">
                      Enroll Your Child
                    </p>
                  </div>
                </div>
                <div className="a-col a-col(1-3)">
                  <div className="o-trialSteps__step o-trialSteps__step--(3)">
                    <div className="b-circleBox b-circleBox--size(48) b-circleBox--color(active-1)">
                      <p className="o-trialSteps__stepStatus">
                        3
                      </p>
                    </div>
                    <p className="a-p(16) o-trialSteps__stepLabel">
                      Set Up Your Payment Method
                    </p>
                  </div>
                </div>
              </div>
              <h3 className="a-h(20)">
                { isLitePlan ? 'Your next step is to complete your Lite plan purchase.' : 'Your next step is to set up your free trial.' }
              </h3>

              <p className="b-section__actions b-section__actions--useFlex">
                <a onClick={this.checkUserStatus.bind(this)} className="b-flatBtn b-flatBtn--large" style={{ cursor: 'pointer' }}>
                
                  <span className="b-button__label" >
                    { isLitePlan ? 'Get Started with Lite Plan' : 'Complete Your Free Trial' }
                  </span>
                </a>
              </p>
              <div className="a-row a-justifyContent(center) o-pricingPlan">
                <div className="a-col a-col(2-3)">
                
                  <h3 className="a-h(28)">
                    { isLitePlan ? 'Thinkster Lite Plan.' : 'Free Trial to Thinkster Gold.' }
                  </h3>
                  <p className="a-p(16) o-pricingPlan__summary  o-pricingPlan__summary--active4">
                    { isLitePlan ? 'Our Lite plan is great for children who want access to our math worksheets but don’t need teacher personalization, guidance, or one-on-one tutoring. This is an enrichment tool for independent practice to accelerate math learning.' : 'Our Gold plan pairs your child with an expert math tutor for one-on-one whiteboard tutoring sessions, homework help & test prep.' }
                  </p>
                  {/*
                    HIDE THE BELOW MESSAGE FOR LITE
                  */}
                  { !isLitePlan ?
                    <p className="a-p(16) a-break">
                      Once your account is activated, please have your child complete the Skills Assessment. An Academic Advisor will then call you to discuss the results, how the program works, and match your child to their dedicated coach.
                    </p> : ''
                  }
                  <h3 className="a-h(22) a-break a-break--before">
                    Have Questions or Need Help?
                  </h3>
                  <p className="a-p(14)">
                    Call us at 888-204-7484 or send an email to support@hellothinkster.com.
                  </p>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session || { userId: '', token: '' },
  user: state.user,
});

const actionCreators = {
  fetchAddons: AddonActions.fetchAddons,
  saveStudentDetails: StudentActions.saveStudentDetails,
  logout: SessionActions.logout,
};

export default connect(mapStateToProps, actionCreators)(ContinueRegistration);
