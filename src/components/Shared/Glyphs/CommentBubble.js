import React, { Component } from 'react';

export default class CommentBubble extends Component {
  render() {
    return (
      <svg className="a-glyph a-glyph--commentBubble" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,0 C5.37257143,0 0,5.37257143 0,12 C0,14.5081846 0.770004396,16.8362901 2.08583736,18.7618286 L0.509643956,23.490356 L5.23822418,21.9142154 C7.16370989,23.2300484 9.49181538,24 12,24 C18.6274286,24 24,18.6274286 24,12 C24,5.37257143 18.6274286,0 12,0 Z M8,13 C7.44773333,13 7,12.5522667 7,12 C7,11.4477333 7.44773333,11 8,11 C8.55226667,11 9,11.4477333 9,12 C9,12.5522667 8.55226667,13 8,13 Z M12,13 C11.4477333,13 11,12.5522667 11,12 C11,11.4477333 11.4477333,11 12,11 C12.5522667,11 13,11.4477333 13,12 C13,12.5522667 12.5522667,13 12,13 Z M16,13 C15.4477333,13 15,12.5522667 15,12 C15,11.4477333 15.4477333,11 16,11 C16.5522667,11 17,11.4477333 17,12 C17,12.5522667 16.5522667,13 16,13 Z"></path>
      </svg>
    );
  }
}
