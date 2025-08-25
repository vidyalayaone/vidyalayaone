import { Router } from 'express';
import { createSchool } from "../controllers/createSchool";
import { getSchoolById } from "../controllers/getSchoolById";
import { updateSchool } from "../controllers/updateSchool";
import { getSchoolBySubdomain } from "../controllers/getSchoolBySubdomain";
import { approveSchool } from "../controllers/approveSchool";
import { createClasses } from "../controllers/createClasses";
import { createSections } from "../controllers/createSections";
import { getClassesAndSections } from "../controllers/getClassesAndSections";
import { getClassesAndSectionsInternal } from "../controllers/getClassesAndSectionsInternal";
import { getClassByIdInternal } from "../controllers/getClassByIdInternal";
import { createGlobalSubjects } from "../controllers/createGlobalSubjects";
import { createClassSubjects } from "../controllers/createClassSubjects";
import { getSubjects } from "../controllers/getSubjects";

const router: Router = Router();

router.post('/create', createSchool);
router.get('/get-by-id/:schoolId', getSchoolById);
router.get('/get-by-subdomain/:subdomain', getSchoolBySubdomain);
router.put('/update/:schoolId', updateSchool); // needs to be updated
router.get('/approve/:schoolId', approveSchool);

// Class and Section management routes
router.post('/classes', createClasses);
router.post('/sections', createSections);
router.get('/classes-sections/:schoolId', getClassesAndSections);

// Internal route for other services
router.get('/internal/classes-sections/:schoolId', getClassesAndSectionsInternal);
router.get('/internal/class/:classId', getClassByIdInternal);

// Subject management routes
router.get('/subjects', getSubjects);
router.post('/subjects/global', createGlobalSubjects); // needs to be updated
router.post('/subjects', createClassSubjects); // needs to be updated

export default router;