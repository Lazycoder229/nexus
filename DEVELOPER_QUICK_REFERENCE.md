# Grade Encoding - Developer Quick Reference

## Component State Structure

```javascript
// grades[studentId]
{
  writtenOutput: [score1, score2, score3, score4, score5],
  performanceTasks: [score1, score2, score3, score4, score5],
  midtermExam: score
}

// Example
grades[5] = {
  writtenOutput: [85, 90, 88, 92, 87],
  performanceTasks: [78, 82, 85, 80, 83],
  midtermExam: 88
}
```

## Key Calculation Functions

### Component Average
```javascript
calculateComponentAverage(scores) {
  const validScores = scores.filter(s => s !== null && s !== '');
  if (validScores.length === 0) return null;
  return validScores.reduce((a, b) => a + b, 0) / validScores.length;
}
```

### Final Grade
```javascript
calculateFinalGrade(studentId) {
  const sg = grades[studentId];
  const wo = calculateComponentAverage(sg.writtenOutput);  // 30%
  const pt = calculateComponentAverage(sg.performanceTasks); // 30%
  const me = sg.midtermExam;                               // 40%
  
  if (!wo || !pt || me === null) return null;
  return (wo * 0.30) + (pt * 0.30) + (me * 0.40);
}
```

### Letter Grade Mapping
```javascript
getLetterGrade(score) {
  if (!score) return '-';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
```

## API Request/Response Format

### Request
```javascript
POST /api/grades/bulk/create
Content-Type: application/json

{
  "grades": [
    {
      "studentId": 5,
      "courseId": 1,
      "writtenOutput": [85, 90, 88, 92, 87],
      "performanceTasks": [78, 82, 85, 80, 83],
      "midtermExam": 88,
      "finalGrade": 86.2,
      "letterGrade": "B"
    },
    // ... more students
  ]
}
```

### Response (Success)
```javascript
{
  "success": true,
  "created": 25,
  "failed": 0,
  "message": "Successfully created 25 grades"
}
```

### Response (With Errors)
```javascript
{
  "success": true,
  "created": 24,
  "failed": 1,
  "errors": [
    {
      "studentId": 10,
      "error": "Student not found"
    }
  ],
  "message": "Successfully created 24 grades with 1 errors"
}
```

## Database Schema Additions

### New Columns in `grades` table
```sql
ALTER TABLE grades ADD COLUMN letter_grade VARCHAR(2);
ALTER TABLE grades ADD COLUMN final_score DECIMAL(5,2);
ALTER TABLE grades ADD COLUMN weighted_output_score DECIMAL(10,2);
ALTER TABLE grades ADD COLUMN weighted_performance_score DECIMAL(10,2);
ALTER TABLE grades ADD COLUMN midterm_exam_score DECIMAL(5,2);
ALTER TABLE grades ADD COLUMN components_json JSON;
```

### Sample Row
```
grade_id: 101
student_user_id: 5
course_id: 1
period_id: 1
final_score: 86.2
letter_grade: B
weighted_output_score: 26.52
weighted_performance_score: 24.48
midterm_exam_score: 88
components_json: {"writtenOutput": [85,90,88,92,87], "performanceTasks": [78,82,85,80,83], "midtermExam": 88}
status: submitted
```

## Excel Data Structure

### Export Row Format
```
[StudentID, Name, WO1, WO2, WO3, WO4, WO5, WO_Avg, PT1, PT2, PT3, PT4, PT5, PT_Avg, Midterm, FinalGrade, Letter, Equiv, Status]
[STU001, John Doe, 85, 90, 88, 92, 87, 88.4, 78, 82, 85, 80, 83, 81.6, 88, 86.2, B, 2.00, PASSED]
```

### Import Parsing
```javascript
Row indices mapping:
0: Student ID
1: Name
2-6: Written Output 1-5
7: Written Output Average (ignored)
8-12: Performance Tasks 1-5
13: Performance Average (ignored)
14: Midterm Exam
15-18: Calculated fields (ignored)
```

## Common Code Patterns

### Handle Grade Change
```javascript
const handleGradeChange = (studentId, section, index, value) => {
  if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
    setGrades(prev => {
      const sg = { ...prev[studentId] };
      if (section === 'midtermExam') {
        sg.midtermExam = value === '' ? null : parseFloat(value);
      } else {
        sg[section][index] = value === '' ? null : parseFloat(value);
      }
      return { ...prev, [studentId]: sg };
    });
  }
};
```

### Validate Before Save
```javascript
const validateGrades = (grades) => {
  for (const [sid, g] of Object.entries(grades)) {
    const wo = calculateComponentAverage(g.writtenOutput);
    const pt = calculateComponentAverage(g.performanceTasks);
    if (!wo || !pt || g.midtermExam === null) {
      return false; // Incomplete
    }
  }
  return true;
};
```

### Prepare for API
```javascript
const prepareGradeData = (students, grades) => {
  return students.map(s => {
    const finalGrade = calculateFinalGrade(s.id);
    return {
      studentId: s.id,
      courseId: s.courseId,
      writtenOutput: grades[s.id].writtenOutput,
      performanceTasks: grades[s.id].performanceTasks,
      midtermExam: grades[s.id].midtermExam,
      finalGrade: finalGrade,
      letterGrade: getLetterGrade(finalGrade)
    };
  });
};
```

## Grid Layout (Tailwind CSS)

### Color Coding
```javascript
// Written Output (Blue)
className="px-2 py-3 bg-blue-50"
className="px-2 py-3 bg-blue-100 font-semibold"

// Performance Tasks (Green)
className="px-2 py-3 bg-green-50"
className="px-2 py-3 bg-green-100 font-semibold"

// Midterm (Yellow)
className="px-2 py-3 bg-yellow-50"

// Final (Purple)
className="px-4 py-3 bg-purple-50"
```

## Error Handling

### Frontend
```javascript
try {
  await axios.post(`${API_BASE}/api/grades/bulk/create`, { grades: data });
  alert('Grades saved successfully!');
} catch (error) {
  console.error('Error:', error);
  alert(`Failed to save: ${error.message}`);
}
```

### Backend
```javascript
try {
  const result = await GradesService.createBulkGrades(gradesData);
  res.status(201).json(result);
} catch (error) {
  res.status(400).json({ error: error.message });
}
```

## Performance Tips

1. **Memoize calculations** for large student lists
2. **Lazy load** students if count > 100
3. **Debounce** grade changes to prevent excessive re-renders
4. **Use batch operations** for database inserts
5. **Cache** course data to avoid repeated API calls

## Testing Queries

### Verify Grades Saved
```sql
SELECT 
  g.grade_id,
  u.first_name,
  u.last_name,
  g.final_score,
  g.letter_grade,
  g.components_json
FROM grades g
JOIN users u ON g.student_user_id = u.user_id
WHERE g.course_id = 1
ORDER BY g.created_at DESC;
```

### Check Component Calculations
```sql
SELECT 
  g.grade_id,
  g.final_score,
  g.weighted_output_score,
  g.weighted_performance_score,
  g.midterm_exam_score,
  (g.weighted_output_score + g.weighted_performance_score + (g.midterm_exam_score * 0.4)) AS calculated_score
FROM grades g
LIMIT 5;
```

## Dependencies Required

### Frontend
```json
{
  "xlsx": "^0.18.5",
  "file-saver": "^2.0.5",
  "react": "^19.1.1",
  "axios": "^1.12.2"
}
```

### Backend
```json
{
  "express": "latest",
  "mysql2/promise": "latest"
}
```

## File Locations

```
front-nexus/
  src/
    components/
      pages/
        faculty/
          GradeEncoding.jsx ← MAIN COMPONENT
    utils/
      gradeExcelUtils.js ← EXCEL UTILITIES

back-nexus/
  controllers/
    grades.controller.js ← API HANDLER
  services/
    grades.service.js ← BUSINESS LOGIC
  routes/
    grades.routes.js ← API ROUTES
  migrations/
    add_weighted_grading_columns.sql ← DB SCHEMA
```

## Debug Checklist

- [ ] Component state logging: `console.log('grades:', grades);`
- [ ] Calculation verification: Check math manually
- [ ] API response: Check Network tab in DevTools
- [ ] Database: `SELECT * FROM grades ORDER BY created_at DESC LIMIT 1;`
- [ ] Excel file: Open in Excel, check structure
- [ ] Trigger execution: `SELECT * FROM INFORMATION_SCHEMA.TRIGGERS;`

## Key Metrics

```
Component Size: ~800 lines
Excel Utils: ~350 lines
Service Logic: ~80 additional lines
Controller Logic: ~35 additional lines
Database Changes: 6 new columns + 2 triggers
```

---

**Last Updated:** May 4, 2026
**Version:** 1.0 Production Ready
