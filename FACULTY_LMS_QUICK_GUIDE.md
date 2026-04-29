# Quick Reference Guide - New Faculty LMS Features

## 1. Document Viewer

### How to Use
When viewing student submissions:

```
Submissions Modal
  ↓
Each submission card shows:
  • Student Name
  • Submission Text (if any)
  • [View Document] [Download] buttons
```

### Supported Formats
| Format | Display Method | Download? |
|--------|---|---|
| PDF | In-browser viewer | ✅ |
| DOCX/DOC | External viewer link | ✅ |
| JPG, PNG, GIF, WebP | Native image viewer | ✅ |
| TXT, MD | Text viewer | ✅ |
| Other | Download link | ✅ |

---

## 2. AI-Assisted Checker

### How to Use

**Step 1: Open Grade Modal**
- Click "Grade Submission" button

**Step 2: Enter Model Answer**
```
In the "AI-Assisted Checker" section:
1. Paste the expected/ideal answer
2. Click "Run AI Check"
```

**Step 3: Review AI Score & Feedback**
```
The system will:
✓ Analyze semantic similarity
✓ Check for key concepts
✓ Evaluate completeness
✓ Suggest a score and feedback
```

**Step 4: Adjust if Needed**
- Edit the Score field manually
- Edit the Feedback if you prefer different wording
- Submit the grade

---

## 3. Scoring Breakdown

### How the AI Calculates Score

The AI uses THREE metrics, each scored 0-100:

#### Metric 1: Semantic Similarity (50% weight)
**What it measures**: Does the student understand the concept?
- Compares meaning, not just words
- Uses AI embeddings for deep analysis
- Example: "bought" and "purchased" would be recognized as similar

#### Metric 2: Keyword Matching (25% weight)
**What it measures**: Does the student cover key terms?
- Extracts important keywords (ignores "the", "and", etc.)
- Checks if student mentions key concepts
- Example: If model answer mentions "photosynthesis", student should too

#### Metric 3: Completeness (25% weight)
**What it measures**: Is the answer detailed enough?
- Compares answer length
- Encourages comprehensive responses
- Scoring scale:
  - 100%+ of model length = 100 points
  - 50-100% = 75-100 points  
  - 25-50% = 50-75 points
  - <25% = 0-50 points

### Final Score Formula
```
Score = (Semantic × 50%) + (Keywords × 25%) + (Completeness × 25%)
Result = Scaled to assignment's total points
```

---

## 4. Feedback Examples

### Example 1: Good Answer
```
✅ Score: 92/100

Feedback:
"Your answer demonstrates strong understanding of the concept. 
You've covered the key terminology and concepts. 
Your answer length is appropriate."
```

### Example 2: Missing Depth
```
⚠️ Score: 68/100

Feedback:
"Your answer covers some relevant concepts but is missing key ideas. 
You've included 65% of key terms; try to include more important keywords. 
Your answer is somewhat brief; consider expanding with more details."
```

### Example 3: Too Brief
```
❌ Score: 35/100

Feedback:
"Your answer lacks semantic similarity to the expected answer. 
Include more of the key terms and concepts from the expected answer. 
Your answer is too brief. Provide a more complete response."
```

---

## 5. Common Scenarios

### Scenario 1: Student Submitted PDF
1. Click **View Document** → PDF opens in browser viewer
2. Review the PDF content
3. Click **Grade Submission**
4. Paste model answer and run AI Check
5. Review AI suggestions, adjust if needed
6. Submit grade

### Scenario 2: Multiple Text & File Submissions
1. Some students submit text only
2. Some submit PDF/DOCX files
3. Use **View Document** for files, read text directly for text submissions
4. Same grading process applies to all

### Scenario 3: AI Score Seems Off
- Review the semantic similarity score
- Check if student's wording is very different from model
- Manually adjust score (override AI suggestion)
- This helps the AI improve next time

---

## 6. Tips for Best Results

### For Model Answer Entry
- **Be clear**: Write the ideal/expected answer clearly
- **Be complete**: Include all key points you want students to cover
- **Use good grammar**: Better models lead to better AI analysis
- **Include examples**: If applicable, helps AI understand expectations

### For Student Evaluation
- **Read student work first**: Get context before AI scoring
- **Consider effort**: AI focuses on content, you can adjust for effort
- **Override when needed**: AI is a helper, not final judge
- **Provide feedback**: Use AI feedback as starting point, personalize it

### For Consistency
- **Use same model answer**: Keeps scoring consistent across students
- **Review AI adjustments**: Note which assignments get off-track
- **Document exceptions**: If you override score, note why in feedback

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Document won't display | Try downloading it instead; check file format |
| AI Check button inactive | Paste a model answer in the text field first |
| AI score seems wrong | Check completeness - very short answers score low |
| Feedback is generic | It's AI-generated; feel free to customize it |
| Model won't load | Refresh page; model downloads on first use (~2 seconds) |

---

## 8. System Information

### Technical Details
- **AI Engine**: TensorFlow.js + Universal Sentence Encoder
- **No API Key Needed**: Runs entirely on your server
- **Cost**: Free (no cloud service fees)
- **Processing Time**: ~500ms-1s per submission
- **Model Size**: ~350MB (downloaded once, then cached)

### First Time Setup
- First AI check: May take 1-2 seconds (downloading model)
- After that: Much faster (~200-500ms)
- Model is cached in server memory

---

## 9. Keyboard Shortcuts

In **Document Viewer**:
- **ESC** or **X button**: Close viewer
- **Download icon**: Download the file

In **Grade Modal**:
- **Tab**: Move between fields
- **Ctrl+Enter**: Submit grade (if available)

---

## Quick Checklist Before Submitting Grade

- [ ] Reviewed student submission (text + document if any)
- [ ] Entered model answer for AI Check
- [ ] Ran AI Check and reviewed suggestions
- [ ] Adjusted score if needed (0-100 or 0-total_points)
- [ ] Customized feedback if needed
- [ ] Clicked Submit Grade

---

## Support & More Info

**Full Technical Documentation**: See `AI_CHECKER_IMPLEMENTATION.md`

**Files Involved**:
- Frontend: `front-nexus/src/components/pages/faculty/LMSAssignments.jsx`
- AI Service: `back-nexus/services/aiChecker.service.js`
- Controller: `back-nexus/controllers/lmsAssignments.controller.js`
- Document Viewer: `front-nexus/src/components/shared/DocumentViewer.jsx`
