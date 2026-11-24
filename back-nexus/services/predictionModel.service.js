import * as tf from "@tensorflow/tfjs";
import db from "../config/db.js";

let activeModel = null;
let trainingPromise = null;
let schemaReady;

const ensureSchema = () => {
  if (!schemaReady) {
    schemaReady = db.query(`
      CREATE TABLE IF NOT EXISTS prediction_model_state (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        model_topology LONGTEXT NOT NULL,
        weight_specs LONGTEXT NOT NULL,
        weight_data LONGTEXT NOT NULL,
        sample_count INT UNSIGNED NOT NULL,
        trained_at DATETIME NOT NULL,
        training_runs LONGTEXT NOT NULL
      )
    `).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
};

const readStoredModel = async () => {
  await ensureSchema();
  const [rows] = await db.query("SELECT * FROM prediction_model_state WHERE id = 1");
  return rows[0] || null;
};

const parseRuns = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const solveLinearSystem = (matrix, values) => {
  const rows = matrix.map((row, index) => [...row, values[index]]);
  const size = rows.length;
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column] || 1e-10;
    for (let cell = column; cell <= size; cell += 1) rows[column][cell] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let cell = column; cell <= size; cell += 1) rows[row][cell] -= factor * rows[column][cell];
    }
  }
  return rows.map((row) => row[size]);
};

const makeProgramFeatures = (periodProgress, programIndex, programCount) => {
  const features = Array(programCount * 2).fill(0);
  features[programIndex] = 1;
  features[programCount + programIndex] = periodProgress;
  return features;
};

const saveModelArtifacts = async (artifacts, {
  samples,
  epochs,
  startedAt,
  lastPeriod,
  lastPeriodIndex,
  maxCount,
  syntheticSampleCount,
  syntheticStudentRecordCount,
  programs,
}) => {
  const previous = await readStoredModel();
  const runs = parseRuns(previous?.training_runs);
  const run = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    model: "Semester enrollment forecast by program (TensorFlow.js dense regression)",
    scope: "Academic semesters",
    target: "semester_enrollment_count_by_program",
    lastPeriod,
    lastPeriodIndex,
    maxCount,
    programs,
    samples,
    syntheticSamples: syntheticSampleCount,
    syntheticStudentRecords: syntheticStudentRecordCount,
    startedAt,
    completedAt: new Date().toISOString(),
    status: "completed",
    epochs,
  };
  runs.unshift(run);
  const keptRuns = runs.slice(0, 20);
  const weightBytes = Array.isArray(artifacts.weightData)
    ? Buffer.concat(artifacts.weightData.map((part) => Buffer.from(new Uint8Array(part))))
    : Buffer.from(new Uint8Array(artifacts.weightData));
  const topologyJson = JSON.stringify(artifacts.modelTopology);
  const specsJson = JSON.stringify(artifacts.weightSpecs);
  const now = new Date();
  const trainedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  await db.query(
    `INSERT INTO prediction_model_state
      (id, model_topology, weight_specs, weight_data, sample_count, trained_at, training_runs)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      model_topology = VALUES(model_topology),
      weight_specs = VALUES(weight_specs),
      weight_data = VALUES(weight_data),
      sample_count = VALUES(sample_count),
      trained_at = VALUES(trained_at),
      training_runs = VALUES(training_runs)`,
    [
      topologyJson,
      specsJson,
      weightBytes.toString("base64"),
      samples,
      trainedAt,
      JSON.stringify(keptRuns),
    ],
  );

  return {
    modelArtifactsInfo: {
      dateSaved: now,
      modelTopologyType: "JSON",
      modelTopologyBytes: Buffer.byteLength(topologyJson),
      weightSpecsBytes: Buffer.byteLength(specsJson),
      weightDataBytes: weightBytes.byteLength,
    },
  };
};

export const trainEnrollmentPredictionModel = async (series, {
  syntheticSampleCount = 0,
  syntheticStudentRecordCount = 0,
} = {}) => {
  if (trainingPromise) throw new Error("A prediction model training run is already in progress.");
  if (!Array.isArray(series) || series.length < 2 || new Set(series.map((row) => row.period_index)).size < 2) {
    throw new Error("At least two academic semesters of program enrollment records are required to train the prediction model.");
  }

  trainingPromise = (async () => {
    const yValues = series.map((point) => Number(point.enrollment_count || 0));
    const programs = [...new Set(series.map((row) => row.program))];
    const programIndex = new Map(programs.map((program, index) => [program, index]));
    const maxPeriodIndex = Math.max(...series.map((point) => Number(point.period_index || 0)), 1);
    const maxCount = Math.max(...yValues, 1);
    const features = series.map((point) => makeProgramFeatures(
      Number(point.period_index || 0) / maxPeriodIndex,
      programIndex.get(point.program),
      programs.length,
    ));
    const normalizedY = yValues.map((value) => value / maxCount);
    const featureCount = programs.length * 2;
    const xTensor = tf.tensor2d(features, [features.length, featureCount]);
    const yTensor = tf.tensor2d(normalizedY.map((value) => [value]), [normalizedY.length, 1]);
    const model = tf.sequential();
    const epochHistory = [];
    model.add(tf.layers.dense({ units: 1, inputShape: [featureCount] }));
    model.compile({ loss: "meanSquaredError", optimizer: tf.train.adam(0.01), metrics: ["mae"] });
    const normalMatrix = Array.from({ length: featureCount }, () => Array(featureCount).fill(0));
    const normalValues = Array(featureCount).fill(0);
    features.forEach((row, sampleIndex) => {
      for (let left = 0; left < featureCount; left += 1) {
        normalValues[left] += row[left] * normalizedY[sampleIndex];
        for (let right = 0; right < featureCount; right += 1) {
          normalMatrix[left][right] += row[left] * row[right];
        }
      }
    });
    const initialWeights = solveLinearSystem(normalMatrix, normalValues);
    const kernel = tf.tensor2d(initialWeights.map((weight) => [weight]), [featureCount, 1]);
    const bias = tf.tensor1d([0]);
    model.layers[0].setWeights([kernel, bias]);
    kernel.dispose();
    bias.dispose();
    const startedAt = new Date().toISOString();

    try {
      await model.fit(xTensor, yTensor, {
        epochs: Math.min(250, 100 + series.length * 10),
        verbose: 0,
        callbacks: {
          onEpochEnd: async (epoch, logs = {}) => {
            epochHistory.push({
              epoch: epoch + 1,
              loss: Number.isFinite(Number(logs.loss)) ? Number(logs.loss) * maxCount ** 2 : null,
              mae: Number.isFinite(Number(logs.mae)) ? Number(logs.mae) * maxCount : null,
            });
          },
        },
      });

      await model.save({
        save: (artifacts) => saveModelArtifacts(artifacts, {
          samples: series.length,
          epochs: epochHistory,
          startedAt,
          lastPeriod: {
            academic_year: series[series.length - 1].academic_year || null,
            semester: series[series.length - 1].semester || null,
            period_label: series[series.length - 1].period_label || null,
          },
          lastPeriodIndex: maxPeriodIndex,
          maxCount,
          syntheticSampleCount,
          syntheticStudentRecordCount,
          programs,
        }),
      });

      activeModel?.dispose();
      activeModel = model;
      return { samples: series.length, epochs: epochHistory, trainedAt: new Date().toISOString() };
    } catch (error) {
      model.dispose();
      throw error;
    } finally {
      xTensor.dispose();
      yTensor.dispose();
    }
  })();

  try {
    return await trainingPromise;
  } finally {
    trainingPromise = null;
  }
};

const getActiveModel = async () => {
  if (activeModel) return activeModel;
  const stored = await readStoredModel();
  if (!stored) return null;
  const latestRun = parseRuns(stored.training_runs)[0];
  if (latestRun?.target !== "semester_enrollment_count_by_program") return null;
  const weightBuffer = Buffer.from(stored.weight_data, "base64");
  const weightData = weightBuffer.buffer.slice(
    weightBuffer.byteOffset,
    weightBuffer.byteOffset + weightBuffer.byteLength,
  );
  activeModel = await tf.loadLayersModel({
    load: async () => ({
      modelTopology: JSON.parse(stored.model_topology),
      weightSpecs: JSON.parse(stored.weight_specs),
      weightData,
    }),
  });
  return activeModel;
};

export const predictNextSemesterEnrollment = async () => {
  const stored = await readStoredModel();
  const latestRun = parseRuns(stored?.training_runs)[0];
  if (!stored || latestRun?.target !== "semester_enrollment_count_by_program" || !latestRun.lastPeriod) return null;
  const model = await getActiveModel();
  if (!model) return null;
  const programs = latestRun.programs || [];
  const lastPeriodIndex = Math.max(1, Number(latestRun.lastPeriodIndex || 0));
  const nextPeriodIndex = lastPeriodIndex + 1;
  const features = programs.map((_, index) => makeProgramFeatures(
    nextPeriodIndex / lastPeriodIndex,
    index,
    programs.length,
  ));
  const input = tf.tensor2d(features, [features.length, programs.length * 2]);
  const result = model.predict(input);
  try {
    const values = await result.data();
    const term = String(latestRun.lastPeriod.semester || "").toLowerCase();
    const yearMatch = String(latestRun.lastPeriod.academic_year || "").match(/(\d{4})\s*[-–/]\s*(\d{4})/);
    let academicYear = latestRun.lastPeriod.academic_year;
    let nextSemester = "Next Semester";
    if (/1st|first/.test(term)) {
      nextSemester = "2nd Semester";
    } else if (/2nd|second/.test(term)) {
      nextSemester = "1st Semester";
      if (yearMatch) academicYear = `${Number(yearMatch[1]) + 1}-${Number(yearMatch[2]) + 1}`;
    }
    return {
      period_label: [academicYear, nextSemester].filter(Boolean).join(" - "),
      enrollment_count: programs.reduce((sum, _, index) => sum + Math.max(0, Math.round(Number(values[index] || 0) * Number(latestRun.maxCount || 0))), 0),
      programs: programs.map((program, index) => ({
        program,
        enrollment_count: Math.max(0, Math.round(Number(values[index] || 0) * Number(latestRun.maxCount || 0))),
      })),
    };
  } finally {
    input.dispose();
    result.dispose();
  }
};

export const getPredictionModelStatus = async () => {
  const stored = await readStoredModel();
  const runs = parseRuns(stored?.training_runs).filter((run) => run.target === "semester_enrollment_count_by_program");
  const semesterModelActive = runs.length > 0;
  return {
    isTraining: Boolean(trainingPromise),
    active: Boolean(stored && semesterModelActive),
    model: stored ? {
      name: "Semester enrollment forecast by program (TensorFlow.js)",
      type: semesterModelActive ? "trained from synthetic program dataset" : "retrain required",
      status: semesterModelActive ? "ready" : "retrain required",
      samples: semesterModelActive ? Number(stored.sample_count) : 0,
      trainedAt: semesterModelActive ? stored.trained_at : null,
    } : {
      name: "Semester enrollment forecast by program (TensorFlow.js)",
      type: "not trained yet",
      status: trainingPromise ? "training" : "waiting for training",
      samples: 0,
      trainedAt: null,
    },
    runs,
  };
};
