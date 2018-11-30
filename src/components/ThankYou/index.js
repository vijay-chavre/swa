import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import config from '../../constants/config';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ParentNav from '../Shared/ParentNav';
import * as Localization from '../Shared/Localization';


const studentappUrl =
  process.env.STUDENT_APP_URL || "https://studentapp.hellothinkster.com";

class ThankYou extends Component {
  startSkillsAssessment = () => {
    browserHistory.push('/students');
  }

  render() {
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
              Thank You
            </span>
          </div>


        </header>
        <Helmet
          title="Thinkster Math Free Trial Next Steps"
          meta={[
            {
              name: 'description',
              content: (this.props.user && this.props.user.userData && this.props.user.userData.data && this.props.user.userData.data.service && this.props.user.userData.data.service.toLowerCase() === 'lite' ? 'Welcome to Thinkster! Get started by taking the Skills Assessment.' : 'Welcome to your Thinkster Free trial! Get started by taking the Skills Assessment.')
            }
          ]}
        />
        <div className="o-thankyouHero o-thankyouHero--action">
          <div className="a-container">
            <div className="b-headerBlock b-headerBlock--hero">
              <h1 className="a-s(18)">
                <span className="a-allCaps a-s(18)__decorator">
                  Enrollment Successful
                </span>
              </h1>
              <h2 className="a-h(64)">Welcome to Thinkster</h2>

              { isLitePlan ?
                <p className="a-p(16)">
                  Your payment information has been successfully updated. <br></br>To get started, have your child
                  complete the Skills Assessment. Set aside 15-20 minutes.
                </p>
              :
                <p className="a-p(16)">
                  Your account has been successfully updated. No payment is being charged now. Billing will start after <br></br>your 1-week free trial. To get started, have your child
                  complete the Skills Assessment.
                </p>                
              }
              {/*
                END MESSAGE FOR LITE
              */}
              <div className="o-thankyouHero__CTA">
                <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--large" onClick={this.startSkillsAssessment.bind(this)}>
                  <span className="a-h(20)">
                    Start Skills Assessment
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/*
    thankyou hero box end
  */}

        {/*
    next steps start
  */}
        <div className="a-container">
          <div className="b-section o-nextSteps">
            <h3 className="a-s(18) b-section__intro">
              <span className="a-allCaps a-s(18)__decorator">
                After Skills Assessment
              </span>
            </h3>
            <div className="a-row o-nextSteps__body">
              <div className="a-col a-col(1-2)">
                <div className="o-nextSteps__img" />
              </div>
              <div className="a-col a-col(1-2)">
                <ol className="b-numList b-numList--multiColor o-nextSteps__list">
                  <li className="b-numList__item">
                    { !isLitePlan ?
                      <h2 className="a-h(22) b-numList__itemName">
                        Speak to an Academic Advisor
                      </h2>
                      :
                      <h2 className="a-h(22) b-numList__itemName">
                        Login to the Thinkster Web App
                      </h2>
                    }
                    { !isLitePlan ?
                      <p className="a-p(16)">
                        <a
                          href="https://try.hellothinkster.com/thinkster-advisor-call/"
                          target="_blank"
                          title="Schedule a call"
                        >
                          Schedule a call with a Thinkster Academic Advisor
                        </a>{" "}
                        to learn more about our math programs.
                      </p>
                    :
                      <p className="a-p(16)">
                        <a
                          href="https://studentapp.hellothinkster.com/"
                          target="_blank"
                          title="Click here"
                        >Click here</a> to login to the Thinkster Web App
                      </p>
                    }
                  </li>

                  <li className="b-numList__item">
                    { !isLitePlan ?
                      <h2 className="a-h(22) b-numList__itemName">
                        Discuss Your Child&rsquo;s Needs
                      </h2>
                      :
                      <h2 className="a-h(22) b-numList__itemName">
                        Get Digital Worksheets
                      </h2>
                    }

                    { !isLitePlan ?
                      <p className="a-p(16)">
                        The advisor will review the results of the assessment and
                        will help you select the right learning program based on
                        your child&rsquo;s needs.
                      </p>
                      :
                      <p className="a-p(16)">
                        Based on your child&rsquo;s performance on the Skills Assessment, our expert math coaches will send digital worksheets to your child&rsquo;s account on the <a href="https://studentapp.hellothinkster.com/" target="_blank" title="Thinkster Web App"> Thinkster Web App</a>.
                      </p>
                    }
                  </li>

                  <li className="b-numList__item">
                    { !isLitePlan ?
                      <h2 className="a-h(22) b-numList__itemName">
                        Learn with the Thinkster Math iPad app or web app
                      </h2>
                     :
                      <h2 className="a-h(22) b-numList__itemName">
                        Learn with 10 worksheets every week
                      </h2>
                    }
                    { !isLitePlan ?                    
                      <p className="a-p(16)">
                        Grab your iPad and{" "}
                        <a
                          href="https://itunes.apple.com/us/app/tabtor-math-personalized-tutoring/id569252433?mt=8"
                          target="_blank"
                        >
                          {" "}
                          download the Thinkster Math App
                        </a>{" "}
                        from the App Store. Or continue learning on the{" "}
                          Thinkster Math Web App.{" "}
                      </p>
                     :
                      <p className="a-p(16)">
                        Every month, you can make a max of 3 requests of specific concepts from the Progress Matrix.
                      </p>
                    }
                  </li>

                 { !isLitePlan ?
                    <li className="b-numList__item">
                      <h2 className="a-h(22) b-numList__itemName">
                        Meet Your Thinkster Coach
                      </h2>
                      <p className="a-p(16)">
                        We will match your child with a dedicated Thinkster coach
                        who will create a custom learning plan.
                      </p>
                    </li>
                 : ''}
                </ol>
              </div>
            </div>
          </div>
          {/*
      next steps end
      */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session || { userId: "", token: "" },
  user: state.user,
});

const actionCreators = {};

export default connect(mapStateToProps, actionCreators)(ThankYou);
