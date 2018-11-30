import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import VideoHeader from './VideoHeader';
import StudentNav from '../Shared/StudentNav';
import Video from '../Shared/Glyphs/Video';
import Footer from '../Footer';
import videoMeta from './gradeTopicConcepts';
import { fetchVideos } from '../../actions/video';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import ConceptVideo from './ConceptVideo';
import * as features from '../../constants/feature';

class GradeCatalog extends Component {

  static propTypes = {
    fetchVideos: React.PropTypes.func,
    student: React.PropTypes.shape({
    }),
    video: React.PropTypes.shape({
    }),
    params: React.PropTypes.shape({
      studentId: React.PropTypes.string,
      grade: React.PropTypes.string,
    }),
  }
  constructor(props) {
    super(props);
    this.state = {
      selectedTopic: undefined,
      selectedConcept: undefined,
      selectedGrade: props.params.grade,
      studentId: props.params.studentId,
      isAllTopicsActive: true,
      videoPlaying: false,
      selectedVideo: undefined,
    };
  }

  componentDidMount() {
    this.props.fetchVideos({ grade: this.state.selectedGrade });
  }
  onTopicSelect = (topic) => {
    if (topic === 'all topics') {
      this.setState({ isAllTopicsActive: true, selectedTopic: undefined, selectedConcept: undefined, videoPlaying: false });
      this.props.fetchVideos({ grade: this.state.selectedGrade });
    } else {
      if (this.state.selectedConcept) {
        this.state.selectedConcept = undefined;
      }
      this.setState({ isAllTopicsActive: false, selectedTopic: topic, videoPlaying: false });
      this.props.fetchVideos({ grade: this.state.selectedGrade, topic });
    }
  }

  onConceptSelect = (topic, concept) => {
    this.setState({ selectedConcept: concept });
   //  this.props.fetchVideos({ grade: this.state.selectedGrade, topic, concept });
  }

  renderTopics = () => {
    const activeTopicClass = 'o-videoLibraryMenu__topicItem o-videoLibraryMenu__topicItem--selected o-videoLibraryMenu__topicItem--active';
    const inactiveTopicClass = 'o-videoLibraryMenu__topicItem';
    const allTopics = Object.keys(videoMeta[this.state.selectedGrade]);
    const topics = [];
    allTopics.forEach((topic) => {
      let topicClass = inactiveTopicClass;
      if (topic === this.state.selectedTopic) {
        topicClass = activeTopicClass;
      }
      topics.push(
        <li className={topicClass} onClick={() => this.onTopicSelect(topic)}>
          {topic}
          {this.renderConcepts(topic)}
        </li>
      );
    });
    return (
      <ul className="o-videoLibraryMenu__topicList">
        <li className={this.state.isAllTopicsActive ? activeTopicClass : inactiveTopicClass} onClick={() => this.onTopicSelect('all topics')}>
          All Topics
        </li>
        {topics}
      </ul>
    );
  }

  renderConcepts = (topic) => {
    const activeConceptClass = 'o-videoLibraryMenu__conceptItem o-videoLibraryMenu__conceptItem--active';
    const inactiveConceptClass = 'o-videoLibraryMenu__conceptItem';

    const topics = videoMeta[this.state.selectedGrade];
    const allConcepts = topics[topic];
    const concepts = [];
    allConcepts.forEach((concept) => {
      let conceptClass = inactiveConceptClass;
      if (this.state.selectedConcept === concept) {
        conceptClass = activeConceptClass;
      }
      concepts.push(
        <li className={conceptClass} onClick={() => this.onConceptSelect(topic, concept)}>
          <span className="o-videoLibraryMenu__conceptItemLabel--active">
            {concept}
          </span>
        </li>
      );
    });
    return (
      <ul className="o-videoLibraryMenu__conceptList">
        {concepts}
      </ul>
    );
  }
  renderVideos = () => {
    const videos = [];
    if (this.props.video) {
      const allVideos = Object.keys(this.props.video);
      allVideos.forEach((key) => {
        const video = this.props.video[key];
        if (video && (!this.state.selectedConcept || (this.state.selectedConcept && this.state.selectedConcept === video.concept))) {
          videos.push(
            this.renderVideo(video)
          );
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
    this.setState({ isAllTopicsActive: false, videoPlaying: true, selectedVideo: video, selectedTopic: video.topic, selectedConcept: video.concept }, () => {
      this.renderTopics();
      this.child.loadVideo();
    });
  }

  render() {
    const grade = (this.state.selectedGrade === 'K') ? 0 : parseInt(this.state.selectedGrade, 10);
    const gradeLabel = (grade === 0) ? 'Kindergarten' : `Grade ${grade}`;
    const tileClass = `a-container o-videoLibraryGrade o-videoLibraryGrade--${this.state.selectedGrade}`;
    const gradeTitle = videoMeta.meta[grade].title;
    return (
      <div className="a-appView a-appView--hasSidebar a-appView--altBG">
        <VideoHeader
          currentNavigation={features.VIDEO_LIBRARY}
          grade={this.state.selectedGrade}
          topic={this.state.selectedTopic}
          concept={this.state.selectedConcept}
          isAllTopicsActive={this.state.isAllTopicsActive}
        />
        <StudentNav currentSelectedFeature={features.VIDEO_LIBRARY} />
        <div className="a-appView__contents">
          <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
            <LoadingSpinner />
          </div>
          <div className={tileClass}>
            <div className="a-row a-justifyContent(center)">
              <div className="a-col a-col(1-4)">
                <div className="o-videoLibraryMenu">
                  <div className="b-circleBox b-circleBox--size(64)">
                    {this.state.selectedGrade}
                  </div>
                  <h2 className="a-s(14) a-allCaps o-videoLibraryMenu__gradeTitle">
                    {gradeLabel}
                  </h2>
                  <div className="o-videoLibraryMenu__gradeDescription">
                    {gradeTitle}
                  </div>
                  {this.renderTopics()}
                </div>
              </div>

              <div className="a-col a-col(3-4)">
                { this.state.videoPlaying ? <ConceptVideo video={this.state.selectedVideo} videos={this.props.video} play={this.playVideo} showMoreVideos renderVideos={this.renderVideos} ref={instance => { this.child = instance; }} /> : this.renderVideos() }
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  video: state.video,
  loading: state.loading,
});
const actionCreators = {
  fetchVideos,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(GradeCatalog);
