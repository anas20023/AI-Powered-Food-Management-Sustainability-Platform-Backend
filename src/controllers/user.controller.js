import * as userService from '../services/user.service.js';
import { success, error } from '../utils/response.js';

export const getAllUsers =async(req,res)=>{
    try {
        const users= await userService.getAllUsers();
        success(res,users,"User Fetched Successfully")
    } catch (err) {
        error(res,err.message,404)
    }
}
export const getUserById =async(req,res)=>{
    try {
        
    } catch (err) {
        
    }
}