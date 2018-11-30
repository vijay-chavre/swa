import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import Video from '../Shared/Glyphs/Video';
import PlayerIcon from '../Shared/Glyphs/PlayerIcon';
import * as Localization from '../Shared/Localization';
import Footer from '../Footer';
import videoMeta from './gradeTopicConcepts';
import * as Common from '../Shared/Common';
import { fetchVideos } from '../../actions/video';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import ConceptVideo from './ConceptVideo';

class VideoLibrary extends Component {

  static propTypes = {
    fetchVideos: React.PropTypes.func,
    user: React.PropTypes.shape({
    }),
    loading: React.PropTypes.shape({
      isLoading: React.PropTypes.bool,
    }),
    student: React.PropTypes.shape({
    }),
    params: React.PropTypes.shape({
      studentId: React.PropTypes.string,
    }),
    video: React.PropTypes.shape({
    }),
  }
  constructor(props) {
    super(props);
    this.state = {
      studentId: props.params.studentId,
      videoPlaying: false,
      selectedVideo: undefined,
    };
  }

  componentDidMount() {
    const { student } = this.props;
    this.props.fetchVideos({ grade: student.grade });
    dataLayer.push({
      uid: student._id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'swaViewVideoLibrary',
    });
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  videosForGuestFlow = () => {
    const videos = [];
    const concepts = [];
    const topics = [];
    let count = 0;
    if (this.props.video) {
      const allVideos = Object.keys(this.props.video);
      allVideos.forEach((key) => {
        const video = this.props.video[key];
        if (video && concepts.indexOf(video.concept) === -1 && topics.indexOf(video.topic) === -1 && video.name && video.name.length > 20 && count <= 6) {
          videos.push(
            this.renderVideo(video)
          );
          concepts.push(video.concept);
          topics.push(video.topic);
          count += 1;
        }
      });
    }
    return (
      <div className="a-row a-justifyContent(center)">{videos}</div>
    );
  }

  renderVideo = (video) => {
    return (
      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
        <Link className="o-videoTile" onClick={() => this.playVideo(video)}>
          <div className="o-videoTile__preview" data-duration={`${video.videoLength}`} style={{ backgroundImage: `url(https://videos.tabtor.com/${video.id}.png)`, backgroundRepeat: 'no-repeat' }}>
            <button className="o-videoTile__previewPlayBtn">
              <Video />
            </button>
            <div className="o-videoTile__conceptTitle">
              <p className="o-videoTile__conceptTitleLabel">
                {video.concept}
              </p>
            </div>
          </div>
          <div className="o-videoTile__title">
            {video.name}
          </div>
        </Link>
      </div>
    );
  }

  playVideo = (video) => {
    this.setState({ videoPlaying: true, selectedVideo: video }, () => {
      this.child.loadVideo();
    });
  }

  gradeList = () => {
    const grades = [];
    const studentId = this.state.studentId;
    let count = 0;
    videoMeta.meta.map((gradeMeta) => {
      const grade = (count === 0) ? 'K' : count;
      const gradeLabel = (count === 0) ? 'Kindergarten' : `Grade ${count}`;
      const tileClass = `o-gradeTile o-gradeTile--${grade}`;
      grades.push(
        <div className="a-col a-col-tablet(1-2) a-col(1-3)">
          <div className={tileClass}>
            <Link to={`/student/${studentId}/video-library/${grade}`} className="o-gradeTile__link" />
            <div className="o-gradeTile__profile">
              <h2 className="a-h(36) a-color(white)">
                {grade}
              </h2>
            </div>
            <div className="o-gradeTile__description">
              <h2 className="a-s(14) a-allCaps">
                {gradeLabel}
              </h2>
              <p className="a-p(13)">
                {gradeMeta.title}
              </p>
            </div>
            <div className="o-gradeTile__infoBar">
              <p className="o-gradeTile__infoItem">
                {gradeMeta.videos} Videos
              </p>
              <p className="o-gradeTile__infoItem">
                {gradeMeta.concepts} Concepts
              </p>
            </div>
          </div>
        </div>
      );
      count += 1;
    });
    return grades;
  }
  render() {
    return (
      <div>
        <StudentHeader currentNavigation={'Video Library'} />
        <StudentNav currentNavigation={'Video Library'} />
        {(this.isGuestFlow()) ?
          <div className="a-appView a-appView--hasSidebar a-appView--altBG">
            <div className="a-appView__contents">
              <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
                <LoadingSpinner />
              </div>
              <div className="a-container o-videoLibraryGrade o-videoLibraryGrade--guest">
                <div className="a-row a-justifyContent(center)">
                  <div className="a-col a-col(1-4)">
                    <div className="o-videoLibraryMenu">
                      <div className="b-circleBox b-circleBox--size(64)">
                        <PlayerIcon />
                      </div>
                      <h2 className="a-s(14) a-allCaps o-videoLibraryMenu__gradeTitle">
                        Video Library
                      </h2>
                      <div className="o-videoLibraryMenu__gradeDescription">
                        Our Video Library allows you to browse through our collection of video tutorials by topic and concept name. It gives your child quick access to videos to help with Thinkster assignments, school homework, and test prep.
                      </div>
                    </div>
                  </div>

                  <div className="a-col a-col(3-4)">
                    {this.state.videoPlaying ? <ConceptVideo video={this.state.selectedVideo} play={this.playVideo} ref={instance => { this.child = instance; }} /> : this.videosForGuestFlow()}
                    {/* <div className="a-row a-justifyContent(center)">
                      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
                        <Link to="/" className="o-videoTile">
                          <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                            <button className="o-videoTile__previewPlayBtn">
                              <Video />
                            </button>
                            <div className="o-videoTile__conceptTitle">
                              <p className="o-videoTile__conceptTitleLabel">
                                Counting with Illustrations
                              </p>
                            </div>
                          </div>
                          <div className="o-videoTile__title">
                            Beginning Counting
                          </div>
                        </Link>
                      </div>
                      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
                        <Link to="/" className="o-videoTile">
                          <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                            <button className="o-videoTile__previewPlayBtn">
                              <Video />
                            </button>
                            <div className="o-videoTile__conceptTitle">
                              <p className="o-videoTile__conceptTitleLabel">
                                Counting with Illustrations
                              </p>
                            </div>
                          </div>
                          <div className="o-videoTile__title">
                            Counting 7 &amp; 8
                          </div>
                        </Link>
                      </div>
                      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
                        <Link to="/" className="o-videoTile">
                          <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                            <button className="o-videoTile__previewPlayBtn">
                              <Video />
                            </button>
                            <div className="o-videoTile__conceptTitle">
                              <p className="o-videoTile__conceptTitleLabel">
                                Pictorial Models
                              </p>
                            </div>
                          </div>
                          <div className="o-videoTile__title">
                            Counting Objects 11 &amp; 12
                          </div>
                        </Link>
                      </div>
                      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
                        <Link to="/" className="o-videoTile">
                          <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                            <button className="o-videoTile__previewPlayBtn">
                              <Video />
                            </button>
                            <div className="o-videoTile__conceptTitle">
                              <p className="o-videoTile__conceptTitleLabel">
                                Number Names
                              </p>
                            </div>
                          </div>
                          <div className="o-videoTile__title">
                            Number and Number Words
                          </div>
                        </Link>
                      </div>
                      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
                        <Link to="/" className="o-videoTile">
                          <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                            <button className="o-videoTile__previewPlayBtn">
                              <Video />
                            </button>
                            <div className="o-videoTile__conceptTitle">
                              <p className="o-videoTile__conceptTitleLabel">
                                Number Names
                              </p>
                            </div>
                          </div>
                          <div className="o-videoTile__title">
                            Numberal and Number Words
                          </div>
                        </Link>
                      </div>
                      <div className="a-col a-col-tablet(1-2) a-col(1-3)">
                        <Link to="/" className="o-videoTile">
                          <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                            <button className="o-videoTile__previewPlayBtn">
                              <Video />
                            </button>
                            <div className="o-videoTile__conceptTitle">
                              <p className="o-videoTile__conceptTitleLabel">
                                Counting with Illustrations
                              </p>
                            </div>
                          </div>
                          <div className="o-videoTile__title">
                            Counting Objects 15 &amp; 16
                          </div>
                        </Link>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
          :
          <div className="a-appView a-appView--hasSidebar a-appView--altBG">
            <div className="a-appView__contents">
              <div className="a-container a-container__intro">
                <h1 className="a-h(28)">
                  {Localization.localizedStringForKey('Choose a Grade Level')}
                </h1>
                <p className="a-p(14) a-color(copy-2)">
                  {Localization.localizedStringForKey('Our Video Library gives you access to all video tutorials to help with Thinkster assignments, school homework, or when studying for tests.')}
                </p>
              </div>

              <div className="a-container">
                <div className="a-row a-justifyContent(center)">
                  {this.gradeList()}
                </div>
              </div>
            </div>
            <Footer />
          </div>
        }
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  student: state.student,
  loading: state.loading,
  video: state.video,
});

const actionCreators = {
  fetchVideos,
};
export default connect(
  mapStateToProps,
  actionCreators,
)(VideoLibrary);
