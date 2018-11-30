import React, { Component } from 'react';

export default class Footer extends Component {
  componentDidMount() {
  }

  

  render() {
    const copyrightYear = (new Date()).getFullYear();
    return (
      <div className="o-appFooter">
        {/* Badge animation */}
        <div id="content_wrap" className="badgeAnimation" style={{ display: 'none' }} >
          <div className="contentArea">
            <h2 className="animation-title"></h2>
            <p className="animation-text"></p>
            <div className="bdg-img">
              <svg className="a-glyph" width="128" height="176" viewBox="0 0 128 176" xmlns="http://www.w3.org/2000/svg">

                <g transform="translate(-1008.000000, -376.000000) translate(1008.000000, 376.000000)" fill="none">

                  <path fill="#007807" d="M79 72L46 0H16l33 72" />

                  <path fill="#0BB015" d="M79 72l33-72H82L49 72" />

                  <path d="M64.5 72H62L29 0h5l30.5 66.545L95 0h5L67 72h-2.5z" fill="#FFF" />

                  <path d="M64 176c-35.288 0-64-28.712-64-64s28.712-64 64-64 64 28.712 64 64-28.712 64-64 64z" fill="#F7D0B5" />

                  <circle fill="#EEB086" cx="64" cy="112" r="48" />

                  <path d="M61.92 84.294c.393-.792 1.2-1.294 2.083-1.294.883 0 1.692.502 2.083 1.294l7.47 15.14c.338.683.993 1.16 1.75 1.27l16.706 2.426c.876.126 1.6.74 1.874 1.58.273.84.046 1.764-.587 2.38l-12.09 11.785c-.55.533-.8 1.302-.67 2.055l2.85 16.64c.15.873-.208 1.753-.926 2.273-.716.518-1.663.587-2.447.178l-14.943-7.852c-.675-.355-1.485-.355-2.16 0l-14.944 7.856c-.78.41-1.73.343-2.446-.176-.717-.52-1.074-1.4-.925-2.273l2.852-16.64c.13-.752-.122-1.52-.67-2.054L34.7 107.09c-.63-.617-.86-1.54-.585-2.38.273-.84 1-1.454 1.875-1.58l16.71-2.427c.757-.11 1.41-.586 1.75-1.272l7.474-15.13z"
                    fill="#ED843C" />

                </g>

              </svg>

            </div>
          </div>
          <canvas id="animation_1" className="main_canvas" />
        </div>
        {/* ./Badge animation */}

        {/* Star Animation */}
        <div className="starAnimation" style={{ display: 'none' }}>
          <div className="overlay-sec">
            <div className="inner-animation-sec">
              <h2>Triple Point Zone</h2>
              <div id="loading">
                <div className="outer-shadow"></div>
                <div className="inner-shadow"></div>
                <div className="timer">
                  <div className="hold" id="left">
                    <div className="pie"></div>
                  </div>
                  <div className="hold" id="right">
                    <div className="pie"></div>
                  </div>
                </div>
              </div>
              <div className="star-box">
                <div className="star-box-inner">
                  <div className="loader-star loader-star-1">
                    <img src={require("../../../static/images/purplestar-ta@2x.png")} alt="star animation" />
                  </div>
                  <div className="loader-star loader-star-2">
                    <img src={require("../../../static/images/greenstar-ta@2x.png")} alt="star animation" />
                  </div>
                  <div className="loader-star loader-star-3">
                    <img src={require("../../../static/images/orangestar-ta@2x.png")} alt="star animation" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ./Star Animation */}


        <p className="a-p(14)">
          Copyright &copy; {copyrightYear} Prazas Learning. All rights reserved.
        </p>
        <p className="a-p(14)">
          <a href="https://www.hellothinkster.com/privacy.html" title="Privacy Policy">
            Privacy Policy
          </a>
          &nbsp; &nbsp;
          <a href="https://www.hellothinkster.com/terms.html" title="Terms of Use">
            Terms of Use
          </a>
        </p>
      </div >
    );
  }
}
