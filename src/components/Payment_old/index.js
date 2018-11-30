import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import lodash from 'lodash';

import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ParentNav from '../Shared/ParentNav';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';

import * as PaymentActions from '../../actions/payment';

export class Payment extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({

    }),
    fetchAddons: React.PropTypes.func,
  }

  componentDidMount() {
    const { user } = this.props;
    this.state = {};
    this.state.countrySelected = (user && user.country_code ? user.country_code : null);
  }

  setCountry(e) {
    if (e && e.target) {
      this.setState({ countrySelected: e.target.value });
    }
  }

  getCountryDropDown() {
    const { user } = this.props;
    return (<select defaultValue={(user && user.country_code ? user.country_code : '')} className="" style={{ height: '30px' }} id="country" onChange={this.setCountry.bind(this)}>
      <option value="">Select Country</option>
      <option value="US">United States</option>
      <option value="GB">United Kingdom</option>
      <option value="CA">Canada</option>
      <option value="AU">Australia</option>
      <option value="IN">India</option>
      <option value="AF">Afghanistan</option>
      <option value="AL">Albania</option>
      <option value="DZ">Algeria</option>
      <option value="AS">American Samoa</option>
      <option value="AD">Andorra</option>
      <option value="AO">Angola</option>
      <option value="AI">Anguilla</option>
      <option value="AQ">Antarctica</option>
      <option value="AG">Antigua And Barbuda</option>
      <option value="AR">Argentina</option>
      <option value="AM">Armenia</option>
      <option value="AW">Aruba</option>
      <option value="AT">Austria</option>
      <option value="AZ">Azerbaijan</option>
      <option value="BS">Bahamas</option>
      <option value="BH">Bahrain</option>
      <option value="BD">Bangladesh</option>
      <option value="BB">Barbados</option>
      <option value="BY">Belarus</option>
      <option value="BE">Belgium</option>
      <option value="BZ">Belize</option>
      <option value="BJ">Benin</option>
      <option value="BM">Bermuda</option>
      <option value="BT">Bhutan</option>
      <option value="BO">Bolivia</option>
      <option value="BA">Bosnia And Herzegowina</option>
      <option value="BW">Botswana</option>
      <option value="BV">Bouvet Island</option>
      <option value="BR">Brazil</option>
      <option value="IO">British Indian Ocean Territory</option>
      <option value="BN">Brunei Darussalam</option>
      <option value="BG">Bulgaria</option>
      <option value="BF">Burkina Faso</option>
      <option value="BI">Burundi</option>
      <option value="KH">Cambodia</option>
      <option value="CM">Cameroon</option>
      <option value="CV">Cape Verde</option>
      <option value="KY">Cayman Islands</option>
      <option value="CF">Central African Republic</option>
      <option value="TD">Chad</option>
      <option value="CL">Chile</option>
      <option value="CN">China</option>
      <option value="CX">Christmas Island</option>
      <option value="CC">Cocos (Keeling) Islands</option>
      <option value="CO">Colombia</option>
      <option value="KM">Comoros</option>
      <option value="CG">Congo</option>
      <option value="CD">Congo, The Democratic Republic Of The</option>
      <option value="CK">Cook Islands</option>
      <option value="CR">Costa Rica</option>
      <option value="CI">{"Cote D'Ivoire"}</option>
      <option value="HR">Croatia (Local Name: Hrvatska)</option>
      <option value="CU">Cuba</option>
      <option value="CY">Cyprus</option>
      <option value="CZ">Czech Republic</option>
      <option value="DK">Denmark</option>
      <option value="DJ">Djibouti</option>
      <option value="DM">Dominica</option>
      <option value="DO">Dominican Republic</option>
      <option value="TP">East Timor</option>
      <option value="EC">Ecuador</option>
      <option value="EG">Egypt</option>
      <option value="SV">El Salvador</option>
      <option value="GQ">Equatorial Guinea</option>
      <option value="ER">Eritrea</option>
      <option value="EE">Estonia</option>
      <option value="ET">Ethiopia</option>
      <option value="FK">Falkland Islands (Malvinas)</option>
      <option value="FO">Faroe Islands</option>
      <option value="FJ">Fiji</option>
      <option value="FI">Finland</option>
      <option value="FR">France</option>
      <option value="FX">France, Metropolitan</option>
      <option value="GF">French Guiana</option>
      <option value="PF">French Polynesia</option>
      <option value="TF">French Southern Territories</option>
      <option value="GA">Gabon</option>
      <option value="GM">Gambia</option>
      <option value="GE">Georgia</option>
      <option value="DE">Germany</option>
      <option value="GH">Ghana</option>
      <option value="GI">Gibraltar</option>
      <option value="GR">Greece</option>
      <option value="GL">Greenland</option>
      <option value="GD">Grenada</option>
      <option value="GP">Guadeloupe</option>
      <option value="GU">Guam</option>
      <option value="GT">Guatemala</option>
      <option value="GN">Guinea</option>
      <option value="GW">Guinea-Bissau</option>
      <option value="GY">Guyana</option>
      <option value="HT">Haiti</option>
      <option value="HM">Heard And Mc Donald Islands</option>
      <option value="VA">Holy See (Vatican City State)</option>
      <option value="HN">Honduras</option>
      <option value="HK">Hong Kong</option>
      <option value="HU">Hungary</option>
      <option value="IS">Iceland</option>
      <option value="ID">Indonesia</option>
      <option value="IR">Iran (Islamic Republic Of)</option>
      <option value="IQ">Iraq</option>
      <option value="IE">Ireland</option>
      <option value="IL">Israel</option>
      <option value="IT">Italy</option>
      <option value="JM">Jamaica</option>
      <option value="JP">Japan</option>
      <option value="JO">Jordan</option>
      <option value="KZ">Kazakhstan</option>
      <option value="KE">Kenya</option>
      <option value="KI">Kiribati</option>
      <option value="KP">Korea, Democratic People's Republic Of</option>
      <option value="KR">Korea, Republic Of</option>
      <option value="KW">Kuwait</option>
      <option value="KG">Kyrgyzstan</option>
      <option value="LA">Lao People's Democratic Republic</option>
      <option value="LV">Latvia</option>
      <option value="LB">Lebanon</option>
      <option value="LS">Lesotho</option>
      <option value="LR">Liberia</option>
      <option value="LY">Libyan Arab Jamahiriya</option>
      <option value="LI">Liechtenstein</option>
      <option value="LT">Lithuania</option>
      <option value="LU">Luxembourg</option>
      <option value="MO">Macau</option>
      <option value="MK">Macedonia, Former Yugoslav Republic Of</option>
      <option value="MG">Madagascar</option>
      <option value="MW">Malawi</option>
      <option value="MY">Malaysia</option>
      <option value="MV">Maldives</option>
      <option value="ML">Mali</option>
      <option value="MT">Malta</option>
      <option value="MH">Marshall Islands</option>
      <option value="MQ">Martinique</option>
      <option value="MR">Mauritania</option>
      <option value="MU">Mauritius</option>
      <option value="YT">Mayotte</option>
      <option value="MX">Mexico</option>
      <option value="FM">Micronesia, Federated States Of</option>
      <option value="MD">Moldova, Republic Of</option>
      <option value="MC">Monaco</option>
      <option value="MN">Mongolia</option>
      <option value="MS">Montserrat</option>
      <option value="MA">Morocco</option>
      <option value="MZ">Mozambique</option>
      <option value="MM">Myanmar</option>
      <option value="NA">Namibia</option>
      <option value="NR">Nauru</option>
      <option value="NP">Nepal</option>
      <option value="NL">Netherlands</option>
      <option value="AN">Netherlands Antilles</option>
      <option value="NC">New Caledonia</option>
      <option value="NZ">New Zealand</option>
      <option value="NI">Nicaragua</option>
      <option value="NE">Niger</option>
      <option value="NG">Nigeria</option>
      <option value="NU">Niue</option>
      <option value="NF">Norfolk Island</option>
      <option value="MP">Northern Mariana Islands</option>
      <option value="NO">Norway</option>
      <option value="OM">Oman</option>
      <option value="PK">Pakistan</option>
      <option value="PW">Palau</option>
      <option value="PA">Panama</option>
      <option value="PG">Papua New Guinea</option>
      <option value="PY">Paraguay</option>
      <option value="PE">Peru</option>
      <option value="PH">Philippines</option>
      <option value="PN">Pitcairn</option>
      <option value="PL">Poland</option>
      <option value="PT">Portugal</option>
      <option value="PR">Puerto Rico</option>
      <option value="QA">Qatar</option>
      <option value="RE">Reunion</option>
      <option value="RO">Romania</option>
      <option value="RU">Russian Federation</option>
      <option value="RW">Rwanda</option>
      <option value="KN">Saint Kitts And Nevis</option>
      <option value="LC">Saint Lucia</option>
      <option value="VC">Saint Vincent And The Grenadines</option>
      <option value="WS">Samoa</option>
      <option value="SM">San Marino</option>
      <option value="ST">Sao Tome And Principe</option>
      <option value="SA">Saudi Arabia</option>
      <option value="SN">Senegal</option>
      <option value="SC">Seychelles</option>
      <option value="SL">Sierra Leone</option>
      <option value="SG">Singapore</option>
      <option value="SK">Slovakia (Slovak Republic)</option>
      <option value="SI">Slovenia</option>
      <option value="SB">Solomon Islands</option>
      <option value="SO">Somalia</option>
      <option value="ZA">South Africa</option>
      <option value="GS">South Georgia, South Sandwich Islands</option>
      <option value="ES">Spain</option>
      <option value="LK">Sri Lanka</option>
      <option value="SH">St. Helena</option>
      <option value="PM">St. Pierre And Miquelon</option>
      <option value="SD">Sudan</option>
      <option value="SR">Suriname</option>
      <option value="SJ">Svalbard And Jan Mayen Islands</option>
      <option value="SZ">Swaziland</option>
      <option value="SE">Sweden</option>
      <option value="CH">Switzerland</option>
      <option value="SY">Syrian Arab Republic</option>
      <option value="TW">Taiwan</option>
      <option value="TJ">Tajikistan</option>
      <option value="TZ">Tanzania, United Republic Of</option>
      <option value="TH">Thailand</option>
      <option value="TG">Togo</option>
      <option value="TK">Tokelau</option>
      <option value="TO">Tonga</option>
      <option value="TT">Trinidad And Tobago</option>
      <option value="TN">Tunisia</option>
      <option value="TR">Turkey</option>
      <option value="TM">Turkmenistan</option>
      <option value="TC">Turks And Caicos Islands</option>
      <option value="TV">Tuvalu</option>
      <option value="UG">Uganda</option>
      <option value="UA">Ukraine</option>
      <option value="AE">United Arab Emirates</option>
      <option value="UM">United States Minor Outlying Islands</option>
      <option value="UY">Uruguay</option>
      <option value="UZ">Uzbekistan</option>
      <option value="VU">Vanuatu</option>
      <option value="VE">Venezuela</option>
      <option value="VN">Viet Nam</option>
      <option value="VG">Virgin Islands (British)</option>
      <option value="VI">Virgin Islands (U.S.)</option>
      <option value="WF">Wallis And Futuna Islands</option>
      <option value="EH">Western Sahara</option>
      <option value="YE">Yemen</option>
      <option value="YU">Yugoslavia</option>
      <option value="ZM">Zambia</option>
      <option value="ZW">Zimbabwe</option>
    </select>);
  }

  printStateByCountry() {
    const { user } = this.props;
    const country = (this.state && this.state.countrySelected ? this.state.countrySelected : (user ? user.country_code : null));
    if (country == 'US') {
      return (<select id="billing_region" style={{ height: '30px' }} onChange={this.stateChanged.bind(this)}>
        <option value="">Select State</option>
        <option value="AK">Alaska</option>
        <option value="AL">Alabama</option>
        <option value="AR">Arkansas</option>
        <option value="AZ">Arizona</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DC">District of Columbia</option>
        <option value="DE">Delaware</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="IA">Iowa</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="MA">Massachusetts</option>
        <option value="MD">Maryland</option>
        <option value="ME">Maine</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MO">Missouri</option>
        <option value="MS">Mississippi</option>
        <option value="MT">Montana</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="NE">Nebraska</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NV">Nevada</option>
        <option value="NY">New York</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VA">Virginia</option>
        <option value="VT">Vermont</option>
        <option value="WA">Washington</option>
        <option value="WI">Wisconsin</option>
        <option value="WV">West Virginia</option>
        <option value="WY">Wyoming</option>
      </select>);
    } else if (country == 'CA') {
      return (<select id="billing_region" style={{ width: '100%', height: '30px' }} onChange={this.stateChanged.bind(this)}>
        <option value="">Select State</option>
        <option value="AB">Alberta</option>
        <option value="BC">British Columbia</option>
        <option value="MB">Manitoba</option>
        <option value="NB">New Brunswick</option>
        <option value="NL">Newfoundland and Labrador</option>
        <option value="NT">Northwest Territories</option>
        <option value="NS">Nova Scotia</option>
        <option value="NU">Nunavut</option>
        <option value="ON">Ontario</option>
        <option value="PE">Prince Edward Island</option>
        <option value="QC">Quebec</option>
        <option value="SK">Saskatchewan</option>
        <option value="YT">Yukon</option>
      </select>);
    } else if (country == 'ZA') {
      return (<select id="billing_region" style={{ height: '30px' }} onChange={this.stateChanged.bind(this)}>
        <option value="">Select State</option>
        <option value="EC">Eastern Cape</option>
        <option value="FS">Free State</option>
        <option value="GT">Gauteng</option>
        <option value="NL">KwaZulu-Natal</option>
        <option value="NP">Limpopo</option>
        <option value="MP">Mpumalanga</option>
        <option value="NW">North-West</option>
        <option value="NC">Northern Cape</option>
        <option value="WC">Western Cape</option>;
        </select>);
    } else if (country == 'AU') {
      return (<select id="billing_region" style={{ height: '30px' }} onChange={this.stateChanged.bind(this)}>
        <option value="">Select State</option>
        <option value="NS">New South Wales</option>
        <option value="QL">Queensland</option>
        <option value="SA">South Australia</option>
        <option value="TS">Tasmania</option>
        <option value="VI">Victoria</option>
        <option value="WA">Western Australia</option>
        <option value="AC">Australian Capital Territory</option>
        <option value="NT">Northern Territory</option>
      </select>);
    } else if (country == 'GB') {
      return (<select id="billing_region" style={{ height: '30px' }} onChange={this.stateChanged.bind(this)}>
        <option value="">Select State</option>
        <option value="EN">England</option>
        <option value="SF">Scotland</option>
        <option value="NB">Northern Ireland</option>
        <option value="WL">Wales</option>
      </select>);
    } else if (country == 'IN') {
      return (<select id="billing_region" style={{ height: '30px' }} onChange={this.stateChanged.bind(this)}>
        <option value="">Select State</option>
        <option value="AP">Andhra Pradesh</option>
        <option value="AR">Arunachal Pradesh</option>
        <option value="AS">Assam</option>
        <option value="BR">Bihar</option>
        <option value="CH">Chhattisgarh</option>
        <option value="DL">Delhi</option>
        <option value="GA">Goa</option>
        <option value="GJ">Gujarat</option>
        <option value="HR">Haryana</option>
        <option value="HP">Himachal Pradesh</option>
        <option value="JK">Jammu and Kashmir</option>
        <option value="JH">Jharkhand</option>
        <option value="KA">Karnataka</option>
        <option value="KL">Kerala</option>
        <option value="MP">Madhya Pradesh</option>
        <option value="MH">Maharashtra</option>
        <option value="MN">Manipur</option>
        <option value="ML">Meghalaya</option>
        <option value="MZ">Mizoram</option>
        <option value="NL">Nagaland</option>
        <option value="OR">Orissa</option>
        <option value="PB">Punjab</option>
        <option value="RJ">Rajasthan</option>
        <option value="SK">Sikkim</option>
        <option value="TN">Tamil Nadu</option>
        <option value="TR">Tripura</option>
        <option value="UP">Uttar Preadesh</option>
        <option value="UT">Uttaranchal</option>
        <option value="WB">West Bengal</option>
      </select>);
    }

    return (<select id="billing_region" style={{ height: '25px' }} disabled>
      <option value="Other">Other</option>
    </select>);
  }

  getActualYears() {
    const html = [];
    let currentYear = new Date().getFullYear();
    let next10thYear = currentYear + 10;
    for (let i = currentYear; i <= next10thYear; i++) {
      html.push(<option value={i}>{i}</option>);
    }
    return html;
  }

  firstNameChanged(e){
    if(e && e.target){
      this.setState({ firstName: e.target.value });
    }
  }

  lastNameChanged(e){
    if(e && e.target){
      this.setState({ lastName: e.target.value });
    }
  }

  addressChanged(e){
    if(e && e.target){
      this.setState({ address: e.target.value });
    }
  }

  cityChanged(e){
    if(e && e.target){
      this.setState({ city: e.target.value });
    }
  }

  zipChanged(e){
    if(e && e.target){
      this.setState({ zip: e.target.value });
    }
  }

  stateChanged(e){
    if(e && e.target){
      this.setState({ state: e.target.value });
    }
  }

  paymentMethodChanged(e){
    if(e && e.target){
      this.setState({ paymentMethod: e.target.value });
    }
  }

  cardNumberChanged(e){
    if(e && e.target){
      this.setState({ cardNumber: e.target.value });
    }
  }

  cardNameChanged(e){
    if(e && e.target){
      this.setState({ cardName: e.target.value });
    }
  }

  expirationMonthChanged(e){
    if(e && e.target){
      this.setState({ expirationMonth: e.target.value });
    }
  }

  expirationYearChanged(e){
    if(e && e.target){
      this.setState({ expirationYear: e.target.value });
    }
  }

  CVVChanged(e){
    if(e && e.target){
      this.setState({ cvv: e.target.value });
    }
  }

  updatePayment(e){
    const { user, updatePaymentInfo } = this.props;
    updatePaymentInfo({user: user, data:this.state});

  }

  render() {
    const { user } = this.props;
    return (
      <div>
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

            <ul className="o-appHeader__actions">
              <li className="o-appHeader__actionItem">
                <Link to="#" className="o-appHeader__actionLink" title="Log Out">
                  {Localization.localizedStringForKey('Log Out')}
                </Link>
              </li>
            </ul>

          </header>


          <ParentNav />


          <div className="a-appView a-appView--hasSidebar">

            <div style={{ float: 'left', width: 'col-md-6', textAlign: 'left' }}>
              <header className="a-viewHeader__col">
                <h1 className="a-h(28)">
                  Billing info
                  <span className="a-color(copy-3)"> : </span>
                </h1>
              </header>

              <label>First name</label>&nbsp;&nbsp;
              <input type="text" placeholder="first name" defaultValue={user.first_name} onChange={this.firstNameChanged.bind(this)}/>
              <br />

              <label>Last name</label>&nbsp;&nbsp;
              <input type="text" placeholder="last name" defaultValue={user.last_name}  onChange={this.lastNameChanged.bind(this)}/>
              <br />
              <label>Street address</label>&nbsp;&nbsp;
              <input type="text" placeholder="address" defaultValue={user.address_streetaddress}  onChange={this.addressChanged.bind(this)}/>
              <br />
              <label>City</label>&nbsp;&nbsp;
              <input type="text" placeholder="city" defaultValue={user.city_name}  onChange={this.cityChanged.bind(this)}/>
              <br />
              <label>Country</label>&nbsp;&nbsp;
              {this.getCountryDropDown()}
              <br />
              <label>Zip code</label>&nbsp;&nbsp;
              <input type="text" placeholder="zip code" defaultValue={user.zip} onChange={this.zipChanged.bind(this)}/>
              <br />
              <label>State / Province</label>&nbsp;&nbsp;
              {this.printStateByCountry()}
              <br />

            </div>

            <div style={{ float: 'right', width: 'col-md-6', textAlign: 'left' }}>
              <header className="a-viewHeader__col">
                <h1 className="a-h(28)">
                  Payment Info
                  <span className="a-color(copy-3)"> : </span>
                </h1>
              </header>

              <label>Payment Method</label>&nbsp;&nbsp;
              <input name="cctype" type="radio" value="V" onChange={this.paymentMethodChanged.bind(this)}/> <img src="images/ico_visa.jpg" align="absmiddle" />
              <input name="cctype" type="radio" value="M" onChange={this.paymentMethodChanged.bind(this)}/> <img src="images/ico_mc.jpg" align="absmiddle" />
              {user.country_code === 'US' ?
                  [<input name="cctype" type="radio" value="A" onChange={this.paymentMethodChanged.bind(this)}/>, <img src="images/ico_amex.jpg" align="absmiddle" />]
                  : ''
              }
              <input name="cctype" type="radio" value="D" onChange={this.paymentMethodChanged.bind(this)}/> <img src="images/ico_disc.jpg" align="absmiddle" />
              <br />

              <label>Card Number</label>&nbsp;&nbsp;
              <input type="text"  onChange={this.cardNumberChanged.bind(this)}/>
              <br />
              <label>Name on Card</label>&nbsp;&nbsp;
              <input type="text" placeholder="name" defaultValue={user.first_name + user.last_name}  onChange={this.cardNameChanged.bind(this)}/>
              <br />
              <label>Expiration Date</label>&nbsp;&nbsp;
              <select onChange={this.expirationMonthChanged.bind(this)}>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              <select onChange={this.expirationYearChanged.bind(this)}>
              {this.getActualYears()}
              </select>
              <br />
              <label>CVV</label>&nbsp;&nbsp;
              <input type="password" onChange={this.CVVChanged.bind(this)}/>
              <br />
            </div>
          </div>
        </div>
        <div style={{marginLeft:"44%"}}>
          <button className="b-flatBtn b-flatBtn--active-3" onClick={this.updatePayment.bind(this)}>
            <span className="b-button__label">
              Update Payment
            </span>
          </button>
        </div>
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
});

const actionCreators = {
  updatePaymentInfo: PaymentActions.updatePaymentInfo
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Payment);
