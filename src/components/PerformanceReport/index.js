import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import StudentHeader from '../StudentHeader';
import WorksheetPerformanceChart from '../Worksheet/WorksheetPerformanceChart';
import StudentNav from '../Shared/StudentNav';
import { fetchProficiencyMatrix } from '../../actions/proficiencyMatrix';
import Topic from './Topic';
import { fetchSubmission } from '../../actions/submission';
import config from '../../constants/config';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';
import { workflowCompleted } from '../../actions/studentWorkflow';

class ProgressMatrix extends Component {

  static propTypes = {
    fetchProficiencyMatrix: React.PropTypes.func,
    fetchSubmission: React.PropTypes.func,
    workflowCompleted: React.PropTypes.func,
    student: React.PropTypes.shape({
      _id: React.PropTypes.string,
      assessment_grade: React.PropTypes.string,
    }),
    proficiencyMatrix: React.PropTypes.arrayOf(React.PropTypes.shape),
    params: React.PropTypes.shape({
      submissionId: React.PropTypes.string,
    }),
    submissions: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      selected_grade: props.student.assessment_grade,
      submissionId: null,
      totalQuestions: 0,
      correctQuestions: 0,
      incorrectQuestions: 0,
      skippedQuestions: 0,
      timeTaken: '00:00',
      performanceData: [],
      grade: props.student.assessment_grade,
      showPerformanceChart: false,
    };
  }

  componentDidMount() {
    const { student } = this.props;
    this.setState({ submissionId: this.props.params.submissionId }, () => {
      this.props.fetchSubmission({
        studentId: student._id,
        submissionId: this.state.submissionId,
      });
      const grade = student.locale_code === 'ZA' && student.assessment_grade === 'K' ? 'R' : student.assessment_grade;
      this.setState({ grade });
      this.fetchMatrix(grade);
    });

    const workflow = {};
    workflow.key = `proficiency_matrix_viewed_${student._id}`;
    workflow.value = true;
    this.props.workflowCompleted(workflow);
  }

  getGetOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return <span>{n}<sup>{(s[(v - 20) % 10] || s[v] || s[0])}</sup></span>;
  }

  initialize = (submission) => {
    if (submission) {
      this.state.totalQuestions = parseInt(submission.total_score, 10);
      this.state.correctQuestions = parseInt(submission.score_achieved, 10);

      let skippedQuestion = 0;
      this.state.performanceData = [];
      submission.answers.Questions.forEach((q) => {
        if (q.Skipped === 'Y') {
          skippedQuestion += 1;
        }
        let isCorrect = 'N';
        if (q.Skipped === 'N') {
          if (q.Correct === 'Y') {
            isCorrect = q.Correct;
          }
        }
        if (q.TimeTaken !== 0) {
          this.state.showPerformanceChart = true;
        }
        const data = { name: q.Number, time: q.TimeTaken, correct: isCorrect };
        this.state.performanceData.push(data);
      });

      if (submission.time_taken) {
        this.state.timeTaken = moment.utc(submission.time_taken * 1000).format(`${submission.time_taken > 3600 ? 'HH.mm.ss' : 'mm:ss' }`);
      }
      this.state.skippedQuestions = skippedQuestion;
      // skipped questions are marked as incorrect
      this.state.incorrectQuestions = (this.state.totalQuestions - this.state.correctQuestions);
    }
  }

  fetchMatrix(grade) {
    const { student } = this.props;
    this.props.fetchProficiencyMatrix({ studentId: student._id, grade, locale: student.locale_code || '' });
  }

  gradeLabel = (grade) => {
    if (grade && grade.toLowerCase() === 'k') {
      if (config.isViaAfrika) {
        return 'R';
      } else {
        return grade;
      }
    }
    return this.getGetOrdinal(grade);
  }

  render() {
    const { proficiencyMatrix, student, submissions } = this.props;
    this.submission = submissions[this.state.submissionId];
    this.initialize(this.submission);
    
    return (
      <div>

        <StudentHeader currentNavigation={'Performance Report'} />
        <StudentNav />
        <div className="a-appView a-appView--hasSidebar">
          <div className="a-appView__contents">
            <div className="a-container a-container__intro b-section">
              <h2 className="a-h(28) b-section__title">
                {student.first_name}&rsquo;s Performance Report
              </h2>
              <section className="o-perfReport__summary b-section">
                <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue">
                    { this.state.totalQuestions }
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    Total Questions
                  </span>
                </div>

                <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue a-color(active-3)">
                    { this.state.correctQuestions }
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    Correct Questions
                  </span>
                </div>

                <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue a-color(alert)">
                    { this.state.incorrectQuestions }
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    Incorrect Questions
                  </span>
                </div>
                <div className="o-perfReport__summaryScore">
                  <span className="o-perfReport__summaryValue">
                    { this.state.timeTaken }
                  </span>
                  <span className="o-perfReport__summaryLabel">
                    Total Time
                  </span>
                </div>
              </section>
              <section className="o-perfReport__barChart b-section">
                {this.state.showPerformanceChart ? <WorksheetPerformanceChart data={this.state.performanceData} />
                : <span className="o-perfReport__summaryLabel">
                    Performance Data Not Available
                  </span>
                }
              </section>

              <section className="o-perfReport__matrix b-section">
                <h2 className="a-h(28) a-justify(center) b-section__title">
                  {student.first_name}&rsquo;s {this.gradeLabel(this.state.grade)} Grade Progress Report
                </h2>
                <div className="o-progressMatrix__keys">
                  <div className="o-progressMatrix__key o-progressMatrix__key--high">
                    100% &ndash; 91%
                  </div>
                  <div className="o-progressMatrix__key o-progressMatrix__key--medium">
                    90% &ndash; 61%
                  </div>
                  <div className="o-progressMatrix__key o-progressMatrix__key--mediumLow">
                    60% &ndash; 31%
                  </div>
                  <div className="o-progressMatrix__key o-progressMatrix__key--low">
                    30% &ndash; 0%
                  </div>
                  <div className="o-progressMatrix__key">
                    Not Tested
                  </div>
                </div>
                {proficiencyMatrix && proficiencyMatrix.map((topic) => <Topic key={topic.topic_id} topic={topic} />)}
              </section>
              {(!config.isViaAfrika && Common.authorized(student, features.ACADEMIC_ADVISOR_CTA)) ?
                <section className="a-container a-container__intro b-section">

                  <h3 className="a-h(22) a-strong">
                    Your next step is to schedule a call with one of the academic advisors.
                  </h3>

                  <p className="b-section__actions b-section__actions--useFlex">
                    <a href="https://try.hellothinkster.com/thinkster-advisor-call/" className="b-flatBtn b-flatBtn--large" target="_blank">
                      <span className="b-button__label">
                        Schedule a Call
                      </span>
                    </a>
                  </p>

                  <h3 className="a-h(22) a-strong a-break a-break--before">
                    What happens in this call?
                  </h3>

                  <ul className="a-row">
                    <li className="a-col a-col(1-4) a-break a-break--after">
                      <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44)">
                        1
                      </p>
                      <p className="a-p(16)">
                        Discuss the results of the Skills Assessment.
                      </p>
                    </li>
                    <li className="a-col a-col(1-4) a-break a-break--after">
                      <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44) b-circleBox--color(active-2)">
                        2
                      </p>
                      <p className="a-p(16)">
                        Go over the features of our app to help your child get acclimated.
                      </p>
                    </li>
                    <li className="a-col a-col(1-4) a-break a-break--after">
                      <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44) b-circleBox--color(active-3)">
                        3
                      </p>
                      <p className="a-p(16)">
                        Learn about your child’s needs and help you select the right program.
                      </p>
                    </li>
                    <li className="a-col a-col(1-4) a-break a-break--after">
                      <p className="b-circleBox b-circleBox--bordered b-circleBox--size(44) b-circleBox--color(active-4)">
                        4
                      </p>
                      <p className="a-p(16)">
                        Share best practices to achieve success with the program.
                      </p>
                    </li>
                  </ul>

                  <p className="a-p(16)">
                    The call will help us better understand your child&rsquo;s needs and goals so that we can pair your child with the right Thinkster coach. Our goal is to make sure you get a complete experience of Thinkster Math.
                  </p>

                </section> : ''
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  proficiencyMatrix: state.proficiencyMatrix[state.student._id] ? state.proficiencyMatrix[state.student._id].masterydetail : null,
  submissions: state.submissions,
});

const actionCreators = {
  fetchProficiencyMatrix,
  fetchSubmission,
  workflowCompleted,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ProgressMatrix);
