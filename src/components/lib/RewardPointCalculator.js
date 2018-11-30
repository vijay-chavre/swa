
const performanceConfiguration = {
  default_configuration: {
    reward_configuration: {
      penalty_multiplier: 1,
      base_points: 120,
      perfection_points: 40,
      speed_bonus: {
        speed_grace_max: 50,
        speed_grace_value_max: 30,
      },
      accuracy_point_zone: {
        accuracy_threshold: 80,
        point_multiplier: 2,
      },
    },
    score_configuration: {
      penalty_multiplier: 0,
    },
    accuracy_grade_configuration: {
      50: 'E',
      60: 'D',
      70: 'C',
      80: 'B',
      90: 'A',
    },
    time_grade_configuration: {
      100: 'A',
      125: 'B',
      150: 'C',
      200: 'D',
      250: 'E',
    },
    combined_grade_configuration: {
      AA: 'A',
      AB: 'A',
      AC: 'A',
      AD: 'B ',
      AE: 'B',
      BA: 'A',
      BB: 'A',
      BC: 'B',
      BD: 'B',
      BE: 'B',
      CA: 'C',
      CB: 'C',
      CC: 'C',
      CD: 'D',
      CE: 'D',
      DA: 'D',
      DB: 'D',
      DC: 'D',
      DD: 'D',
      DE: 'D',
      EA: 'E',
      EB: 'E ',
      EC: 'E ',
      ED: 'E',
      EE: 'E',
    },
  },

  totalRewardPoint: 0,
  basicRewardPoint: 0,
  speedBonusPoint: 0,
  accuracyBonusPoint: 0,
  perfectionPoint: 0,
  penaltyPoints: 0,
};

const response = {
  basicRewardPoint: 0,
  accuracyBonusPoint: 0,
  perfectionPoint: 0,
  speedBonusPoint: 0,
  totalRewardPoint: 0,
  penaltyPoints: 0,
  grade: '',
  timeGrade: 'E',
  numberOfCorerctQuesAboveAccuracyThreshold: 0,

};
function calculateSpeedBonusPoint(totalrewardPoints, timeTaken, suggestedTime) {
  const rewardPointDict = performanceConfiguration.default_configuration;
  let speedBonusPoints = 0.0;
  const attemptTime = timeTaken;
  // Calculate Rewards
  let speedBonusAsPercentageFactor = 0;
  const actualPercentageAchieved = Math.round((attemptTime / suggestedTime) * 100);
  const speedGrace = rewardPointDict.reward_configuration.speed_bonus.speed_grace_max;
  const speedGraceValue = rewardPointDict.reward_configuration.speed_bonus.speed_grace_value_max;

  if (actualPercentageAchieved <= 100) {
    speedBonusAsPercentageFactor = speedGraceValue;
  } else {
    const maxLimitWithGrace = 100 + speedGrace;
    if (actualPercentageAchieved <= maxLimitWithGrace) {
      const differentialValue = maxLimitWithGrace - actualPercentageAchieved;
      speedBonusAsPercentageFactor = ((speedGrace - differentialValue) * speedGraceValue) / speedGrace;
    }
  }

  speedBonusPoints = Math.round((totalrewardPoints * (speedBonusAsPercentageFactor / 100.0)));
  return speedBonusPoints;
}

function calculateBasicRewardPoint(numberOfQuestion, numberOfCorerctQuestion, numberOfInCorrectQuestion, numberOfCorerctQuestionInSecondAttempt, timeTaken, suggestedTime, basePoints) {
  const rewardPointDict = performanceConfiguration.default_configuration;
  let pointsPerQuestion = 0;
  let percentOfCorrectQuestions = 0;
  let totalPointForWorksheet = rewardPointDict.reward_configuration.base_points;
  if (basePoints && basePoints > 0) {
    totalPointForWorksheet = basePoints;
  }
  pointsPerQuestion = totalPointForWorksheet / numberOfQuestion;
  const superScorerMultiplier = rewardPointDict.reward_configuration.accuracy_point_zone.point_multiplier;
  const penaltyMultiplier = rewardPointDict.reward_configuration.penalty_multiplier;
  const bonusAcuracyThreshold = rewardPointDict.reward_configuration.accuracy_point_zone.accuracy_threshold;
  const totalAchieverBonus = Math.round(totalPointForWorksheet / 3.0);
  percentOfCorrectQuestions = Math.round((numberOfCorerctQuestion / numberOfQuestion) * 100.0);
  var numberOfCorerctQuesAboveAccuracyThreshold = 0;
  if (percentOfCorrectQuestions >= bonusAcuracyThreshold) {
    //calculate
    const minimumCorrectQuesAboveAccuracyThreshold = Math.round(((bonusAcuracyThreshold * numberOfQuestion) / 100.0))
    numberOfCorerctQuesAboveAccuracyThreshold = (numberOfCorerctQuestion + numberOfInCorrectQuestion) - minimumCorrectQuesAboveAccuracyThreshold;
  }
  var basicPoint = Math.round((numberOfCorerctQuestion * pointsPerQuestion) + (numberOfCorerctQuestionInSecondAttempt * pointsPerQuestion));
  var penaltyPoint = numberOfCorerctQuestionInSecondAttempt * pointsPerQuestion * penaltyMultiplier;
  var tripplePoint = Math.round(numberOfCorerctQuesAboveAccuracyThreshold * pointsPerQuestion * superScorerMultiplier);
  var pointsForHundreadPercent = 0.0;
  if (percentOfCorrectQuestions >= 100.0) {
    pointsForHundreadPercent = totalAchieverBonus;
  }
  var totalPoints = (basicPoint + tripplePoint + pointsForHundreadPercent - penaltyPoint);
  // console.log("totl reward bfore bonus" + totalPoints);
  var speedBonusPoint = calculateSpeedBonusPoint(totalPoints, timeTaken, suggestedTime * 60);
  var totalRewardPoints = basicPoint
    + tripplePoint
    + pointsForHundreadPercent
    + speedBonusPoint
    - penaltyPoint;
    // setting global variable
  response.basicRewardPoint = basicPoint;
  response.accuracyBonusPoint = tripplePoint;
  response.penaltyPoints = penaltyPoint;
  response.perfectionPoint = pointsForHundreadPercent;
  response.numberOfCorerctQuesAboveAccuracyThreshold = numberOfCorerctQuesAboveAccuracyThreshold;
  response.speedBonusPoint = speedBonusPoint;
  response.totalRewardPoint = totalRewardPoints;
  return totalRewardPoints;
}

function calculateScoreGrade(numberOfQuestion, numberOfCorerctQuestion) {
  const rewardPointDict = performanceConfiguration.default_configuration;
  const accuracyGradeDict = rewardPointDict.accuracy_grade_configuration;
  const scoreAchievedInPercent = Math.round((numberOfCorerctQuestion / numberOfQuestion) * 100.0);
  const accuracyGradeKeyArray = Object.keys(accuracyGradeDict);
  accuracyGradeKeyArray.reverse();
  let scoreGrade = 'E';
  for (let i = 0; i < accuracyGradeKeyArray.length; i++) {
    if (scoreAchievedInPercent >= accuracyGradeKeyArray[i]) {
      const ii = accuracyGradeKeyArray[i];
      scoreGrade = accuracyGradeDict[ii][0];
      break;
    }
  }
  return scoreGrade;
}
function calculateTimeGrade(timeTaken, suggestedTime) {
  const rewardPointDict = performanceConfiguration.default_configuration;
  const timeGradeDict = rewardPointDict.time_grade_configuration;
  const timeTakenInPercentage = (timeTaken / (suggestedTime * 60)) * 100.0;
  const timeGradeKeyArray = Object.keys(timeGradeDict);
  // timeGradeKeyArray.reverse();
  let timeGrade = 'E';
  for (let i = 0; i < timeGradeKeyArray.length; i++) {
    if (timeTakenInPercentage <= timeGradeKeyArray[i]) {
      const timeGardeKey = timeGradeKeyArray[i];
      timeGrade = timeGradeDict[timeGardeKey][0];
      // console.log("ss=" + timeGrade);
      break;
    }
  }
  return timeGrade;
}

function calculateCombinedGrade(numberOfQuestion, numberOfCorerctQuestion, timeTaken, suggestedTime) {
  const rewardPointDict = performanceConfiguration.default_configuration;
  const scoreGrade = calculateScoreGrade(numberOfQuestion, numberOfCorerctQuestion);
  const timeGrade = calculateTimeGrade(timeTaken, suggestedTime);

  let combinedGradeValue = 'E';
  const combinedGradeKey = scoreGrade.concat(timeGrade);
  const combinedGradeDict = rewardPointDict.combined_grade_configuration;
  combinedGradeValue = combinedGradeDict[combinedGradeKey][0];

  response.timeGrade = timeGrade;
  response.grade = combinedGradeValue;
  return combinedGradeValue;
}

export default function calculateRewardPoint(numberOfQuestion, numberOfCorerctQuestion, numberOfInCorrectQuestion, numberOfCorerctQuestionInSecondAttempt, timeTaken, suggestedTime, basePoints) {
  calculateBasicRewardPoint(numberOfQuestion, numberOfCorerctQuestion, numberOfInCorrectQuestion, numberOfCorerctQuestionInSecondAttempt, timeTaken, suggestedTime, basePoints);
  calculateCombinedGrade(numberOfQuestion, numberOfCorerctQuestion, timeTaken, suggestedTime);
  return response;
}

