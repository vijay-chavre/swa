import React, { Component } from 'react';

export default class LoadingSpinner extends Component {
  render() {
    return (
      <svg className="a-glyph a-glyph--loading" width="51" height="53" viewBox="0 0 51 53" xmlns="http://www.w3.org/2000/svg">
        <g fill="none"><circle fill="#29E6BB" cx="26.584" cy="6.164" r="6.164"/><circle fill="#FFC000" cx="26.584" cy="49.002" r="3.698"/><circle fill="#9761FF" cx="11.438" cy="12.436" r="5.548"/><circle fill="#3DD5FE" cx="41.73" cy="42.726" r="3.082"/><circle fill="#84D42D" cx="5.164" cy="27.584" r="4.93"/><circle fill="#0C7CC8" cx="48.002" cy="27.582" r="2.464"/><path d="M8.388 39.68c-1.686 1.686-1.686 4.414 0 6.1 1.684 1.686 4.416 1.686 6.1 0 1.686-1.686 1.686-4.414 0-6.1-1.684-1.688-4.414-1.704-6.1 0z" fill="#BE7617"/><circle fill="#FF61BF" cx="41.728" cy="12.436" r="1.848"/></g>
      </svg>
    );
  }
}
