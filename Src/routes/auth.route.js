import { Router } from "express";
import {registeruser} from "../controllers/auth.controllers.js"
import { userRegisterValidator,userLoginValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";
import { login } from "../controllers/auth.controllers.js";
const router=Router();

router.route("/register").post(userRegisterValidator(),validate,registeruser);
router.route("/login").post(userLoginValidator(),validate,login);
export default router;