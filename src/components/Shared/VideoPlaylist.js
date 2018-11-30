import React, { Component } from 'react';
import { connect } from 'react-redux';
import Close from './Glyphs/Close';
import Video from './Glyphs/Video';
import Youtube from './Glyphs/Youtube';


class VideoPlaylist extends Component {
  static propTypes = {
    show: React.PropTypes.bool,
    videoList: React.PropTypes.Array,
    onVideo: React.PropTypes.func,
    onCloseVideoPlayList: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentVideoId: undefined,
    };
  }

  renderYoutubeVideo(video) {
    const { onVideo, videoList } = this.props;
    return (
      <li className="b-videoPlaylist__item">
        <div onClick={() => onVideo(video.video_id)} className="b-videoPlaylist__video" style={{ backgroundImage: `url(${video.thumbnail_url})`, cursor: 'pointer' }} >
          <Video />
          <Youtube style={{ height: '23px', background: 'white', float: 'right',padding: '5px'}} />
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

  renderVideo() {
    
    const { onVideo, videoList } = this.props;
    const videoArray = [];
    if (videoList && videoList.length > 0) {
      videoList.forEach((video) => {
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
        if (video.source == 'youtube') {
          videoArray.push(this.renderYoutubeVideo(video));
        } else {
          videoArray.push(
            <li className="b-videoPlaylist__item">
              <div onClick={() => onVideo(video.video_id)} className="b-videoPlaylist__video" style={{ backgroundImage: `url(https://s3.amazonaws.com/tabtor-videos/Production/1/${video.video_id}.png)`, cursor: 'pointer' }}>
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
      });
    }
    return (
      <ul className="a-limiter a-limiter(696) b-videoPlaylist">{videoArray}</ul>
    );
  }


  render() {
    const { show, onCloseVideoPlayList } = this.props;
    const className = show ? 'o-modal--show' : 'o-modal--hide';
    return (
      <div className={`o-modal ${className}`}>

        <div className="o-modal__box o-modal__box--maximized">
          <button className="o-modal__closeBtn" onClick={onCloseVideoPlayList}>
            <Close />
          </button>
          <h1 className="a-s(18) a-justify(center) o-modal__boxHeader">
            Video Tutorials for this Assignment
          </h1>
          <div className="o-modal__boxScrollBox">
            { this.renderVideo() }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
)(VideoPlaylist);
