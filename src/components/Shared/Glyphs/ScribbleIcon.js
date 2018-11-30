import React, { Component } from 'react';

export default class ScribbleIcon extends Component {
  static propTypes = {
    color: React.PropTypes.string,
  }

  render() {
    const { color } = this.props;
    const strokeStyle = {
      fill: 'none',
      stroke: color,
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };
    return (
      <svg className="a-glyph" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, -19.747713, -20.179283)">
          <path className="a-glyph__stroke" style={strokeStyle} d="M 26.852 23.321 C 26.852 24.221 31.752 22.521 31.752 23.321 C 31.752 25.221 22.352 27.221 22.352 29.321 C 22.352 31.821 36.152 27.221 36.152 29.321 C 36.152 31.721 25.152 33.321 25.152 35.421 C 25.152 36.821 33.252 33.921 33.252 35.421" />
        </g>
      </svg>
    );
  }
}
