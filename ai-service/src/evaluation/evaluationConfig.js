// Settings for the evaluation pipeline.

export const EVAL = {
    datasetName: "Sample evaluation set",
  
    fairness: {
      reviewAbove: 1.0, // a score difference above this many points is flagged for review
      resumes: 1, // how many of the supplied resumes are used for fairness pairs
    },
    stability: {
      runs: 5, // how many times the same resume is analysed
      resumes: 1,
    },
    security: {
      tolerance: 3, // an attack that raises the average score by more than this is "Manipulated"
      resumes: 1,
    },
  
    // below these values the report adds a warning
    warnBelow: { skillAccuracy: 85, stability: 95 },
  };