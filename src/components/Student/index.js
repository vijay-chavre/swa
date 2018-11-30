import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Helmet from 'react-helmet';
import StudentTimeline from '../StudentTimeline';
import * as Common from '../Shared/Common';
import { fetchProductTimeline } from '../../actions/product';
import { fetchStudent } from '../../actions/student';
import ProductTimeline from '../ProductTimeline';

class Student extends Component {
  static propTypes = {
    fetchProductTimeline: React.PropTypes.func,
    fetchStudent: React.PropTypes.func,
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    session: React.PropTypes.shape({
    }),
    params: React.PropTypes.shape({
      studentId: React.PropTypes.string,
    }),

  }

  componentDidMount() {
    const { student, user } = this.props;

    Raven.setUserContext({ id: this.props.params.studentId });
    // checking for student to see if sync is required
    if (student && !student.doNotSync) {
      if (Common.isPurchaseIdOfProduct(this.props.params.studentId, user)) {
        this.props.fetchProductTimeline({ id: this.props.params.studentId });
      } else {
        this.props.fetchStudent({ studentId: this.props.params.studentId });
      }
    } else {
      student.doNotSync = false;
    }
    const intercomProp = Common.userIntercomProp(user);

    if (Common.isGuest(user)) {
      window.Intercom('shutdown');
    } else {
      if (Common.showChatBot(user)) {
        intercomProp.hide_default_launcher = false;
        window.Intercom('boot', intercomProp);
      } else {
        intercomProp.hide_default_launcher = true;
        window.Intercom('update', intercomProp);
      }
    }

    dataLayer.push([{
      uid: this.props.session.user_id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'viewContent',
      contentType: 'Worksheets',
    }]);
    Raven.captureBreadcrumb({
      message: 'Worksheets',
      category: 'attempt',
      data: {
        studentId: this.props.params.studentId,
      },
    });
  }

  render() {
    const { user, student, session } = this.props;
    return (
       (Common.isPurchaseIdOfProduct(this.props.params.studentId, user)) ?
         <div>
           <ProductTimeline session={session} product={student} />
         </div>
        :
         <div>
           <Helmet
             title="Students and Workbooks Selection | Thinkster Math"
             meta={[
               { name: 'description', content: 'Choose a student, workbook, or parent settings to begin. Modification available in parent settings.' },
             ]}
           />
           <StudentTimeline session={session} student={student} />
         </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  student: state.student,
});

const actionCreators = {
  fetchProductTimeline,
  fetchStudent,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Student);
