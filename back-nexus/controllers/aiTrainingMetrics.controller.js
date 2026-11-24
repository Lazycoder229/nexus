import { getPredictionModelStatus, predictNextSemesterEnrollment } from "../services/predictionModel.service.js";
import { readEnrollmentTrainingDataset } from "../services/enrollmentDataset.service.js";

export const getTrainingMetrics = async (_req, res) => {
  try {
    const training = await getPredictionModelStatus();
    let prediction = null;
    let predictionError = null;
    if (training.active) {
      try {
        prediction = await predictNextSemesterEnrollment();
      } catch (error) {
        predictionError = "The saved model could not produce a prediction. Retrain it to replace the saved weights.";
        console.error("Could not generate semester enrollment prediction:", error);
      }
    }
    let dataset = null;
    try {
      dataset = await readEnrollmentTrainingDataset();
    } catch (error) {
      console.warn("Could not read the enrollment training dataset file:", error.message);
    }
    res.json({
      success: true,
      ...training,
      epochs: training.runs[0]?.epochs || [],
      prediction,
      predictionError,
      datasetSummary: dataset ? {
        sampleCount: dataset.sample_count,
        actualSamples: dataset.actual_sample_count,
        syntheticSamples: dataset.synthetic_sample_count,
        syntheticStudentRecords: dataset.synthetic_student_record_count,
        syntheticPattern: dataset.synthetic_pattern,
      } : null,
      datasetFile: "back-nexus/data/enrollment_training_dataset.json",
    });
  } catch (error) {
    console.error("Could not load AI training metrics:", error);
    res.status(500).json({ success: false, message: error.message || "Could not load prediction model status." });
  }
};
