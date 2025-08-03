import { Router } from 'express';
import { createSchool } from "../controllers/createSchool";
import { getSchoolById } from "../controllers/getSchoolById";
import { updateSchool } from "../controllers/updateSchool";
import { deleteSchool } from "../controllers/deleteSchool";
// import { validateSubdomain } from "../controllers/validateSubdomain";
import { getTenantByDomain } from "../controllers/getTenantByDomain";

const router: Router = Router();

// Platform management routes
router.post('/create-school', createSchool);
router.get('/schools/:tenantId', getSchoolById);
router.put('/schools/:tenantId', updateSchool);
router.delete('/schools/:tenantId', deleteSchool);
// router.get('/validate-subdomain', validateSubdomain);

// API Gateway route for tenant resolution
router.get('/resolve/:domain', getTenantByDomain);

export default router;
