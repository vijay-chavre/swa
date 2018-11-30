import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

class WorksheetPerformanceChart extends Component {
  static propTypes = {
    data: React.PropTypes.shape({
    }),
  }

  render() {
    const { data } = this.props;

    return (
      <BarChart
        width={1000} height={400} data={data}
        margin={{ top: 50, right: 100, left: 200, bottom: 5 }}
      >
        <XAxis padding={{ left: 10, right: 20 }} dataKey="name" label="Questions" />
        <YAxis padding={{ top: 20 }} label="Time (Sec)" />
        <Tooltip />
        <Bar dataKey="time" isAnimationActive={false}>
          {
        data.map((entry, index) => (
          <Cell fill={entry.correct === 'Y' ? '#14C81F' : '#DD0000'} />
        ))
        }
        </Bar>
      </BarChart>
    );
  }
}

export default WorksheetPerformanceChart;
