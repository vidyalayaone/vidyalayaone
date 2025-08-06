import { Router } from 'express';
import { createSchool } from "../controllers/createSchool";
import { getSchoolById } from "../controllers/getSchoolById";
import { updateSchool } from "../controllers/updateSchool";
import { getSchoolBySubdomain } from "../controllers/getSchoolBySubdomain";
import { activateSchool } from "../controllers/activateSchool";

const router: Router = Router();

router.post('/create', createSchool);
router.get('/get-by-id/:schoolId', getSchoolById);
router.get('/get-by-subdomain/:subdomain', getSchoolBySubdomain);
router.put('/update/:schoolId', updateSchool);
router.get('/activate/:schoolId', activateSchool);

export default router;
