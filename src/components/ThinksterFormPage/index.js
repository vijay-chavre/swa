import React, { Component } from 'react';

type Props = {
  leftItem: ?React$Element,
  mainItem: React$Element,
  addendum: ?React$Element,
  meta: {
    error: string,
    touched: boolean,
    // warning: string,
  },
  title: string
};

export default class ThinksterFormPage extends Component {
  props: Props;

  render() {
    const {
      leftItem,
      rightItem,
      mainItem,
      addendum,
      title
    } = this.props;

    return (
      <div>
        {mainItem}
      </div>
    );
  }
}
