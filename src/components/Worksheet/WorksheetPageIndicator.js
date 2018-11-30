import React, { Component } from 'react';

class WorksheetPageIndicator extends Component {
  static propTypes = {
    params: React.PropTypes.shape({
    }),
    pageNumber: React.PropTypes.number,
    isCurrentPage: React.PropTypes.bool,
    onSelectQuestion: React.PropTypes.func,
    dotColor: React.PropTypes.string,
    numberColor: React.PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = { showToolTip: false };
  }

  render() {
    const { pageNumber, isCurrentPage, dotColor, numberColor } = this.props;
    return (
      <span
        className="o-worksheetNavigator__page"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => { this.setState({ showToolTip: true }); }}
        onMouseLeave={() => { this.setState({ showToolTip: false }); }}
        onClick={() => this.props.onSelectQuestion(pageNumber)}
      >
        {this.state.showToolTip || isCurrentPage ? <span className="o-worksheetNavigator__pageNum" style={{ color: numberColor }}>{pageNumber}</span> : <span className="o-worksheetNavigator__pageMarker" style={{ background: dotColor }}> </span>}
      </span>
    );
  }
}

export default WorksheetPageIndicator;
