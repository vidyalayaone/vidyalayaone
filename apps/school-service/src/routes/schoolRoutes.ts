import { Router } from 'express';
import { createSchool } from "../controllers/createSchool";
import { getSchoolById } from "../controllers/getSchoolById";
import { getSchoolDetailed } from "../controllers/getSchoolDetailed";
// import { updateSchool } from "../controllers/updateSchool";
import { getSchoolBySubdomain } from "../controllers/getSchoolBySubdomain";
import { approveSchool } from "../controllers/approveSchool";
import { updateSchoolPlan } from "../controllers/updateSchoolPlan";
import { createClasses } from "../controllers/createClasses";
import { createSections } from "../controllers/createSections";
import { getClassesAndSections } from "../controllers/getClassesAndSections";
import { getClassesAndSectionsInternal } from "../controllers/getClassesAndSectionsInternal";
import { getClassByIdInternal } from "../controllers/getClassByIdInternal";
import { createGlobalSubjects } from "../controllers/createGlobalSubjects";
import { createClassSubjects } from "../controllers/createClassSubjects";
import { getSubjects } from "../controllers/getSubjects";
import { getSubjectsBulk } from "../controllers/getSubjectsBulk";
import { getSectionDetails } from "../controllers/getSectionDetails";
import { getSectionStudents } from "../controllers/getSectionStudents";
import { assignClassTeacher } from "../controllers/assignClassTeacher";
import { getGlobalSubjects } from "../controllers/getGlobalSubjects";
// import { getSectionTimetable } from "../controllers/getSectionTimetable";

const router: Router = Router();

router.post('/create', createSchool);
router.get('/get-by-id/:schoolId', getSchoolById);
router.get('/get-detailed/:schoolId', getSchoolDetailed);
router.get('/get-by-subdomain/:subdomain', getSchoolBySubdomain);
// router.put('/update/:schoolId', updateSchool); // needs to be updated
router.patch('/:schoolId/plan', updateSchoolPlan);
router.get('/approve/:schoolId', approveSchool);

// Class and Section management routes
router.post('/classes', createClasses);
router.post('/sections', createSections);
router.put('/sections/assign-class-teacher', assignClassTeacher);
router.get('/classes-sections/:schoolId', getClassesAndSections);

// Internal route for other services
router.get('/internal/classes-sections/:schoolId', getClassesAndSectionsInternal);
router.get('/internal/class/:classId', getClassByIdInternal);
router.post('/internal/subjects/bulk', getSubjectsBulk);

// Subject management routes
router.get('/subjects', getSubjects);
router.get('/subjects/global', getGlobalSubjects);
router.post('/subjects/global', createGlobalSubjects); // needs to be updated
router.post('/subjects', createClassSubjects); // needs to be updated

// Section detail routes
router.get('/:schoolId/classes/:classId/sections/:sectionId/details', getSectionDetails);
router.get('/:schoolId/classes/:classId/sections/:sectionId/students', getSectionStudents);
// router.get('/:schoolId/classes/:classId/sections/:sectionId/timetable', getSectionTimetable);

export default router;