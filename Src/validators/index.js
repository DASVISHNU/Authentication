import { body } from "express-validator";

const userRegisterValidator=()=>{
    return[
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email zaruri hai")
        .isEmail()
        .withMessage("bhaiya email k format barabar kara")
        ,
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLowercase()
        .withMessage("User name ko lowercase me rakho")
        .isLength({min:3})
        .withMessage("username kam se kam 3 akshar ko hona chaiye"),
        body("password").trim()
        .notEmpty()
        .withMessage("Password toh do bhai"),
        body("fullName").optional().trim(),
    ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};
export{
    userRegisterValidator,
    userLoginValidator
}