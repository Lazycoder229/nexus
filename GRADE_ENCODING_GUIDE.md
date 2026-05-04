# Grade Encoding System - Campus Grading Implementation Guide

## Overview
This implementation adds support for the campus's grading system with weighted components:
- **Written Output**: 30% weight (5 sub-components)
- **Performance Tasks**: 30% weight (5 sub-components)
- **Midterm Exam**: 40% weight (single score)

## Features

### 1. **Excel Import/Export**
- **Export**: Click "📊 Export Excel" to download grades as an editable Excel file
- **Import**: Click "📥 Import Excel" to upload completed Excel files and auto-populate grades

The Excel file structure:
```
Student ID | Name | Output 1-5 | Output Avg | Task 1-5 | Task Avg | Midterm | Final Grade | Letter | Equiv. | Status
```

### 2. **Automatic Grade Calculation**
The system automatically calculates:
- **Component Averages**: Average of all 5 scores in each section
- **Final Grade**: `(Written Output Avg × 0.30) + (Performance Avg × 0.30) + (Midterm Exam × 0.40)`
- **Letter Grade**: A, B, C, D, or F based on final score
- **Numerical Equivalent**: 1.00 (A) to 5.00 (F)
- **Status**: PASSED (A-D) or FAILED (F)

### 3. **Grade Scale**
| Letter | Range | Equivalent |
|--------|-------|------------|
| A | 90-100 | 1.00 |
| B | 80-89 | 2.00 |
| C | 70-79 | 3.00 |
| D | 60-69 | 4.00 |
| F | 0-59 | 5.00 |

## Frontend Component Updates

### File: `GradeEncoding.jsx`

**Key Changes:**
1. Removed single "Assessment Type" selector - now grades are organized by structure
2. Added structured grade input with color-coded sections:
   - Blue: Written Output
   - Green: Performance Tasks
   - Yellow: Midterm Exam
   - Purple: Final Calculations

**State Structure:**
```javascript
grades[studentId] = {
  writtenOutput: [score1, score2, score3, score4, score5],
  performanceTasks: [score1, score2, score3, score4, score5],
  midtermExam: score
}
```

## Backend Updates

### 1. Database Migration
Run the migration to add weighted grading support:
```bash
mysql -u [username] -p [database] < back-nexus/migrations/add_weighted_grading_columns.sql
```

**New Columns Added to `grades` Table:**
- `letter_grade` (VARCHAR(2)): A, B, C, D, or F
- `final_score` (DECIMAL(5,2)): Calculated final grade (0-100)
- `weighted_output_score` (DECIMAL(10,2)): Written Output contribution
- `weighted_performance_score` (DECIMAL(10,2)): Performance Tasks contribution
- `midterm_exam_score` (DECIMAL(5,2)): Midterm exam score
- `components_json` (JSON): Detailed breakdown of all components

### 2. API Endpoints

**Bulk Grade Creation** (NEW)
```
POST /api/grades/bulk/create
Content-Type: application/json

{
  "grades": [
    {
      "studentId": 1,
      "courseId": 5,
      "writtenOutput": [85, 90, 88, 92, 87],
      "performanceTasks": [78, 82, 85, 80, 83],
      "midtermExam": 88,
      "finalGrade": 87.5,
      "letterGrade": "B"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "created": 15,
  "failed": 0,
  "message": "Successfully created 15 grades"
}
```

## Usage Instructions

### For Faculty Members

1. **Select Course**
   - Use the course dropdown to filter students
   - Optionally search by student ID or name

2. **Enter Grades**
   - Each colored section represents a grading component
   - Enter 5 scores for Written Output (each out of 100)
   - Enter 5 scores for Performance Tasks (each out of 100)
   - Enter 1 score for Midterm Exam (out of 100)
   - Final grade and status calculate automatically

3. **Import/Export Excel**
   - **Export**: Creates a formatted Excel file for offline work
   - **Import**: Upload completed Excel files to populate all fields at once
   - Excel files are fully editable and maintain the same structure

4. **Save Grades**
   - Click "Save Grades" to submit to the system
   - System validates all inputs and saves to database
   - Success/error messages confirm the operation

### Keyboard Tips
- Use **Tab** to move between input fields quickly
- Press **Enter** to move to the next row
- Excel import can bulk-populate grades for all students at once

## Example Workflow

### Scenario: Grade 25 students in CS101

**Step 1: Export Template**
- Select Course: CS101
- Click "📊 Export Excel"
- Save file as `CS101_Grades.xlsx`

**Step 2: Offline Work**
- Open Excel file
- Fill in all component scores for each student
- Formula columns update automatically
- Verify all students have passing or failing status

**Step 3: Import Back**
- Return to Grade Encoding
- Ensure CS101 is selected
- Click "📥 Import Excel"
- Select your completed `CS101_Grades.xlsx`
- All scores populate automatically

**Step 4: Review & Save**
- Review the calculated final grades
- Verify letter grades and status
- Click "Save Grades"
- System confirms all 25 grades saved

## Technical Details

### Grade Calculation Logic
```javascript
// Written Output Average
writtenOutputAvg = (out1 + out2 + out3 + out4 + out5) / 5

// Performance Tasks Average
performanceAvg = (task1 + task2 + task3 + task4 + task5) / 5

// Final Grade (Weighted)
finalGrade = (writtenOutputAvg × 0.30) + (performanceAvg × 0.30) + (midtermExam × 0.40)

// Letter Grade Mapping
if finalGrade >= 90: 'A'
else if finalGrade >= 80: 'B'
else if finalGrade >= 70: 'C'
else if finalGrade >= 60: 'D'
else: 'F'
```

### Database Triggers
The migration includes triggers that automatically:
- Calculate `final_score` when grade components are inserted/updated
- Assign `letter_grade` based on final score
- Maintain data integrity

## Troubleshooting

### Excel Import Not Working
1. Ensure file is .xlsx or .xls format
2. Check that column headers match expected format
3. Verify student IDs in Excel match database
4. Check browser console for detailed error messages

### Grades Not Saving
1. Ensure all required fields are filled
2. Check that final grade is calculated (all components must have values)
3. Verify course is selected
4. Check API response in browser Network tab

### Incorrect Calculations
1. Verify all component scores are 0-100
2. Check that averages are calculating (visible in colored section headers)
3. Review the calculation formula above
4. Ensure midterm exam score has a value

## Files Modified

- `front-nexus/src/components/pages/faculty/GradeEncoding.jsx` - Main UI component
- `back-nexus/controllers/grades.controller.js` - Added bulk create endpoint
- `back-nexus/services/grades.service.js` - Added bulk grade processing
- `back-nexus/routes/grades.routes.js` - Added bulk endpoint route
- `back-nexus/migrations/add_weighted_grading_columns.sql` - Database schema update

## Future Enhancements

Possible improvements for future versions:
1. Pre-set grade weights per course
2. Multiple assessment periods (Prelim, Midterm, Finals)
3. Grade moderation and approval workflow
4. Batch import from multiple Excel files
5. Grade distribution analytics
6. Student grade appeals system
7. PDF grade reports with official letterhead

## Support

For issues or questions about the grading system:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify database migration was applied: `SHOW COLUMNS FROM grades;`
4. Check that XLSX library is properly installed: `npm list xlsx`
