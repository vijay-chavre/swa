import React, { Component } from 'react';

export default class ConceptVideo extends Component {
  static propTypes = {
    showMoreVideos: React.PropTypes.bool,
    renderVideos: React.PropTypes.func,
    video: React.PropTypes.shape({
    }),
  }
  loadVideo = () => {
    const currentVideo = document.getElementById('video');
    currentVideo.load();
  }
  render() {
    const { video, showMoreVideos } = this.props;
    return (
      <div>
        <div className="o-conceptVideo">
          <div className="o-conceptVideo__preview">
            {/* <button className="o-conceptVideo__previewPlayBtn">
                      <Video />
                    </button> */}
            <video className="o-videoPlayer__video" style={{ height: '100%' }} id="video" controls controlsList="nodownload" >
              <source src={`//videos.tabtor.com/${video.id}.mp4`} type="video/mp4" />
            </video>
          </div>
          <div className="o-conceptVideo__details">
            <h2 className="o-conceptVideo__title">
              {video.name}
            </h2>
            <div className="o-conceptVideo__conceptTitle">
              {video.concept}
            </div>
            <p className="o-conceptVideo__description">
              {
                video.description
              }
            </p>
          </div>
        </div>
        {showMoreVideos ?
          <h2 className="a-p(14)">
            More Videos in &ldquo;{video.concept}&rdquo;
          </h2>
          : ''
        }
        <div className="o-videoTiles">
          { showMoreVideos ? this.props.renderVideos() : '' }
          {/* <div className="a-row">

            {/* <div className="a-col a-col-tablet(1-2) a-col(1-3)">
              <Link to="/" className="o-videoTile">
                <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat' }}>
                  <button className="o-videoTile__previewPlayBtn">
                    <Video />
                  </button>
                  <div className="o-videoTile__conceptTitle">
                    <p className="o-videoTile__conceptTitleLabel">
                      {
                        video.concept
                      }
                    </p>
                  </div>
                </div>
                <div className="o-videoTile__title">
                  {
                    video.name
                  }
                </div>
              </Link>

            </div>

            <div className="a-col a-col-tablet(1-2) a-col(1-3)">
              <Link to="/" className="o-videoTile">
                <div className="o-videoTile__preview" data-duration="0:22" style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/DT340_1/thumbnail.png)`, backgroundRepeat: 'no-repeat' }}>
                  <button className="o-videoTile__previewPlayBtn">
                    <Video />
                  </button>
                  <div className="o-videoTile__conceptTitle">
                    <p className="o-videoTile__conceptTitleLabel">
                      {
                        video.concept
                      }
                    </p>
                  </div>
                </div>
                <div className="o-videoTile__title">
                  {video.name}
                </div>
              </Link>
            </div> 
          </div> */}
        </div>
      </div>

    );
  }
}
