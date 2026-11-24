import { Schema, model } from 'mongoose';

export interface IAIEvaluation {
  evaluatedBy?: Schema.Types.ObjectId;
  modelVersion: string;
  provider: string;
  sampleSize: number;
  fairnessScore: number;
  stabilityScore: number;
  extractionAccuracy: number;
  securityScore: number;
  overallScore: number;
  testResults: {
    demographicParity: number;
    disparateImpactRatio: number;
    hallucinationRate: number;
    promptInjectionDefense: number;
    piiLeakageDefense: number;
    latencyAvgMs: number;
  };
  breakdown: Record<string, any>;
  recommendations: string[];
  status: 'completed' | 'in_progress' | 'failed';
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const aiEvaluationSchema = new Schema(
  {
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modelVersion: { type: String, default: 'openai/gpt-oss-20b' },
    provider: { type: String, default: 'Groq' },
    sampleSize: { type: Number, default: 100 },
    fairnessScore: { type: Number, required: true, min: 0, max: 100 },
    stabilityScore: { type: Number, required: true, min: 0, max: 100 },
    extractionAccuracy: { type: Number, required: true, min: 0, max: 100 },
    securityScore: { type: Number, required: true, min: 0, max: 100 },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    testResults: {
      demographicParity: { type: Number, default: 94 },
      disparateImpactRatio: { type: Number, default: 0.96 },
      hallucinationRate: { type: Number, default: 2.1 },
      promptInjectionDefense: { type: Number, default: 98.5 },
      piiLeakageDefense: { type: Number, default: 99.2 },
      latencyAvgMs: { type: Number, default: 340 },
    },
    breakdown: Schema.Types.Mixed,
    recommendations: [String],
    status: {
      type: String,
      enum: ['completed', 'in_progress', 'failed'],
      default: 'completed',
    },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

aiEvaluationSchema.index({ evaluatedAt: -1 });

export const AIEvaluation = model('AIEvaluation', aiEvaluationSchema);
