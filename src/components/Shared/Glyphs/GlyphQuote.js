// NOTE: max-len lint rule is disabled since this page has copy as single-line
// string literals.
/* eslint-disable max-len */
import React, { Component } from 'react';

export default class GlyphQuote extends Component {
  render() {
    return (
      <svg className="a-glyph a-glyph--quote" width="24" height="17" viewBox="0 0 24 17" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 7.333h10.667v9.334H0V7.333zM7.333 0l1.334 3.667S6 4.333 6 7.333H0C0 1.667 4 0 7.333 0zm6 7.333H24v9.334H13.333V7.333zM20.667 0L22 3.667s-2.667.666-2.667 3.666h-6c0-5.666 4-7.333 7.334-7.333z" fillRule="evenodd"/>
      </svg>
    );
  }
}
