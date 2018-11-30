import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import * as Localization from '../Shared/Localization';
import * as SessionActions from '../../actions/session';
import * as StudentActions from '../../actions/student';
import lodash from 'lodash';
import ExamIcon from '../Shared/Glyphs/ExamIcon';

class UserSessions extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({

    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      products: [],
    };
  }

  getCurrency(studentId) {
    const { user } = this.props;

    if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId] && user.planDetails[studentId].currency) { return user.planDetails[studentId].currency.symbol_native; }
    return '-';
  }

  getPaymentInfo(studentId) {
    const { user } = this.props;

    let amount = '-';
    let frequency = '-';

    if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId]) {
      amount = this.getCurrency(studentId) + user.planDetails[studentId].amount;
      frequency = (user.planDetails[studentId].billingFrequency > 1 ? `${user.planDetails[studentId].billingFrequency} months` : ' month');
    }

    return ([<span>{amount}</span>, <span className="a-p(14) a-color(copy-2)">&nbsp;/&nbsp;{frequency}</span>]);
  }

  getSubAction(studentId) {
    return (<Link to={`/modify-plan/${studentId}`}>
      <span className="a-p(14)">
        {Localization.localizedStringForKey('Modify Plan')}
      </span>
      <ArrowRight />
    </Link>);
  }

  setNextURL(studentId, e) {
    const { saveStudentDetails } = this.props;
    const student = {
      nextURL: `/modify-plan/${studentId}`,
    };
    saveStudentDetails(student);
  }

  getPlanStatus(studentId) {
    const { user } = this.props;

    let studentIndex = -1;
    if (user.paymentStatus) {
      studentIndex = lodash.findIndex(user.paymentStatus.students, { id: studentId });
      if (studentIndex !== -1 && user.paymentStatus.students[studentIndex] &&
        user.paymentStatus.students[studentIndex].enrollment_end_date != null) {
        return (<p className="o-subscription__planName a-s(12) a-allCaps">
          {Localization.localizedStringForKey('(Cancelled)')}
        </p>
        );
      }
    }
  }

  getColor(name) {
    switch (name) {
      case 'State Tests': return '#9761FF';
      case 'PARCC': return '#1691B0';
      case 'CogAT': return '#FFC000';
      case 'SBAC': return '#84D42D';
    }
    return '';
  }

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

  // Added simple function for now, if number increases then use some npm library
  numberToWord = (number) => {
    let numberWord = '';
    if (number === 1) {
      numberWord = 'One';
    } else if (number === 2) {
      numberWord = 'Two';
    } else if (number === 3) {
      numberWord = 'Three';
    } else if (number === 4) {
      numberWord = 'Four';
    } else if (number === 5) {
      numberWord = 'Five';
    } else if (number === 10) {
      numberWord = 'Ten';
    }
    return numberWord;
  }
  render() {
    const { user } = this.props;

    if (user.products && user.products.length > 0) {
      this.state.products = user.products.filter(product => product.product_type === 'SESSIONS');
    } else {
      this.state.products = [];
    }
    return (
      <div>
        <section className="b-section">
          {this.state.products && this.state.products.length > 0 ? this.state.products.map((product) => (
            <div className={`o-subscription o-subscription--product(${  this.getProductStyle(product)  })`}>
              <div className="o-subscription__productPortrait">
                <ExamIcon />
              </div>

              <div>
                <p className="o-subscription__planName a-s(12) a-allCaps">
                  {`${product.product_display_name} (${product.quantity})`}
                </p>
                <p className="o-subscription__student a-p(14)">
                  {`${this.numberToWord(product.quantity)} - 30 min private tutoring sessions for Grade(${product.grade_range}), $30 each.`}
                </p>
              </div>

              <div className="o-subscription__billingInfo">
                <p className="a-p(12) a-strong a-color(active-3)">
                  {product.is_active === 1 ? Localization.localizedStringForKey('Active') : Localization.localizedStringForKey('Inactive')}
                </p>
                <p className="a-p(16)">
                  {`${product.product_price_currency} ${product.product_price}`}
                </p>
              </div>
              
            </div>
          )) : <p className="a-p(14)">Did you know Thinkster has One-on-one 30 minute interactive, online math tutoring sessions with a Thinkster coach who will help your child improve their math skills and performance. The sessions can be used for homework help, test prep, or for topics your child finds challenging and needs the help of a tutor to understand.</p>
          }
        </section>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
});

const actionCreators = {
  logout: SessionActions.logout,
  saveStudentDetails: StudentActions.saveStudentDetails,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(UserSessions);
