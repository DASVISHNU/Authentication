import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import {ProjectMember} from "../models/projectmember.models.js"
import { Project } from "../models/project.models.js";
/*
project schema -name
                ,decscription
                ,createdby

projectmember schema -user
                    project
                    role
task 
                title
                project
                assign to
                assign by
                status
                attactments.








*/









const getProjects=asyncHandler(async(req,res)=>{
    const projects= await ProjectMember.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(req.user._id),

            },

        },
        {
            $lookup:{
                from:"projects",
                localField:"projects",
                foreignField:"_id",
                as: "projects",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmembers",
                            localField:"_id",
                            foreignField:"projects",
                            as:"projectmembers",
                        },
                    },
                    {
                        $addFields:{
                            members:{
                                $size:"$projectmembers",
                            },
                        },
                    }
                ]
            }
        },
        {
            $unwind:"$project",
        },
        {
            $project:{
                project:{
                    _id:1,
                    name:1,
                    description:1,
                    members:1,
                    createdAt:1,
                    createdBy:1,
                },
                role:1,
                _id:0,
            }
        }
    ])
    return res.status(200)
    .json(new ApiResponse(200,projects,"projects fectched successfully"))
});//done


const getProjectById=asyncHandler(async(req,res)=>{
    const{projectId}=req.params;
    const project=await Project.findById(projectId);
    
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});//done


const createProject=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
  const project=  await Project.create({
        name:name,
        description:description,
        createdBy:new mongoose.Types.ObjectId(req.user._id ),
});


await ProjectMember.create(
    {
        user:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(project._id),
        role:UserRolesEnum.ADMIN,
    }
)

return res.status(201).json(
    new ApiResponse(
        201,
        project,
        "Project created successfully"
    )
)
});//done


const updateProject=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;

    const {projectId}=req.params

   const project= await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        {new :true}
    )
    if(!project)
    {
        throw new ApiError(404,"Project not found")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project updated sucessessfully"
        )
    )
});//done

const deleteProject=asyncHandler(async(req,res)=>{
    const {projectId}=req.params
    const project=await Project.findByIdAndDelete(projectId)
    if(!project)
    {
      throw new ApiError(404,"Project not found")  
    }
    return res.status(200).json(
        
            new ApiResponse(
                200,
                project,
                "Project deleted successfully"
            )
        
    )
});//done

const addMembersToProject=asyncHandler(async(req,res)=>{
    //pehele to project id lenge 
    //user ka id lenge
    //projectmemeber me user add kar denge
    //aur project addd kar denge
    //role update kar denge

   const {email,role}= req.body;
   const {projectId}=req.params;
   const user=await User.findOne({email});
    if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  await ProjectMember.findByIdAndUpdate(
    {
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId) //ye yaha pe search kar raha hai pehele
    },
    {
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId),//ye yaha pe change kar raha hai 
        role:role,
    },
    {
        new:true,
        upsert:true,
    },
  )

});//done

const getProjectMembers=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project=await Project.findById(req.params);
    if(!project)
    {
        throw new ApiError(404,"project not found");
    }
    const projetMembers=await ProjectMember.aggregate([
        
    ])
});//

const updateMemberRole=asyncHandler(async(req,res)=>{
    //test
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member deleted successfully",
      ),
    );
});



export {addMembersToProject,createProject,deleteProject,
    getProjectMembers,getProjectById,getProjects,
    updateMemberRole,updateProject,deleteMember
};