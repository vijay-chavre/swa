import React from 'react';
import Star from '../Shared/Glyphs/Star';

export default (props) => {
  const { count } = props;
  const stars = [];
  if (count < 10) {
    for (let i = 0; i < count; i++) {
      stars.push(<Star key={i} index={i} />);
    }
  }
  return <div className="b-stars">{stars}</div>;
};
