import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import Dropzone from 'react-dropzone';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Footer from '../Footer';
import * as Localization from '../Shared/Localization';
import Dialog from '../Shared/Dialog';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import UploadIcon from '../Shared/Glyphs/UploadIcon';
import { studentFetched } from '../../actions/student';
import * as features from '../../constants/feature';


class ChooseUsername extends Component {
  static propTypes = {
    student: React.PropTypes.shape({

    }),
    studentFetched: React.PropTypes.func,
    showLeaderboard: React.PropTypes.func,
    showTimeline: React.PropTypes.func,
    currentNavigation: React.PropTypes.string,
    session: React.PropTypes.shape({
    }),
  }
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      value: '',
      dialogMessage: '',
      showDialog: false,
      cancelButtonLabel: undefined,
      acceptButtonLabel: undefined,
      dialogI: '',
      dialogNoButton: false,
      isErrorMessage: false,
      isLoading: false,
      showDragdropZone: true,

    };
  }

  componentDidMount() {
    const { student, currentNavigation } = this.props;
    if (student.leaderboard_screen_name && currentNavigation === features.LEADERBOARD) {
      this.textInput.value = student.leaderboard_screen_name;
      this.textInput.focus();
    }
  }
  onAcceptDialog = () => {
    if (this.state.dialogId === '100') {
      this.setState({ showDialog: false, dialogMessage: '', dialogId: '100', acceptButtonLabel: undefined, cancelButtonLabel: undefined, dialogNoButton: false });
    }
  }
  onCancel = () => {
    const { student, currentNavigation } = this.props;
    if (currentNavigation === features.WORKSHEET) {
      this.props.showTimeline(true);
      return;
    }
    if (student.leaderboard_screen_name) {
      this.props.showLeaderboard(true);
    } else {
      browserHistory.push(`/student/${student._id}`);
    }
  }
  onCancelDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '100', acceptButtonLabel: undefined, cancelButtonLabel: undefined, dialogNoButton: false });
  }
  onDrop = (file) => {
    const { student, currentNavigation } = this.props;
    if (file.length <= 0) {
      this.setState({ showDialog: true, dialogMessage: 'File type must be \n (image/jpeg, image/png)', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
      return;
    }
    this.setState({
      file: file[0],
      imagePreviewUrl: file[0].preview,
      value: 'none',
      showDragdropZone: false,
    }, function () {
      this.setState({ isLoading: true });
      this.uploadImageToS3().then((response, error) => {
        if (error) {
          this.setState({ showDialog: true, dialogMessage: '* Error updating Leaderboard name, Please try again', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
          return;
        }
        let imageUrl = `https://${ENV.profilePictureBucket}.s3.amazonaws.com/${student._id}.png`;
        if (currentNavigation === features.LEADERBOARD) {
          imageUrl = `https://s3.amazonaws.com/${ENV.leaderboardAvatarBucket}/${student._id}.png`;
        } else {
          this.setState({ imagePreviewUrl: imageUrl })
          this.props.showTimeline(true);
        }
        this.setState({ isLoading: false });
      });
    });
  }
  setImage = () => {
    this.image.click();
  }
  checkForValidScreenName = (screenName) => {
    const { session } = this.props;
    const url = `/v1/leaderboards/validateProfile/${screenName}`;
    return axios({
      method: 'GET',
      baseURL: ENV.apiEndPoint,
      url,
      headers: { Authorization: `JWT ${session.token}` },
    });
  }
  isValidLength = (screenName) => {
    if (screenName.length < 4) {
      return false;
    }
    return true;
  }
  hasWhiteSpace = (screenName) => {
    if (screenName.match(/\s/g) || screenName === '') {
      return true;
    }
    return false;
  }
  handleSubmit = (e) => {
    e.preventDefault();
    const textValue = this.textInput.value.trim();
    if (!this.isValidLength(textValue)) {
      this.setState({ showDialog: true, dialogMessage: 'Leaderboard name should be of minimum 4 characters', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
      return;
    }
    if (this.hasWhiteSpace(textValue)) {
      let message = '';
      if (this.textInput.value === '') {
        message = 'Leaderboard name is empty';
      } else {
        message = 'Leaderboard name should not have spaces';
      }
      this.setState({ showDialog: true, dialogMessage: message, dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
      return;
    }
    this.setState({ isLoading: true });
    this.checkForValidScreenName(textValue).then((response, error) => {
      this.setState({ isLoading: false });
      if (error) {
        this.setState({ showDialog: true, dialogMessage: '* Error updating Leaderboard name, Please try again', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
        return;
      }
      if (response && response.data && response.data.status.toLowerCase() === 'ok') {
        if (response.data.result && response.data.result.message.toLowerCase() === 'valid name') {
          this.updateProfile(textValue);
        } else if (response.data.result && response.data.result.studentId && response.data.result.studentId === this.props.student._id) { // Code is valid, if it belongs to you
          this.updateProfile(textValue);
        } else {
          this.setState({ showDialog: true, dialogMessage: '* Error updating Leaderboard name or This name is already taken.', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
          return;
        }
      }
    });
  }

  handleImageChange = (e) => {
    e.preventDefault();
    const { student, currentNavigation } = this.props;
    const _this = this;
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = function () {
      _this.setState({
        file: file,
        imagePreviewUrl: reader.result,
        value: 'none',
      }, function () {
        this.setState({ isLoading: true });
        this.uploadImageToS3().then((response, error) => {
          if (error) {
            this.setState({ showDialog: true, dialogMessage: '* Error updating Leaderboard name, Please try again', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
            return;
          }
          let imageUrl = `https://${ENV.profilePictureBucket}.s3.amazonaws.com/${student._id}.png`;
          if (currentNavigation === features.LEADERBOARD) {
            imageUrl = `https://s3.amazonaws.com/${ENV.leaderboardAvatarBucket}/${student._id}.png`;
          } else {
            this.setState({ imagePreviewUrl: imageUrl });
            this.props.showTimeline(true);
          }
          this.setState({ isLoading: false });

        });
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  }
  updateProfile = (screenName) => {
    const { student } = this.props;
    const studentDictionary = {};
    const optInDateString = moment.utc().format();
    // Create Server Profile
    studentDictionary.leaderboard_screen_name = screenName;
    studentDictionary.leaderboard_opt_in_date = optInDateString;
    if (student.leaderboard_screen_photo_url) {
      studentDictionary.leaderboard_screen_photo_url = student.leaderboard_screen_photo_url;
    } else {
      studentDictionary.leaderboard_screen_photo_url = '';
    }
    this.setState({ isLoading: true });
    this.updateStudentById(studentDictionary).then((response) => {
      this.setState({ isLoading: false });
      if (response) {
        if (response.data && response.data.status.toLowerCase() === 'ok') {
          this.updateLocally(screenName, optInDateString);
          this.props.showLeaderboard(true);
        } else {
          this.setState({ showDialog: true, dialogMessage: 'Unable to update leaderboard profile.', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
          return;
        }
      } else {
        this.setState({ showDialog: true, dialogMessage: 'Unable to update your leaderboard profile.', dialogId: '100', acceptButtonLabel: 'OK', cancelButtonLabel: undefined, dialogNoButton: false });
        return;
      }
    });
  }

  updateLocally = (screenName, optInDateString) => {
    const student = this.props.student;
    student.leaderboard_screen_name = screenName;
    student.leaderboard_opt_in_date = optInDateString;
    if (student.leaderboard_screen_photo_url) {
      student.leaderboard_screen_photo_url = student.leaderboard_screen_photo_url;
    } else {
      student.leaderboard_screen_photo_url = '';
    }
    this.props.studentFetched(student);
  }

  updateStudentById = (studentDictionary) => {
    const { student, session } = this.props;
    const url = `/v1/leaderboards/updateProfile/${student._id}/screenName`;
    return axios({
      method: 'PUT',
      baseURL: ENV.apiEndPoint,
      url,
      headers: { Authorization: `JWT ${session.token}` },
      data: studentDictionary,
    });
  }

  uploadImageToS3 = () => {
    const { student, currentNavigation } = this.props;
    const session = this.props.session;
    const fd = new FormData();
    let url;
    if (currentNavigation === features.WORKSHEET) {
      fd.append('profile_picture', this.state.file);
      url = `/v1/students/${student._id}/profile-picture`;
    } else {
      fd.append('avatar', this.state.file);
      url = `/v1/students/${student._id}/avatar`;
    }

    return axios({
      method: 'POST',
      baseURL: ENV.apiEndPoint,
      url,
      headers: { Authorization: `JWT ${session.token}` },
      data: fd,
    });
  }
  render() {
    const { imagePreviewUrl } = this.state;
    const { currentNavigation } = this.props;
    const dialog = (<Dialog
      show={this.state.showDialog}
      message={this.state.dialogMessage}
      onAccept={this.onAcceptDialog}
      cancelButtonLabel={this.state.cancelButtonLabel}
      onCancel={this.onCancelDialog}
      acceptButtonLabel={this.state.acceptButtonLabel}
      noButtons={this.state.dialogNoButton}
    />);
    return (
      <div className="a-appView a-appView--altBG">
        <div className="a-appView__contents">
          <div className={`o-loadingScreenModal o-loadingScreenModal--${this.state.isLoading ? 'show' : 'hide'}`}>
            {/* Loading screen animation notification
                - Use className 'o-modal--hide' to hide modal
                - Use className 'o-modal--show' to show modal
              */}
            <LoadingSpinner />
          </div>
          {
            this.state.showDialog ? dialog : ''
          }
          <div className="a-container a-justify(center)">
            {
              currentNavigation !== features.LEADERBOARD ? <h1 className="a-h(28)">
                Choose a Profile Picture
          </h1> :
                <div>
                  <h1 className="a-h(28)">
                    Choose a Leaderboard User Name
                  </h1>
                  <p className="a-p(14) a-limiter a-limiter(800) a-color(copy-2)">
                    Please select the user name and photo for display in the Leaderboard. Information is public and to protect your privacy, we suggest that you do not use your real name or photo.
                 </p>
                </div>
            }
          </div>
          <div className="a-container">
            <div className="a-row a-justifyContent(center)">
              <div className="a-col a-col(1-3) a-col-med-1(1-3)">
                <div className="o-leaderboard">
                  {
                    currentNavigation !== features.LEADERBOARD ? '' :
                    <h2 className="a-s(14) a-allCaps o-leaderboard__title">
                        Leaderboard User name
                    </h2>
                  }
                  {
                    this.state.showDragdropZone ? <Dropzone onDrop={this.onDrop.bind(this)} accept="image/jpeg, image/png" className="o-leaderboard__upload">
                      <p className="a-p(13)">Drag and drop file here or browse to begin upload</p> <UploadIcon /></Dropzone>
                      : <form>
                        <img className="b-avatar o-leaderboard__portrait" src={imagePreviewUrl} onClick={() => this.setImage()} style={{ display: `${this.state.showDragdropZone ? 'none' : ''}` }} />
                        <input ref={(img) => { this.image = img; }} id="file-input" style={{ display: 'none' }} className="b-avatar o-leaderboard__portrait" type="file" onChange={(e) => this.handleImageChange(e)} />
                      </form>
                  }
                  {
                    currentNavigation === features.WORKSHEET ? '' : <label className="b-textInput">
                      <input ref={(input) => { this.textInput = input; }} name="Leaderboard User Name" type="text" className="b-textInput__input " />
                      <span className="b-textInput__label">
                        {Localization.localizedStringForKey('Your Leaderboard User Name')}
                      </span>
                    </label>
                  }

                  <div className="o-leaderboard__action">
                    <button type="button" className="b-flatBtn b-flatBtn--w(120) b-flatBtn--white" onClick={() => this.onCancel()}>
                      <span className="b-button__label a-allCaps">
                        Cancel
                      </span>
                    </button>
                    {
                      currentNavigation === features.WORKSHEET ? '' : <button type="button" className="b-flatBtn b-flatBtn--w(120) b-flatBtn--gradient(active-1)" onClick={(e) => this.handleSubmit(e)}>
                        <span className="b-button__label a-allCaps">
                          Submit
                      </span>
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div >

    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
});
const actionCreators = {
  studentFetched,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ChooseUsername);
