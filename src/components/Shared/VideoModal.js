import React, { Component } from 'react';
import { connect } from 'react-redux';
import YouTube from 'react-youtube';
import moment from 'moment';
import lodash from 'lodash';
import browser from 'detect-browser';
import ArrowLeft from './Glyphs/ArrowLeft';
import ArrowRight from './Glyphs/ArrowRight';
import Close from './Glyphs/Close';
import * as Event from '../../constants/event';
import { saveWatchedVideos } from '../../actions/video';
import { createZendeskTicket } from '../../actions/zendesk';

import config from '../../constants/config';


class VideoModal extends Component {
  static propTypes = {
    show: React.PropTypes.bool,
    onCloseVideo: React.PropTypes.func,
    saveWatchedVideos: React.PropTypes.func,
    createPolaEvent: React.PropTypes.func,
    questionNumber: React.PropTypes.number,
    submissionId: React.PropTypes.string,
    assignmentId: React.PropTypes.string,
    studentId: React.PropTypes.string,
    videoId: React.PropTypes.string,
    videoList: React.PropTypes.Array,
    video: React.PropTypes.shape({
    }),
    video_feedback: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      currentVideoId: undefined,
      videoPlaying: false,
      showRatingModal: false,
      video_duration: 0,
      video_rating: 0,
    };
  }

  hasStudentAlredyRated = () => {
    const { video, assignmentId } = this.props;
    let isVideoAlreadyRated = false;
    const videoFeedbacks = video.video_feedback[assignmentId];
    if (videoFeedbacks && videoFeedbacks.length > 0) {
      const filteredFeedbacks = videoFeedbacks.filter((feedback) => {
        return this.state.currentVideoId === feedback.watched_videoID;
      });
      if (filteredFeedbacks && filteredFeedbacks.length > 0) {
        for (let i = 0; i < filteredFeedbacks.length; i++) {
          const feedback = filteredFeedbacks[i];
          const reminder = feedback.reminder ? feedback.reminder : false;
          if (reminder) {
            isVideoAlreadyRated = true;
            break;
          } else if (feedback.rating !== 0 || feedback.comment !== '') {
            isVideoAlreadyRated = true;
            break;
          }
        }
      }
    }
    return isVideoAlreadyRated;
  }
  componentDidMount() {
    const { videoList, videoId } = this.props;
    if (!videoId) {
      if (videoList.length > 0) {
        // this.state.currentVideoId = videoList[0].video_id;
      }
    } else {
      this.state.currentVideoId = videoId;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { videoList } = this.props;
    if (this.props.videoId !== nextProps.videoId) {
      if (!nextProps.videoId) {
        if (videoList.length > 0) {
          // this.state.currentVideoId = videoList[0].video_id;
        }
      } else {
        this.state.currentVideoId = nextProps.videoId;
      }
      this.loadVideo();
    }
  }

  onNextVideo = () => {
    const { videoList } = this.props;
    let index = this.videoIndexFromList(this.state.currentVideoId, videoList);
    if (index < videoList.length - 1) {
      index += 1;
      this.setState({ currentVideoId: videoList[index].video_id });
      this.loadVideo();
    } else {
      this.props.onCloseVideo();
    }
  }

  onPreviousVideo = () => {
    const { videoList } = this.props;
    let index = this.videoIndexFromList(this.state.currentVideoId, videoList);
    if (index > 0) {
      index -= 1;
      this.setState({ currentVideoId: videoList[index].video_id });
      this.loadVideo();
    }
  }

  onCloseVideo = () => {
    if (this.state.videoPlaying) {
      if (this.props.createPolaEvent) {
        this.props.createPolaEvent(this.eventPropForType(Event.POLA_VIDEO_END));
      }
      this.state.videoPlaying = false;
    }
    const currentVideo = document.getElementById('video');
    this.getCurrentVideoDuration(currentVideo);
    if (!this.hasStudentAlredyRated()) {
      this.setState({ showRatingModal: true });
    } else { // save video durations
      this.saveRating(false);
      this.props.onCloseVideo();
    }
  }

  getCurrentVideoDuration = (currentVideo) => {
    if (currentVideo) {
      this.state.video_duration = currentVideo.currentTime;
    } else if (this.youtubePlayer) {
      this.state.video_duration = this.youtubePlayer.getCurrentTime();
      this.youtubePlayer.stopVideo();
    }
  }

  saveRating = (shouldRemind, isCreateTicket) => {
    const videoId = this.state.currentVideoId;
    const assignmentId = this.props.assignmentId;
    const newWatchedVideo = {};
    let comment = '';
    if (this.input) {
      comment = this.input.value;
    }
    newWatchedVideo.watched_duration = this.state.video_duration;
    newWatchedVideo.watched_videoID = videoId;
    newWatchedVideo.comment = comment;
    newWatchedVideo.rating = this.state.video_rating;
    if (shouldRemind) {
      newWatchedVideo.reminder = shouldRemind;
    }

    // Create ZendexTicket if rating is less Than 5 and greater than 0
    if (this.state.video_rating > 0 && this.state.video_rating < 5 && isCreateTicket) {
      const ticket = this.supportTicket(this.state.video_duration, comment, this.state.video_rating, videoId);
      this.props.createZendeskTicket({ data: ticket });
    }
    this.state.video_rating = 0;
    this.props.saveWatchedVideos({ assignmentId, data: newWatchedVideo });
    this.props.onCloseVideo(false);
  }
  eventPropForType = (type) => ({
    source: 'videomodal',
    studentId: this.props.studentId,
    questionNumber: this.props.questionNumber + 1,
    submissionId: this.props.submissionId,
    eventType: type,
  })

  loadVideo = () => {
    const currentVideo = document.getElementById('video');
    if (!currentVideo) {
      return;
    }
    this.getCurrentVideoDuration();
    if (this.state.videoPlaying) {
      if (this.props.createPolaEvent) {
        this.props.createPolaEvent(this.eventPropForType(Event.POLA_VIDEO_END));
      }
    }
    currentVideo.load();
    this.state.videoPlaying = false;
    currentVideo.onplay = () => {
      this.state.videoPlaying = true;
      if (this.props.createPolaEvent) {
        this.props.createPolaEvent(this.eventPropForType(Event.POLA_VIDEO));
      }
    };
    currentVideo.onpause = () => {
      // this.state.videoPlaying = false;
      // const videoId = this.state.currentVideoId;
      // const videoElement = document.getElementById('video');
      // const duration = 0;
      // if (videoElement) {
      //   if (videoElement.duration === videoElement.currentTime) {
      //     this.props.onCloseVideo(videoId, duration); // closing video modal when video ends
      //   }
      // }

      if (this.props.createPolaEvent) {
        this.props.createPolaEvent(this.eventPropForType(Event.POLA_VIDEO_END));
      }
    };
    currentVideo.onabort = () => {
      if (this.state.videoPlaying) {
        if (this.props.createPolaEvent) {
          this.props.createPolaEvent(this.eventPropForType(Event.POLA_VIDEO_END));
        }
        this.state.videoPlaying = false;
      }
    };
  }

  videoFromList = (videoId, videoList) => lodash.find(videoList, { video_id: videoId })

  videoIndexFromList = (videoId, videoList) => lodash.findIndex(videoList, { video_id: videoId })

  onCloseFeedBack = (shouldRemind, isCreateTicket) => {
    this.saveRating(shouldRemind, isCreateTicket);
    this.setState({ showRatingModal: false });
  }

  removeHover = (i) => {
    const ai = i.parentElement.querySelectorAll('.star-rating-item');
    for (let i = 0; i < ai.length; i++) {
      ai[i].classList.remove('star-rating-color');
    }
  }

  addSelected = (i, index) => {
    const ai = i.parentElement.querySelectorAll('.star-rating-item');
    for (let i = 0; i < ai.length; i++) {
      if (i <= index) {
        // a.classList.remove('fa-star-o');
        ai[i].classList.add('star-rating-color');
      }
    }
  }

  mouseOver = (e) => {
    const i = e.target;
    const attr = (Number(i.getAttribute('data-rating')) - 1);
    this.removeHover(i);
    this.addSelected(i, attr);
  }

  mouseOut = (e) => {
    const i = e.target;
    this.removeHover(i);
  }

  alterSelected = (i, index) => {
    const ai = i.parentElement.querySelectorAll('.star-rating-item');

    for (let i = 0; i < ai.length; i++) {
      if (i <= index) {
        if (!(ai[i].classList.value.indexOf('selected') > -1)) {
          ai[i].classList.add('selected');
        }
      } else {
        ai[i].classList.remove('selected');
      }
    }
  }

  starClicked = (e) => {
    const i = e.target;
    const attr = (Number(i.getAttribute('data-rating')) - 1);
    this.state.video_rating = attr + 1;
    this.alterSelected(i, attr);
  }

  supportTicket = (duration, comment, rating, videoId) => {
    const { student, user, worksheetId, source, questionNumber } = this.props;
    const ticket = {};
    ticket.body = `Video Comment: ${comment}
            Video Watch Duration: ${moment.utc(duration * 1000).format('mm:ss')} .min
            Video rating : ${rating}
            VideoID: ${videoId}
            Source: ${source} 
            Profile ID: ${student._id}
            Profile Name: ${student.first_name} ${student.last_name}
            Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
            App Version: StudentWebApp/${config.appversion}
            Browser: ${browser.name} ${browser.version}
            Date: ${moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]')}
            `;
    ticket.subject = `Rating for video in worksheet ${worksheetId}`;
    ticket.name = `${user.first_name} ${user.last_name}`;
    ticket.email = user.email_address;
    return ticket;
  }

  onReady = (e) => {
    this.youtubePlayer = e.target;
  }

  youtubePlayeStateChanged = (event) => {
    switch (event.data) {
      case 0:
        console.log('video ended');
        break;
      case 1:
        console.log('video playing from ' + this.youtubePlayer.getCurrentTime());
        break;
      case 2:
        console.log('video paused at ' + this.youtubePlayer.getCurrentTime());
    }
  }

  render() {
    const { show, videoList } = this.props;
    const opts = {
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        showinfo: 0,
        rel: 0,
        modestbranding: 1,
      },
    };
    const className = show ? 'o-modal--show' : 'o-modal--hide';
    if (show) {
      document.addEventListener('contextmenu', event => event.preventDefault());
    } else {
      document.removeEventListener('contextmenu', event => event.preventDefault());
    }
    this.video = this.videoFromList(this.state.currentVideoId, videoList);
    let videoName = this.state.currentVideoId;
    let videoDesc = 'Video Description Not Available.';
    if (this.video) {
      if (this.video.name && this.video.name !== '') {
        videoName = this.video.name;
      }
      if (this.video.description && this.video.description !== '') {
        videoDesc = this.video.description;
      }
    }

    const classNameFeedback = (this.state.showRatingModal) ? 'o-modal--show' : 'o-modal--hide';

    if (this.state.showRatingModal) {
      return (
        <div className={`o-modal ${classNameFeedback}`}>

          <div className="o-modal__box o-modal__box--maximized o-modal__box--student">
            <button
              className="o-modal__closeBtn"
              onClick={() => this.onCloseFeedBack(true)}
            >
              <Close />
            </button>
            <div className="student_wrapper">
              <div className="student_wrapper_header">
                <img alt="missing logo" src="/images/thinkster-math-logo.png" />
                <p className="student_wrapper_text">I hope the video helped you learn the concept and now you can solve these problems even better</p>
              </div>
              <div className="student_wrapper_rating">
                <p className="student_wrapper_rating_txt">Rate this video</p>
                <form>
                  <div className="star-rating">
                    <span onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} onClick={this.starClicked} data-rating="1" className="star-rating-item star-rating-icon" />
                    <span onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} onClick={this.starClicked} data-rating="2" className="star-rating-item star-rating-icon" />
                    <span onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} onClick={this.starClicked} data-rating="3" className="star-rating-item star-rating-icon" />
                    <span onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} onClick={this.starClicked} data-rating="4" className="star-rating-item star-rating-icon" />
                    <span onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} onClick={this.starClicked} data-rating="5" className="star-rating-item star-rating-icon" />
                  </div>
                  <div className="student_wrapper_comment">
                    <textarea className="student_wrapper_textarea" ref={(c) => this.input = c} placeholder="Add your comment here" />
                  </div>
                  <div className="student_wrapper_btn_sec">
                    <a onClick={() => this.onCloseFeedBack(false)} className="student_wrapper_btn"> Remind me later</a>
                    <a onClick={() => this.onCloseFeedBack(true)} className="student_wrapper_btn"> No thanks</a>
                    <a onClick={() => this.onCloseFeedBack(false, true)} className="student_wrapper_btn"> Save Comment</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`o-modal ${className}`}>

        <div className="o-modal__box o-modal__box--maximized">
          <button
            className="o-modal__closeBtn"
            onClick={this.onCloseVideo}
          >
            <Close />
          </button>
          {this.state.currentVideoId ?
            <div className="o-videoPlayer o-videoPlayer--inModal">
              <div ref={(node) => { this.videoContainer = node; }} className="o-videoPlayer__screen" >
                {this.video && this.video.source === 'youtube' ?
                  // <iframe
                  //   src={`//www.youtube.com/embed/${this.state.currentVideoId}?rel=0&modestbranding=1&showinfo=0`}
                  //   frameBorder="0"
                  //   allowFullScreen
                  //   className="o-videoPlayer__video"
                  //   ref={(node) => { this.youtubeContainer = node; }}
                  // />
                  <YouTube
                    videoId={this.state.currentVideoId}
                    opts={opts}
                    onReady={this.onReady}
                    className={'o-videoPlayer__video'}
                    onStateChange={this.youtubePlayeStateChanged}
                  /> :
                  <video className="o-videoPlayer__video" id="video" controls controlsList="nodownload" >
                    <source src={`//videos.tabtor.com/${this.state.currentVideoId}.mp4`} type="video/mp4" />
                  </video>}
              </div>
              {
                (videoList && videoList.length > 1) ? <div className="o-videoPlayer__contextPane">
                  <button className="b-flatBtn b-flatBtn--white o-worksheetNavigator__btn" onClick={() => this.onPreviousVideo()}>
                    <ArrowLeft />
                  </button>

                  <div className="a-ellipsis o-videoPlayer__metaData">
                    <h1 className="a-h(20) o-videoPlayer__title a-ellipsis">
                      {videoName}
                    </h1>
                    <p className="a-p(14) o-videoPlayer__desc a-ellipsis">
                      {videoDesc}
                    </p>
                  </div>
                  <button className="b-flatBtn b-flatBtn--white o-worksheetNavigator__btn" onClick={() => this.onNextVideo()}>
                    <ArrowRight />
                  </button>
                </div> :
                  <div className="o-videoPlayer__contextPane">
                    <div className="a-ellipsis o-videoPlayer__metaData">
                      <h1 className="a-h(20) o-videoPlayer__title a-ellipsis">
                        {videoName}
                      </h1>
                      <p className="a-p(14) o-videoPlayer__desc a-ellipsis">
                        {videoDesc}
                      </p>
                    </div>
                  </div>
              }

            </div> : ''
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  video: state.video,
  student: state.student,
  user: state.user,
});
const actionCreators = {
  saveWatchedVideos,
  createZendeskTicket,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(VideoModal);
