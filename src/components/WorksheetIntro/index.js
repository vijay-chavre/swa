import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router';
import VideoModal from '../Shared/VideoModal';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import Video from '../Shared/Glyphs/Video';
import Youtube from '../Shared/Glyphs/Youtube';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
// import Video from '../Shared/Glyphs/Video';
import * as VideoActions from '../../actions/video';

class WorksheetIntro extends Component {
  static propTypes = {
    session: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    params: React.PropTypes.shape({
      studentId: React.PropTypes.string,
      assignmentId: React.PropTypes.string,
      activityState: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({
    }),
  }
  constructor(props) {
    super(props);
    const { student } = this.props;
    this.state = {
      studentId: props.params.studentId,
      assignmentId: props.params.assignmentId,
      activityState: props.params.activityState,
      assignment_details: {
      },
      worksheetType: 'practice',
      showVideo: false,
      allVideos: [],
    };

    student.playlists.map((playlist) => playlist.worksheets.map((assignment) => {
      if (assignment.id === props.params.assignmentId) {
        this.state.assignment_details = assignment;
        if (assignment.meta && assignment.meta.type) {
          if (assignment.meta.type.toLowerCase() === 'test' && assignment.worksheet_id && assignment.worksheet_id.toLowerCase().includes('dt')) {
            // skills assessment flow
            this.state.worksheetType = 'skillsassessment';
          } else if (assignment.meta.type.toLowerCase() === 'test') {
            this.state.worksheetType = 'test';
          } else if (assignment.meta.type.toLowerCase() === 'practice') {
            this.state.worksheetType = 'practice';
          } else if (assignment.meta.type.toLowerCase() === 'review') {
            this.state.worksheetType = 'review';
          } else if (assignment.meta.type.toLowerCase() === 'challenge') {
            this.state.worksheetType = 'challenge';
          }
        }
      }
    }));

    this.initializeVideos();
  }

  componentWillMount() {
    window.scrollTo(0, 0);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    Raven.setUserContext({ id: this.props.params.studentId });
    window.Intercom('shutdown');
    dataLayer.push({
      uid: this.props.params.studentId, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'viewContent',
      contentType: 'Worksheet Preview',
      worksheetType: this.state.assignment_details.meta.type,
      worksheet_id: this.state.assignment_details.worksheet_id, // i.e. DT140
      worksheet_number: this.state.assignment_details.meta.worksheet_number, // i.e. DT140
    });
    Raven.captureBreadcrumb({
      message: 'Worksheet Intro',
      category: 'attempt',
      data: {
        studentId: this.props.params.studentId,
        worksheetType: this.state.assignment_details.meta.type,
        worksheet_id: this.state.assignment_details.worksheet_id, // i.e. DT140
        worksheet_number: this.state.assignment_details.meta.worksheet_number, // i.e. DT140
      },
    });
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  onVideo = (videoId) => {
    // get the video id to play
    this.setState({ showVideo: true, videoId });
  }

  onCloseVideo = () => {
    this.setState({ showVideo: false, videoId: undefined });
  }

  getMP4Videos = (videos) => {
    const tempVideos = { thinkster: [], external: [] };
    videos.forEach((video) => {
      if (video.source === 'youtube') {
        tempVideos.external.push(video);
      } else if ((video.mp4URI && video.mp4URI.includes('mp4'))) {
        tempVideos.thinkster.push(video);
      }
    });
    return tempVideos;
  }

  initializeVideos = () => {
    // let questionVideos = [];
    let allVideos = [];
    if (this.state.assignment_details) {
      if (this.state.assignment_details.q_videos) {
        allVideos = this.state.assignment_details.q_videos;
      }
      if (this.state.assignment_details.ws_videos) {
        const combinedVideos = allVideos.concat(this.state.assignment_details.ws_videos);
        allVideos = _.uniqBy(combinedVideos, (video) => video.video_id);
      }
      if (this.state.assignment_details.concept_videos) {
        const combinedVideos = allVideos.concat(this.state.assignment_details.concept_videos);
        allVideos = _.uniqBy(combinedVideos, (video) => video.video_id);
      }
    }

    this.state.allVideos = this.getMP4Videos(allVideos);
  }

  worksheetIntroMessage = () => {
    if (this.state.worksheetType === 'skillsassessment') {
      return (
        <div>
          <p className="a-p(14)">
            {config.isViaAfrika ?
              Localization.localizedStringForKey('You will first warm up with 5 sample questions and then you will attempt 15 questions that will comprise your diagnostic assessment. The diagnostic assessment is used to build a personalized learning plan just for you.') :
              Localization.localizedStringForKey('You will first warm up with 5 sample questions and then you will attempt 15 questions that will comprise your Skills Assessment. The Skills Assessment is used to build a personalized learning plan just for you.')}
          </p>
          <p className="a-p(14)">
            {Localization.localizedStringForKey('Good luck!')}
          </p>
        </div>
      );
    } else if (this.state.worksheetType === 'test') {
      return (
        <div>
          <p className="a-p(14)">
            {Localization.localizedStringForKey('You are about to start a test. We recommend uninterrupted time and a quiet space. Your coach will tailor your assignments based on the test results.')}
          </p>
          <ul className="b-bulletList">
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('There will be no video tutorials.')}
              </p>
            </li>
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('No second attempts during a test.')}
              </p>
            </li>
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('You can revise your answers before the final submission.')}
              </p>
            </li>
          </ul>
          <p className="a-p(14)">
            {Localization.localizedStringForKey('Good luck!')}
          </p>
        </div>
      );
    } else if (this.state.worksheetType === 'review') {
      return (
        <div>
          <p className="a-p(14)">
            {Localization.localizedStringForKey('This is a quiz. We are testing to see if you have learned what was taught previously on practice work.  Your coach will adjust your work based on the test results')}
          </p>
          <ul className="b-bulletList">
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('There are no video tutorials.')}
              </p>
            </li>
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('You will get two chances to answer the questions')}
              </p>
            </li>
          </ul>
          <p className="a-p(14)">
            {Localization.localizedStringForKey('Good luck!')}
          </p>
        </div>
      );
    } else if (this.state.worksheetType === 'challenge') {
      return (
        // <div>
        //   {/* <iframe src={`data:text/html;charset=utf-8,${this.state.assignment_details.meta.description}`} style={{ height: '500px', width: '1000px' }} /> */}

        // </div>
        <div dangerouslySetInnerHTML={{ __html: this.state.assignment_details.meta.description }} />
      );
    } else if (this.state.worksheetType === 'practice') {
      return (
        <div>
          <p className="a-p(14)">
            {Localization.localizedStringForKey('This is a practice worksheet.')}
          </p>
          <ul className="b-bulletList">
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('Show your work so the coach can see which strategy you used to solve the problems')}
              </p>
            </li>
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('There is a video tutorial to help you understand how to solve the problems')}
              </p>
            </li>
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('Try to work on your own.  Let your coach know if your parent helped in solving the problems')}
              </p>
            </li>
            <li className="b-bulletList__item">
              <p className="a-p(14)">
                {Localization.localizedStringForKey('Do your best!')}
              </p>
            </li>
          </ul>
        </div>
      );
    }
  }

  testConceptVideo() {
    console.log(this.props.video);
  }

  renderYoutubeVideo(video) {
    return (
      <li className="b-videoPlaylist__item">
        <div onClick={this.onVideo.bind(this, video.video_id)} className="b-videoPlaylist__video" style={{ backgroundImage: `url(${video.thumbnail_url})`, cursor: 'pointer' }} >
          <Video />
          <Youtube style={{ height: '23px', background: 'white', float: 'right', padding: '5px' }} />
        </div>
        <div className="b-videoPlaylist__desc">
          <h3 className="a-p(16)">
            {video.name}
          </h3>
          <p className="a-p(12)">
            {video.description}
          </p>
        </div>
      </li>
    );
  }

  hasVideos() {
    return this.state.allVideos && ((this.state.allVideos.thinkster && this.state.allVideos.thinkster.length > 0) || (this.state.allVideos.external && this.state.allVideos.external.length > 0));
  }
  getAllVideos = (allVideos) => {
    let videos = [];
    if (allVideos && ((allVideos.thinkster && allVideos.thinkster.length > 0) || (allVideos.external && allVideos.external.length > 0))) {
      videos = allVideos.thinkster.concat(allVideos.external);
    }
    return videos;
  }

  renderVideo(video) {
    if (video.source === 'youtube') {
      return this.renderYoutubeVideo(video);
    }
    let videoName = video.video_id;
    let videoDesc = 'Video Description Not Available.';
    if (video) {
      if (video.name && video.name !== '') {
        videoName = video.name;
      }
      if (video.description && video.description !== '') {
        videoDesc = video.description;
      }
    }
    return (
      <li className="b-videoPlaylist__item">
        <div onClick={this.onVideo.bind(this, video.video_id)} className="b-videoPlaylist__video" style={{ backgroundImage: `url(https://s3.amazonaws.com/tabtor-videos/Production/1/${video.video_id}.png)`, cursor: 'pointer' }} >
          <Video />
        </div>
        <div className="b-videoPlaylist__desc">
          <h3 className="a-p(16)">
            {videoName}
          </h3>
          <p className="a-p(12)">
            {videoDesc}
          </p>
        </div>
      </li>
    );
  }
  render() {
    const { student } = this.props;
    const imageUrl = `https://s3.amazonaws.com/${ENV.profilePictureBucket}/${student._id}.png`;
    return (
      <div>
        <VideoModal
          show={this.state.showVideo}
          videoId={this.state.videoId}
          onCloseVideo={this.onCloseVideo}
          videoList={this.getAllVideos(this.state.allVideos)}
          assignmentId={this.state.assignmentId}
          worksheetId={this.state.assignment_details.worksheet_id}
          source={'Worksheet Intro'}
        />
        <header className="o-appHeader">
          <Link href="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
            <ThinksterLogomark />
            <ThinksterWordmark />
          </Link>
          <div className="o-appHeader__breadcrumb">
            : &nbsp;
            <Link to={`/student/${student._id}`} title="Worksheets" className="a-color(copy-1)">
              {Localization.localizedStringForKey('Worksheets')}
            </Link>
            &nbsp; : &nbsp;
            <span className="a-color(copy-1)">
              {`#${this.state.assignment_details.meta ? this.state.assignment_details.meta.worksheet_number : ''}`}
            </span>
            &nbsp; : &nbsp;
            <span className="a-strong a-color(copy-1)">
              {Localization.localizedStringForKey('Intro')}
            </span>
          </div>
          {(this.isGuestFlow()) ?
            <ul className="o-appHeader__actions">
              <li className="o-appHeader__actionItem">
                <a href={ENV.enrollURL} title="Start Free Trial" target="_blank" className="b-flatBtn b-flatBtn--gradient(active-3)">
                  <span className="b-button__label">
                    Start Free Trial
                  </span>
                </a>
              </li> </ul> :

            <ul className="o-appHeader__actions">
              <li className="o-appHeader__actionItem o-appHeader__profile">
                <div className="o-appHeader__profileName" title="Log Out">
                  {student.first_name}
                  {(Common.isPurchaseOfTypeProduct(student) && student.hide_grade) ? '' :
                    <span className="a-p(12) a-color(copy-2)">
                      &nbsp; {Localization.localizedStringForKey('Grade')} {student.grade === 'K' && config.isViaAfrika ? 'R' : student.grade}
                    </span>
                  }
                </div>

                <img className="b-avatar b-avatar--size(32)" src={imageUrl} onError="" />
              </li>
            </ul>
          }

        </header>
        <div className="a-appView">
          <div className="a-appView__contents">
            <div className="o-worksheetIntro__header o-worksheetIntro__header--mathPattern">
              <h1 className="a-h(28) a-color(white)">
                <span className="a-s(12) o-worksheetIntro__id">
                  {`#${this.state.assignment_details.meta ? this.state.assignment_details.meta.worksheet_number : ''}`}
                </span>
                {this.state.assignment_details.meta.name}
              </h1>

              <section className="o-perfReport__summary">
                <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue">
                    {this.state.assignment_details.meta ? `${this.state.assignment_details.meta.number_of_questions}` : ''}
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    {Localization.localizedStringForKey('Total Questions')}
                  </span>
                </div>

                <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue">
                    {this.state.assignment_details.meta ? `${moment.utc(this.state.assignment_details.meta.suggested_time * 1000 * 60).format('mm:ss')}` : ''}
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    {Localization.localizedStringForKey('Suggested Time')}
                  </span>
                </div>

                {/* <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue">
                    200
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    Total Points
                  </span>
                </div>*/}

              </section>
            </div>

            <section className="a-container o-worksheetIntro__details">
              {(this.state.worksheetType !== 'challenge') ?
                <div className="o-worksheetIntro__preview">
                  <img className="o-worksheetIntro__previewImg" alt="Worksheet Preview" src={`https://tapi.tabtor.com/worksheet/${this.state.assignment_details.worksheet_id}/screenshot.png`} />
                </div> : ''
              }
              <div className="o-worksheetIntro__description">
                {this.worksheetIntroMessage()}
                {(this.state.worksheetType !== 'challenge') ?
                  <div className="o-worksheetIntro__videos">
                    <h2 className="a-h(18) a-h(18)--hasDivider">
                      {Localization.localizedStringForKey('Thinkster Video Tutorials for this Assignment')}
                    </h2>
                    {(this.hasVideos() && this.state.worksheetType !== 'skillsassessment') ?
                      <div>
                        <ul className="b-videoPlaylist">
                          {this.state.allVideos.thinkster.map((video) => this.renderVideo(video))}
                        </ul>
                        {this.state.allVideos.external.length > 0 ?
                          <div>
                            <h2 className="a-h(18) a-h(18)--hasDivider">
                              Additional Videos to Help You<sup>*</sup>
                            </h2>
                            <ul className="b-videoPlaylist">
                              {this.state.allVideos.external.map((video) => this.renderVideo(video))}
                            </ul>
                            <div className="a-p(12)">
                              [*] Source of external videos: To help parents and students, Thinkster Math provides links to publicly available external videos and other resources that we believe are of high standards. These are assets that are entirely the property of the creators and Thinkster Math only makes these available to assist students with understanding of the current concept
                            </div>
                          </div> : ''}
                      </div>
                      : <div> <br /> {Localization.localizedStringForKey('No Video tutorials for this Assignment')} </div>
                    }
                  </div> : ''
                }
              </div>
            </section>
            <div className="o-worksheetIntro__actions">
              <Link className="b-flatBtn b-flatBtn--gradient(active-1) b-flatBtn--large" to={`/student/${student._id}/attempt/${this.state.assignment_details.id}/${this.state.activityState}`}>
                <span className="b-button__label a-allCaps">
                  {this.state.activityState.toLowerCase() === 'resume' ? Localization.localizedStringForKey('Resume') : Localization.localizedStringForKey('Begin')}
                </span>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  student: state.student,
  video: state.video,
  user: state.user,
});

export default connect(
  mapStateToProps,
)(WorksheetIntro);
