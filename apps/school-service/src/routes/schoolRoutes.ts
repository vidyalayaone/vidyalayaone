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
import { createGlobalSubjects } from "../controllers/createGlobalSubjects";
import { createClassSubjects } from "../controllers/createClassSubjects";

const router: Router = Router();

router.post('/create', createSchool);
router.get('/get-by-id/:schoolId', getSchoolById);
router.get('/get-by-subdomain/:subdomain', getSchoolBySubdomain);
router.put('/update/:schoolId', updateSchool); // needs to be updated
router.get('/approve/:schoolId', approveSchool);

// Class and Section management routes
router.post('/classes', createClasses); // needs to be updated
router.post('/sections', createSections); // needs to be updated
router.get('/classes-sections/:schoolId', getClassesAndSections); // needs to be updated

// Internal route for other services
router.get('/internal/classes-sections/:schoolId', getClassesAndSectionsInternal); // needs to be updated

// Subject management routes
router.post('/subjects/global', createGlobalSubjects); // needs to be updated
router.post('/subjects', createClassSubjects); // needs to be updated

export default router;