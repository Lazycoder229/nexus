import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tensorflowLoaded = false;
let USE = null;

// Initialize TensorFlow and Universal Sentence Encoder
export const initializeTensorFlow = async () => {
  if (tensorflowLoaded && USE) {
    return USE;
  }

  try {
    const tf = await import("@tensorflow/tfjs");
    const use = await import("@tensorflow-models/universal-sentence-encoder");
    
    console.log("[AI Checker] Loading Universal Sentence Encoder model...");
    USE = await use.load();
    tensorflowLoaded = true;
    console.log("[AI Checker] Universal Sentence Encoder loaded successfully");
    return USE;
  } catch (error) {
    console.error("[AI Checker] Failed to load TensorFlow/USE:", error);
    throw new Error("AI checker models failed to initialize");
  }
};

// Extract keywords from text
const extractKeywords = (text) => {
  // Simple keyword extraction: split by spaces, filter stop words
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "been", "be",
    "have", "has", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "can", "this", "that", "these", "those", "i", "you",
    "he", "she", "it", "we", "they", "what", "which", "who", "when",
    "where", "why", "how", "all", "each", "every", "both", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "as"
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .map(word => word.replace(/[^\w]/g, ""));
};

// Calculate keyword match percentage
const calculateKeywordMatch = (studentKeywords, modelKeywords) => {
  if (modelKeywords.length === 0) return 0;

  const studentSet = new Set(studentKeywords);
  const matches = modelKeywords.filter(keyword => studentSet.has(keyword)).length;
  return (matches / modelKeywords.length) * 100;
};

// Calculate text length/completeness score
const calculateCompletenessScore = (studentText, modelText) => {
  const studentLength = studentText.trim().length;
  const modelLength = modelText.trim().length;
  
  // Student should have at least 50% of model answer length to be considered complete
  const completenessRatio = studentLength / modelLength;
  
  if (completenessRatio >= 1) return 100; // At least as long as model
  if (completenessRatio >= 0.5) return 75 + (completenessRatio - 0.5) * 50; // 50-100% = 75-100 score
  if (completenessRatio >= 0.25) return 50 + (completenessRatio - 0.25) * 100; // 25-50% = 50-75 score
  return Math.max(0, completenessRatio * 200); // Less than 25% = 0-50 score
};

// Calculate semantic similarity using Universal Sentence Encoder
const calculateSemanticSimilarity = async (studentText, modelText) => {
  try {
    const encoder = await initializeTensorFlow();
    
    // Encode both texts
    const embeddings = await encoder.embed([studentText, modelText]);
    const studentEmbedding = embeddings.arraySync()[0];
    const modelEmbedding = embeddings.arraySync()[1];
    
    // Calculate cosine similarity
    let dotProduct = 0;
    let studentNorm = 0;
    let modelNorm = 0;
    
    for (let i = 0; i < studentEmbedding.length; i++) {
      dotProduct += studentEmbedding[i] * modelEmbedding[i];
      studentNorm += studentEmbedding[i] * studentEmbedding[i];
      modelNorm += modelEmbedding[i] * modelEmbedding[i];
    }
    
    studentNorm = Math.sqrt(studentNorm);
    modelNorm = Math.sqrt(modelNorm);
    
    if (studentNorm === 0 || modelNorm === 0) {
      return 0; // Handle zero vectors
    }
    
    const similarity = dotProduct / (studentNorm * modelNorm);
    // Convert from [-1, 1] range to [0, 100] percentage
    const similarityScore = ((similarity + 1) / 2) * 100;
    
    // Clean up tensors
    embeddings.dispose();
    
    return Math.min(100, Math.max(0, similarityScore));
  } catch (error) {
    console.error("[AI Checker] Semantic similarity calculation error:", error);
    return 0;
  }
};

// Main AI check function
export const runTensorFlowAiCheck = async ({
  submission,
  modelAnswer,
  totalPoints = 100,
}) => {
  if (!modelAnswer || !modelAnswer.trim()) {
    throw new Error("Model answer is required for AI checking");
  }

  if (!submission || !submission.submission_text) {
    throw new Error("No submission text found");
  }

  const studentText = submission.submission_text.trim();
  const modelText = modelAnswer.trim();

  if (!studentText) {
    throw new Error("Student submission is empty");
  }

  // Extract keywords from both
  const studentKeywords = extractKeywords(studentText);
  const modelKeywords = extractKeywords(modelText);

  // Calculate scores (each component is weighted)
  const semanticSimilarityScore = await calculateSemanticSimilarity(studentText, modelText);
  const keywordMatchScore = calculateKeywordMatch(studentKeywords, modelKeywords);
  const completenessScore = calculateCompletenessScore(studentText, modelText);

  // Weighted average:
  // - Semantic similarity: 50% (most important for understanding)
  // - Keyword matching: 25% (ensures key concepts are covered)
  // - Completeness: 25% (ensures sufficient answer length)
  const overallScore = (
    semanticSimilarityScore * 0.5 +
    keywordMatchScore * 0.25 +
    completenessScore * 0.25
  );

  // Convert to total points
  const finalScore = Math.round((overallScore / 100) * totalPoints * 100) / 100;
  const clampedScore = Math.min(Math.max(finalScore, 0), totalPoints);

  // Generate feedback based on scores
  const feedback = generateFeedback({
    semanticSimilarityScore,
    keywordMatchScore,
    completenessScore,
    overallScore,
    studentKeywordsCount: studentKeywords.length,
    modelKeywordsCount: modelKeywords.length,
  });

  return {
    score: clampedScore,
    feedback,
    details: {
      semanticSimilarityScore: Math.round(semanticSimilarityScore),
      keywordMatchScore: Math.round(keywordMatchScore),
      completenessScore: Math.round(completenessScore),
      overallScore: Math.round(overallScore),
    },
  };
};

// Generate constructive feedback
const generateFeedback = ({
  semanticSimilarityScore,
  keywordMatchScore,
  completenessScore,
  overallScore,
  studentKeywordsCount,
  modelKeywordsCount,
}) => {
  const feedbackParts = [];

  // Semantic similarity feedback
  if (semanticSimilarityScore >= 80) {
    feedbackParts.push("Your answer demonstrates strong understanding of the concept.");
  } else if (semanticSimilarityScore >= 60) {
    feedbackParts.push("Your answer covers the main ideas but could benefit from more depth or clarity.");
  } else if (semanticSimilarityScore >= 40) {
    feedbackParts.push("Your answer addresses some relevant concepts but is missing key ideas.");
  } else {
    feedbackParts.push("Your answer lacks semantic similarity to the expected answer. Review the core concepts.");
  }

  // Keyword matching feedback
  if (keywordMatchScore >= 80) {
    feedbackParts.push("You've covered the key terminology and concepts.");
  } else if (keywordMatchScore >= 50) {
    feedbackParts.push(`You've included ${Math.round(keywordMatchScore)}% of key terms; try to include more important keywords.`);
  } else if (keywordMatchScore > 0) {
    feedbackParts.push("Include more of the key terms and concepts from the expected answer.");
  }

  // Completeness feedback
  if (completenessScore >= 80) {
    feedbackParts.push("The answer length is appropriate.");
  } else if (completenessScore >= 50) {
    feedbackParts.push("The answer is somewhat brief; consider expanding with more details.");
  } else {
    feedbackParts.push("The answer is too brief. Provide a more complete response.");
  }

  return feedbackParts.join(" ");
};

export default {
  runTensorFlowAiCheck,
  extractKeywords,
  calculateKeywordMatch,
  calculateCompletenessScore,
  calculateSemanticSimilarity,
  initializeTensorFlow,
};
