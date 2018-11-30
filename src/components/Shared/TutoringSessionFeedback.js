import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createZendeskTicket } from '../../actions/zendesk';
import moment from 'moment';
import browser from 'detect-browser';
import config from '../../constants/config';
import * as Localization from './Localization';

class TutoringSessionFeedback extends Component {
  static propTypes = {
    show: React.PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      showRatingModal: false,
      rating: '',
      reason1: '',
      reason2: '',
      reason3: '',
      reason4: '',
      reason5: '',
      showError: false,
      improvementComment: '',
      comment: '',
      showComment: false,
    };
    this.initializeProblems();
  }

  componentDidMount() {

  }

  onSelectproblem = (e) => {
    if (e.target.id === "reason5") {
      if (e.target.checked) {
        this.setState({ showComment: true });
      } else {
        this.setState({ showComment: false });
      }
    }
    if (e.target.checked) {
      this.setState({
        [e.target.id]: e.target.id,
      });
    } else {
      this.setState({
        [e.target.id]: '',
      });
      if (e.target.id === "reason5") {
        this.setState({
          showError: false,
        });
      }
    }
  }

  handlechange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      showError: false,
    });
  }
  onSelectRating = (rating) => {
    this.setState({
      rating,
      showError: false,
    });
  }

  isShowSubmit = () => {
    const { reason1,
      reason2,
      reason3,
      reason4,
      reason5 } = this.state;
    let data = " ";
    const selectedIssues = [];
    if (reason1 !== '') {
      selectedIssues.push(this.problems.reason1);
    }
    if (reason2 !== '') {
      selectedIssues.push(this.problems.reason2);
    }
    if (reason3 !== '') {
      selectedIssues.push(this.problems.reason3);
    }
    if (reason4 !== '') {
      selectedIssues.push(this.problems.reason4);
    }
    if (reason5 !== '') {
      selectedIssues.push(this.problems.reason5);
    }

    if (selectedIssues.length === 0) {
      return false;
    } else {
      return true;
    }

  }
  getIssues = () => {
    const { reason1,
      reason2,
      reason3,
      reason4,
      reason5 } = this.state;
    let data = " ";
    const selectedIssues = [];
    if (reason1 !== '') {
      selectedIssues.push(this.problems.reason1);
    }
    if (reason2 !== '') {
      selectedIssues.push(this.problems.reason2);
    }
    if (reason3 !== '') {
      selectedIssues.push(this.problems.reason3);
    }
    if (reason4 !== '') {
      selectedIssues.push(this.problems.reason4);
    }
    if (reason5 !== '') {
      selectedIssues.push(this.problems.reason5);
    }

    selectedIssues.map((issue, index) => {
      data += `\n ${index + 1}. ${issue}`;
    });

    return data;
  }
  supportTicket = () => {
    const { student, user } = this.props;
    const { rating, comment,
      improvementComment,

    } = this.state;
    const ticket = {};
    if (rating === 3 || rating === 4) {
      ticket.body = `Comment: ${improvementComment}
            Rating: ${rating}
            Profile ID: ${student._id}
            Profile Name: ${student.first_name} ${student.last_name}
            Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
            App Version: StudentWebApp/${config.appversion}
            Browser: ${browser.name} ${browser.version}
            Date: ${moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]')}
            Zoom Meeting ID : ${this.props.meetingID}
            `;

    } else {
      ticket.body = `Comment: ${comment}
            Rating: ${rating}
            Profile ID: ${student._id}
            Issues: ${this.getIssues()}
            \nProfile Name: ${student.first_name} ${student.last_name}
            Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
            App Version: StudentWebApp/${config.appversion}
            Browser: ${browser.name} ${browser.version}
            Date: ${moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]')}
            Zoom Meeting ID : ${this.props.meetingID}
            `;
    }
    ticket.subject = this.getLocalisedString('White Boarding Feedback');
    ticket.name = `${user.first_name} ${user.last_name}`;
    ticket.email = user.email_address;
    return ticket;
  }

  getLocalisedString = (string) => {
    return Localization.localizedStringForKey(string);
  }

  initializeProblems = () => {
    this.problems = {
      reason1: this.getLocalisedString('Requested topics or questions were not discussed'),
      reason2: this.getLocalisedString('Session didn’t start on time or was shorter than expect'),
      reason3: this.getLocalisedString("Didn’t review enough questions or concepts"),
      reason4: this.getLocalisedString('We faced technical issues'),
      reason5: this.getLocalisedString('Other'),
    };
  }

  saveFeedback = () => {
    const ticket = this.supportTicket();
    let isError = false;
    if (this.state.reason5 !== '' && this.state.comment === '' && this.state.rating < 3) {
      isError = true;
    } else if (this.state.rating > 2 && this.state.rating < 5 && this.state.improvementComment === '') {
      isError = true;
    }

    if (isError) {
      this.setState({ showError: true });
    } else {
      isError = false;
      this.setState({ showError: false });
      this.props.createZendeskTicket({ data: ticket });
      this.onCloseFeedback();
    }
  }

  onCloseFeedback = () => {
    this.props.onClose(false);
  }
  render() {
    const { show } = this.props;
    const className = show ? 'o-modal--show' : 'o-modal--hide';
    return (
      <div>
        <div className={`o-modal ${className}`}>
          <div className="o-modal__box o-modal__box--m o-modal__box--maximized o-modal__box--maximized--m" >
            <button
              className="o-modal__closeBtn o-modal__closeBtn--m"
              onClick={() => this.onCloseFeedback(false)}
            >
              <svg className="a-glyph a-glyph--close" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M16 1.6L14.4 0 8 6.4 1.6 0 0 1.6 6.4 8 0 14.4 1.6 16 8 9.6l6.4 6.4 1.6-1.6L9.6 8"></path>
              </svg>
            </button>
            <div className="feedbackGroup">

              {/* Modal Title */}
              <div className="rating-head">
                <h1>Rating for Web Sessions</h1>
              </div>

              {/* Modal Body */}
              <div className="rating-body">
                <div className="col-12 rating-star">
                  <fieldset className="rating">
                    <input onChange={() => this.onSelectRating(5)} type="radio" id="star5" name="rating" value="5" /><label className="full" htmlFor="star5" ></label>
                    <input onChange={() => this.onSelectRating(5)} type="radio" id="star4half" name="rating" value="4 and a half" /><label className="half" htmlFor="star4half"></label>
                    <input onChange={() => this.onSelectRating(4)} type="radio" id="star4" name="rating" value="4" /><label className="full" htmlFor="star4" ></label>
                    <input onChange={() => this.onSelectRating(4)} type="radio" id="star3half" name="rating" value="3 and a half" /><label className="half" htmlFor="star3half"></label>
                    <input onChange={() => this.onSelectRating(3)} type="radio" id="star3" name="rating" value="3" /><label className="full" htmlFor="star3" ></label>
                    <input onChange={() => this.onSelectRating(3)} type="radio" id="star2half" name="rating" value="2 and a half" /><label className="half" htmlFor="star2half"></label>
                    <input onChange={() => this.onSelectRating(2)} type="radio" id="star2" name="rating" value="2" /><label className="full" htmlFor="star2" ></label>
                    <input onChange={() => this.onSelectRating(2)} type="radio" id="star1half" name="rating" value="1 and a half" /><label className="half" htmlFor="star1half"></label>
                    <input onChange={() => this.onSelectRating(1)} type="radio" id="star1" name="rating" value="1" /><label className="full" htmlFor="star1" ></label>
                    <input onChange={() => this.onSelectRating(1)} type="radio" id="starhalf" name="rating" value="half" /><label className="half" htmlFor="starhalf"></label>
                  </fieldset>
                </div>

                {/* remove/add hide-block class */}
                <div className={`col-12 star-blc star-5 ${this.state.rating <= 0 ? '' : 'hide-block'}`}>
                  <p>{this.getLocalisedString('Please rate your whiteboard tutoring session experience.')}</p>
                  <p>{this.getLocalisedString('We appreciate your feedback!')}</p>
                </div>

                {/* remove/add hide-block class */}
                <div className={`col-12 star-blc star-5 ${this.state.rating === 5 ? '' : 'hide-block'}`}>
                  <h2>{this.getLocalisedString('Thank you for your awesome feedback!')}</h2>

                </div>

                {/* remove/add hide-block class */}
                <div className={`col-12 star-blc star-4 ${this.state.rating === 3 || this.state.rating === 4 ? '' : 'hide-block'}`}>
                  <p>{this.getLocalisedString('Please let us know how we can improve to get a 5-star rating:')}</p>
                  <div>
                    <textarea name="improvementComment" onChange={this.handlechange} value={this.state.improvementComment} className="comment" placeholder="Please give your feedback..."></textarea>
                    {this.state.showError ? <p style={{ color: 'red' }}> {this.getLocalisedString('*Please enter a comment')}</p> : ''}
                  </div>
                  <div>
                    <button onClick={this.saveFeedback} className="btn-submit">{this.getLocalisedString('Submit')}</button>
                  </div>

                </div>
                {/* remove/add hide-block class */}
                <div className={`col-12 star-blc star-3 ${this.state.rating < 3 && this.state.rating >= 1 ? '' : 'hide-block'}`}>
                  <p>{this.getLocalisedString("We are sorry that the session didn’t meet your expectations. Please share some feedback so that we can improve!")} </p>
                  <p>
                    <input onChange={(e) => this.onSelectproblem(e)} type="checkbox" id="reason1" />
                    <label htmlFor="reason1">{this.problems.reason1}</label>
                  </p>
                  <p>
                    <input onChange={(e) => this.onSelectproblem(e)} type="checkbox" id="reason2" />
                    <label onChange={(e) => this.onSelectproblem(e)} htmlFor="reason2">{this.problems.reason2}</label>
                  </p>
                  <p>
                    <input onChange={(e) => this.onSelectproblem(e)} type="checkbox" id="reason3" />
                    <label htmlFor="reason3">{this.problems.reason3}</label>
                  </p>
                  <p>
                    <input onChange={(e) => this.onSelectproblem(e)} type="checkbox" id="reason4" />
                    <label htmlFor="reason4">{this.problems.reason4}</label>
                  </p>
                  <p>
                    <input onChange={(e) => this.onSelectproblem(e)} type="checkbox" id="reason5" />
                    <label htmlFor="reason5">{this.problems.reason5}</label>
                  </p>
                  {
                    this.state.showComment ? <textarea onChange={this.handlechange} value={this.state.comment} name="comment" className="comment" placeholder="Please give your feedback..."></textarea>
                      : " "
                  }
                  {this.state.showError ? <p style={{ color: 'red' }}> {this.getLocalisedString('*You have selected "Other" as an option. Please enter a comment')}</p> : ''}
                  <div>
                    {
                      this.isShowSubmit() ? <button onClick={() => this.saveFeedback()} className="btn-submit">Submit</button> : ''
                    }
                  </div>

                </div>

              </div>
              {/* ./Modal Body */}

            </div >
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  session: state.session,
  user: state.user,
});
const actionCreators = {
  createZendeskTicket,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(TutoringSessionFeedback);
