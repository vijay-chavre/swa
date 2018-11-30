import React, { Component } from 'react';
import * as Localization from '../Shared/Localization';

export default class Dialog extends Component {
  static propTypes = {
    show: React.PropTypes.bool,
    message: React.PropTypes.string,
    htmlBody: React.PropTypes.object,
    onAccept: React.PropTypes.func,
    acceptButtonLabel: React.PropTypes.string,
    cancelButtonLabel: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    noButtons: React.PropTypes.bool,
  }

  render() {
    const { show, message, htmlBody, onAccept, acceptButtonLabel, cancelButtonLabel, onCancel, noButtons } = this.props;
    const className = show ? 'o-modal--show' : 'o-modal--hide';

    return (
      <div className={`o-modal ${className}`}>
        {/* Dialog notification
          - Use className 'o-modal--hide' to hide modal
          - Use className 'o-modal--show' to show modal
        */}

        <div className="o-modal__box o-modal__box--dialog">

          <p className="a-p(14)">
            {message ? message : (htmlBody ? htmlBody : "")}
          </p>

          <div className="o-modal__actions">
            { !noButtons && cancelButtonLabel ?
              <button onClick={onCancel} type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(140)" style={{ marginRight: 40 }}>
                <span className="b-button__label">
                  { Localization.localizedStringForKey(cancelButtonLabel) }
                </span>
              </button>
              : ''
            }
            { !noButtons ?
              <button onClick={onAccept} type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(140)">
                <span className="b-button__label">
                  { acceptButtonLabel ? `${Localization.localizedStringForKey(acceptButtonLabel)}` : 'OK' }
                </span>
              </button>
              : ''
            }
          </div>
        </div>
      </div>
    );
  }
}
