import React, { Component } from 'react';

export default class GraphPaperIcon extends Component {
  static propTypes = {
    color: React.PropTypes.string,
  }

  render() {
    const { color } = this.props;
    const iconStyle = {
      fill: color,
    };
    return (
      <svg className="a-glyph" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path style={iconStyle} d="M7 6h10V0h1v6h6v1h-6v10h6v1h-6v6h-1v-6H7v6H6v-6H0v-1h6V7H0V6h6V0h1v6zm0 1v10h10V7H7z" fill="#00E1FF" fillRule="evenodd"/>
      </svg>
    );
  }
}
