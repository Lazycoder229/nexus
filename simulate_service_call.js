import ScholarshipApplicationsService from "./back-nexus/services/scholarshipApplications.service.js";

async function simulate() {
    console.log("--- Test 1: Valid Data (All fields present) ---");
    try {
        const data1 = {
            scholarship_id: 1,
            student_id: 10,
            academic_period_id: 5
        };
        await ScholarshipApplicationsService.createApplication(data1);
    } catch (err) {
        console.log("Test 1 Result:", err.message);
    }

    console.log("\n--- Test 2: Missing Scholarship ID ---");
    try {
        const data2 = {
            scholarship_id: "",
            student_id: 10,
            academic_period_id: 5
        };
        await ScholarshipApplicationsService.createApplication(data2);
    } catch (err) {
        console.log("Test 2 Result:", err.message);
    }

    console.log("\n--- Test 3: Data with Strings instead of Numbers ---");
    try {
        const data3 = {
            scholarship_id: "1",
            student_id: "10",
            academic_period_id: "5"
        };
        await ScholarshipApplicationsService.createApplication(data3);
    } catch (err) {
        console.log("Test 3 Result:", err.message);
    }
}

// Mocking models to avoid DB errors
import ScholarshipApplicationsModel from "./back-nexus/model/scholarshipApplications.model.js";
import Scholarship from "./back-nexus/model/scholarships.model.js";
import { getAcademicPeriodById } from "./back-nexus/model/academicPeriods.model.js";

// We don't actually need to mock if we just want to see if it passes the first IF check.
// But to avoid the rest of the function execution:
ScholarshipApplicationsModel.generateApplicationNumber = () => "MOCK-APP-123";
Scholarship.getProgramById = () => Promise.resolve({ is_active: true, available_amount: 1000, current_beneficiaries: 0, max_beneficiaries: 10 });
// getAcademicPeriodById is imported as a function, so we might need to mock it differently if it's a named import.

simulate();
