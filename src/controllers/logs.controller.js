import * as logService from '../services/log.service.js'
import {success, error } from '../utils/response.js';
export const getLogs=async(req,res)=>{
    try {
        const data=await logService.getUserLogs(req.user.id);
        success(res,data,"Log Fetched Successfully !",200)
    } catch (err) {
        error(res,err.message,400);
    }
}