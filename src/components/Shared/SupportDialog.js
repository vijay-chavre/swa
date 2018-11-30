import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import Close from '../Shared/Glyphs/Close';
import * as Localization from '../Shared/Localization';
import * as Common from './Common';

class SupportDialog extends Component {
  static propTypes = {
    show: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    getSupportTicket: React.PropTypes.func,
    session: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: -1,
      isEmptyComment: false,
      errorMessage: '',
      maximumFileSize: 1000000,
    };
  }
  onAcceptDialog = () => {
    if (this.textarea.value === '') {
      this.setState({
        isEmptyComment: true,
        errorMessage: '*Comment is mandatory.',
      });
    } else {
      const ticket = this.props.getSupportTicket(this.state.selectedOption);
      if (this.textarea.value) {
        ticket.body = this.textarea.value + '\n\n\n\n' + ticket.body;
      }

      this.sendSupportTicket(ticket).then((response) => {
        this.props.onSubmit(true);
      })
        .catch((err) => {
          console.log(err);
          this.props.onSubmit(false);
        });
    }
  }

  onValidateFile = (file) => {
    if (file.size <= this.state.maximumFileSize && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      // const r = new FileReader();
      // r.onload = function (e) {
      //   const contents = e.target.result;
      // };
      return true;
    }
    return false;
  }

  onCommentTextChange = () => {
    if (this.textarea.value !== '' && this.state.isEmptyComment) {
      this.setState({ isEmptyComment: false });
    }
  }

  sendSupportTicket = (ticket) => {
    const { session } = this.props;
    return axios({
      method: 'post',
      baseURL: ENV.apiEndPoint,
      url: 'v1/zendesk/ticket',
      headers: { Authorization: `JWT ${session.token}` },
      data: ticket,
    });
  }

  render() {
    const { student, show, onClose } = this.props;
    const className = show ? 'o-modal--show' : 'o-modal--hide';
    if (!show) {
      this.state.selectedOption = -1;
    }
    if (Common.isPurchaseOfTypeProduct(student)) {
      this.state.selectedOption = 2; // only one option for the 
    }
    return (
      <div className={`o-modal ${className}`}>
        <div className="o-modal__box o-modal__box--small">
          <button
            className="o-modal__closeBtn"
            onClick={onClose}
          >
            <Close />
          </button>
          {
            this.state.selectedOption === -1 ?
              <div className="o-supportDialog">
                <p className="a-p(14)">
                  {Localization.localizedStringForKey('Choose one of the options below:')}
                </p>
                <div className="o-modal__actions">
                  <button className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(140)" onClick={() => { this.setState({ selectedOption: 1, isEmptyComment: false }); }}>
                    <span className="b-button__label">
                      {Localization.localizedStringForKey('Ask a Question to my Coach')}
                    </span>
                  </button>
                  <button className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(140)" onClick={() => { this.setState({ selectedOption: 2, isEmptyComment: false }); }}>
                    <span className="b-button__label">
                      {Localization.localizedStringForKey('Contact Technical Support')}
                    </span>
                  </button>
                </div>
              </div> :

              <div className="o-supportDialog">
                <p className="a-p(14)">
                  {this.state.selectedOption === 1 ? Localization.localizedStringForKey('Ask a Question to my Coach') : Localization.localizedStringForKey('Contact Technical Support')}
                </p>
                <div>
                  <textarea className="b-textarea" onChange={() => this.onCommentTextChange()} ref={(c) => { this.textarea = c; }} />
                  {this.state.isEmptyComment ? <div className="o-loginBox__msg a-p(12) a-color(alert)">
                    <p style={{ position: 'relative', left: '-135' }}>
                      {this.state.errorMessage}
                    </p>
                  </div> : ''
                  }
                  <div className="o-modal__actions">
                    <button className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(140)" onClick={this.onAcceptDialog}>
                      <span className="b-button__label">
                        {Localization.localizedStringForKey('Submit')}
                      </span>
                    </button>
                    {/* <input type="file" id="image" /> */}
                  </div>
                </div>
              </div>
          }
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  session: state.session,
  student: state.student,
});

export default connect(
  mapStateToProps,
)(SupportDialog);
