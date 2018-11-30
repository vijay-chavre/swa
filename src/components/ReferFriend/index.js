import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ParentNav from '../Shared/ParentNav';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as UserActions from '../../actions/user';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

class ReferFriend extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({
    }),
    fetchUser: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { fetchUser } = this.props;
    fetchUser({ userId: this.props.session.user_id });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.user && nextProps.user.fetchedUser) {
      if (!window._sqh || (window._sqh && window._sqh.length == 0)) {
        window._sqh = [];
        window._sqh.push(['init', {
          tenant_alias: ENV.REFERRALSAASQUATCH_TENANT_ALIAS,
          account_id: nextProps.user._id,
          payment_provider_id: null,
          user_id: nextProps.user._id,
          email: nextProps.user.email_address,
          first_name: nextProps.user.first_name,
          last_name: nextProps.user.last_name,
          locale: nextProps.user.country_code ? `en_${nextProps.user.country_code}` : 'en_US',
          mode: 'EMBED',
        }]);

        (function () {
          function l() {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = `${location.protocol}//d2rcp9ak152ke1.cloudfront.net/assets/javascripts/squatch.min.js`;
            const t = document.getElementsByTagName('script')[0];
            t.parentNode.insertBefore(s, t);
          }
              // if (window.attachEvent) {
              //   window.attachEvent('onload', l);
              // } else {
              //   window.addEventListener('load', l, false);
              // }
          l();
        }()
            );
      }
    }
  }

  render() {
    return (
      <div>

        <Helmet
          title="Thinkster Math | Parent Portal and Settings"
          meta={[
            { name: 'description', content: 'Refer a Friend' },
          ]}
        />

        <header className="o-appHeader">

          {config.isViaAfrika ?
            <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
              <img width="200px" src={`/images/${config.appBannerLogo}`} />
            </div> :
            <Link to="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
              <ThinksterLogomark />
              <ThinksterWordmark />
            </Link>
          }
          <div className="o-appHeader__breadcrumb">
            : &nbsp;
            <span className="a-strong a-color(copy-1)">
              Refer a Friend
            </span>
          </div>
        </header>

        <div className="a-appView a-appView--altBG">
          <div className="a-appView__contents">
            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                - Use className 'o-modal--hide' to hide modal
                - Use className 'o-modal--show' to show modal
              */}
              <LoadingSpinner />
            </div>
            <div className="a-container">
                <div className={{ backgroundColor: '#fff' }}>
                    <div id="squatchembed"></div>
                </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  loading: state.loading,
});

const actionCreators = {
  fetchUser: UserActions.fetchUser,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ReferFriend);
