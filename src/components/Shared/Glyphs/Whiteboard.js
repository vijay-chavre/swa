import React, { Component } from 'react';

export default class Whiteboard extends Component {
  render() {
    return (
      <svg className="a-glyph a-glyph--whiteboard" width="24" height="20" viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 18h24v2H0v-2zM1 0h22v17H1V0zm10 5v1h9V5h-9zm0 3v1h7V8h-7zm-5 3v1h9v-1H6z" fillRule="evenodd"/>
      </svg>
    );
  }
}
