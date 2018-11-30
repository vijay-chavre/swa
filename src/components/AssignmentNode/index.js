import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Dialog from '../Shared/Dialog';
import Stopwatch from '../Shared/Glyphs/Stopwatch';
import * as Localization from '../Shared/Localization';

export default class AssignmentNode extends Component {
  static propTypes = {
    assignment: React.PropTypes.shape({
    }),
    student: React.PropTypes.shape({
    }),
    locked: React.PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      dialogMessage: '',
    };
  }

  onLockAlert = () => {
    this.setState({ showDialog: true, dialogMessage: 'You need to do the worksheets in the order as assigned. Complete the worksheets before this and then this will be unlocked.' });
  }

  onAcceptDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '' });
  }

  render() {
    const { assignment, student, locked } = this.props;
    const activityState = (assignment && assignment.state) ? assignment.state : 'initial';
    const nodeClassName = locked ? 'o-worksheetTile o-worksheetTile--assigned  o-worksheetTile--new o-worksheetTile--locked' : 'o-worksheetTile o-worksheetTile--assigned  o-worksheetTile--new';

    return (
      <div className="a-col a-col(fluid)">
        <Dialog
          show={this.state.showDialog}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
        />

        <Link className={nodeClassName} to={!locked ? `/student/${student._id}/attempt/${assignment.id}/${activityState}/preview` : undefined}>
          <button type="button" className="b-button--fullWidth" onClick={locked ? this.onLockAlert : undefined}>
            <div className="o-worksheetTile__pane">
              <div
                className="o-worksheetTile__preview"
                style={{ backgroundImage: `url(https://tapi.tabtor.com/worksheet/${assignment.worksheet_id}/thumbnail.png)`, backgroundRepeat: 'no-repeat'}}>
                <div className="o-worksheetTile__statusBtn">
                  <span className="b-button__label">
                    {activityState === 'resume' ? `${Localization.localizedStringForKey('Resume')}` : `${Localization.localizedStringForKey('Start')}`}
                  </span>
                </div>
              </div>

              <div className="o-worksheetTile__details">
                <p className="a-s(12) a-color(copy-2) o-worksheetTile__id">
                  {(assignment && assignment.meta) ? `#${assignment.meta.worksheet_number}` : ''}
                </p>
                <h1 className="a-h(20) o-worksheetTile__title">
                  {(assignment && assignment.meta) ? assignment.meta.name : ''}
                </h1>
                <p className="a-p(12) o-worksheetTile__playlist">
                  {(assignment && assignment.meta) ? assignment.playlist_name : ''}
                </p>
              </div>

            </div>

            <div className="o-worksheetTile__infoBar">
              <p className="o-worksheetTile__infoItem">
                {(assignment && assignment.meta) ? `${assignment.meta.number_of_questions} ${Localization.localizedStringForKey('Questions')}` : ''}
              </p>
              <p className="o-worksheetTile__infoItem b-indicator o-worksheetTile__timer">
                <Stopwatch />
                {(assignment && assignment.meta) ? `${moment.utc(assignment.meta.suggested_time * 1000 * 60).format('mm:ss')} (${Localization.localizedStringForKey('Suggested')})` : ''}
              </p>
            </div>
          </button>
        </Link>

      </div>
    );
  }
}
