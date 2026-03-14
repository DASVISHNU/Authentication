const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    };
};
export {asyncHandler};
//yaha pe aysnc task ka error handle hota hai agar koi error yaha to catch kar k respone send kar dega
//Route → asyncHandler → Promise.resolve → error? → catch(next)
                                               //↓
                                      // Error Middleware

//asyncHandler(fn) → returns (req,res,next) middleware