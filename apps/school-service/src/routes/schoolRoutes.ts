import { Router } from 'express';
import { createSchool } from "../controllers/createSchool";
import { getSchoolById } from "../controllers/getSchoolById";
import { updateSchool } from "../controllers/updateSchool";
import { getSchoolBySubdomain } from "../controllers/getSchoolBySubdomain";

const router: Router = Router();

router.post('/school', createSchool);
router.get('/school/:schoolId', getSchoolById);
router.get('/school/subdomain/:subdomain', getSchoolBySubdomain);
router.put('/school/:schoolId', updateSchool);

export default router;
