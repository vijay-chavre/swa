import React from 'react';
import {
  Route, IndexRoute,
} from 'react-router';
import App from '../App';
import Login from '../Login';
import PWReset from '../PWReset';
import Students from '../Students';
import Student from '../Student';
import Worksheet from '../Worksheet';
import NotFound from '../NotFound';
import ManagePlans from '../ManagePlans';
import ModifyPlan from '../ModifyPlan';
import ScribbleLayer from '../ScribbleLayer';
import ProgressMatrix from '../ProgressMatrix';
import Videos from '../Videos';
import Leaderboard from '../Leaderboard';
import WorksheetIntro from '../WorksheetIntro';
import WorksheetSummary from '../WorksheetSummary';
import PerformanceReport from '../PerformanceReport';
import GradeSelector from '../GradeSelector';
import VideoLibrary from '../VideoLibrary';
import GradeCatalog from '../VideoLibrary/GradeCatalog';
import ConceptVideo from '../VideoLibrary/ConceptVideo';
import Rewards from '../Rewards';
import WebContainer from '../Shared/WebContainer';
import Payment from '../Payment';
import AddStudent from '../AddStudent';
import CancelPlan from '../CancelPlan';
import GuestFlow from '../GuestFlow';
import MobileNav from '../Shared/MobileNav';
import ResetPassword from '../PWReset/ResetPassword';
import ReferFriend from '../ReferFriend';
import Referrals from '../Referrals';
import ThankYou from '../ThankYou';
import ContinueRegistration from '../ContinueRegistration';
import SummaryBeforePayment from '../SummaryBeforePayment';

import moment from 'moment';

import SSO from '../SSO';
import * as SessionActions from '../../actions/session';

export default (store) => {
  /**
   * Check whether token exists in session
   */
  const authRequired = (nextState, replaceState) => {
    const session = store.getState().session;
    if (session === undefined || session.token == null || session.lastLoggedInDate == null || moment().diff(session.lastLoggedInDate, 'days') > 15) {
      // Not authenticated, redirect to login.
      replaceState({ nextPathname: nextState.location.pathname + nextState.location.search }, '/login');
      store.dispatch(SessionActions.logout());
    }
  };

  const noAuth = (nextState, replaceState) => {
    const session = store.getState().session;
    if (session !== undefined && session.token !== null) {
      replaceState('/students');
    }
  };

  const removeAuth = () => {
    store.dispatch(SessionActions.logout());
  };

  return (
    <Route component={App}>

      <Route path="/" component={Students} onEnter={authRequired} />
      <Route path="/guestflow" component={GuestFlow} />
      <Route path="/students" component={Students} onEnter={authRequired} />
      <Route path="/test" component={ScribbleLayer} onEnter={authRequired} />
      <Route path="/student/:studentId" component={Student} onEnter={authRequired} />
      <Route path="/student/:studentId/progress-matrix" component={ProgressMatrix} onEnter={authRequired} />
      <Route path="/student/:studentId/videos" component={Videos} onEnter={authRequired} />
      <Route path="/student/:studentId/leaderboard" component={Leaderboard} onEnter={authRequired} />
      <Route path="/student/:studentId/rewards" component={Rewards} onEnter={authRequired} />
      <Route path="/student/:studentId/attempt/:assignmentId/:activityState/preview" component={WorksheetIntro} onEnter={authRequired} />
      <Route path="/student/:studentId/:assignmentId/summary" component={WorksheetSummary} onEnter={authRequired} />
      <Route path="/student/:studentId/:assignmentId/:activityState/summary/:questionNumber" component={Worksheet} onEnter={authRequired} />
      <Route path="/student/:studentId/attempt/:assignmentId/:activityState" component={Worksheet} onEnter={authRequired} />
      <Route path="/login" component={Login} onEnter={noAuth} />
      <Route path="/sso" component={SSO} onEnter={removeAuth} />
      <Route path="/reset" component={PWReset} />
      <Route path="/resetpassword" component={ResetPassword} />
      <Route path="/plans" component={ManagePlans} onEnter={authRequired} />
      <Route path=":studentId/cancel" component={CancelPlan} onEnter={authRequired} />
      <Route path=":parentId/addstudent" component={AddStudent} onEnter={authRequired} />
      <Route path=":parentId/addstudent/:continuous" component={AddStudent} onEnter={authRequired} />
      <Route path="/payment/:ver" component={Payment} />
      <Route path="/modify-plan/:studentId" component={ModifyPlan} onEnter={authRequired} />
      <Route path="/add-student" component={AddStudent} />
      <Route path="/student/:studentId/video-library" component={VideoLibrary} onEnter={authRequired} />
      <Route path="/student/:studentId/video-library/:grade" component={GradeCatalog} onEnter={authRequired} />
      <Route path="/student/:studentId/performance-report/:submissionId" component={PerformanceReport} />
      <Route path="/student/:studentId/navigate/:type" component={WebContainer} />
      <Route path="/student/:studentId/mobile-nav" component={MobileNav} />
      <Route path="/refer-a-friend" component={ReferFriend} onEnter={authRequired} />
      <Route path="/referrals" component={Referrals} onEnter={authRequired} />
      <Route path="/thank-you" component={ThankYou} onEnter={authRequired} />
      <Route path="/summarybeforepayment" component={SummaryBeforePayment} onEnter={authRequired} />
      <Route path="/continue-registration" component={ContinueRegistration} onEnter={authRequired} />
      <Route path="*" component={NotFound} />
    </Route>
  );
};
