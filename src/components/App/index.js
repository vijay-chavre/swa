import React, { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'react-helmet';
import config from '../../constants/config';

class App extends Component {
  render() {
    const { children } = this.props;

    return (
      <div className="app">
        <Head
          link={[
            { href: config.favIcon, rel: 'icon', type: 'image/x-icon' },
          ]}
          title={config.appName}
          meta={[
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          ]}
        />
        <div className="app__contents">
          {children}
        </div>

      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  session: state.session,
  loading: state.loading,
});

export default connect(
  mapStateToProps,
)(App);
