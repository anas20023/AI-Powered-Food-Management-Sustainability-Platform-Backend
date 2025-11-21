import * as consumeServeice from '../services/consume.service.js'
import { error, success } from '../utils/response.js';
export const getconsumption= async(req,res)=>{
    try {
        const data= await consumeServeice.getconsumption(parseInt(req.user.id));
        success(res,data,"Consumption Data Fetched Successfully !",200)
    } catch (err) {
        error(res,err.message,400);
    }
}
export const getwaste= async(req,res)=>{
    try {
        const data= await consumeServeice.getwaste(parseInt(req.user.id));
        success(res,data,"Waste Data Fetched Successfully !",200)
    } catch (err) {
        error(res,err.message,400);
    }
}