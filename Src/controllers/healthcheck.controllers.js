import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
const healthCheck=asyncHandler(async (req,res)=>{
    res.status(200).json(new ApiResponse(200,{message:"server running"}))
});
export {healthCheck};