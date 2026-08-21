import "server-only";
import {betterAuth} from "better-auth/minimal";import{mongodbAdapter}from"better-auth/adapters/mongodb";import{APIError}from"better-auth/api";import{getDb}from"@/lib/mongodb";
const db=await getDb();
export const auth=betterAuth({database:mongodbAdapter(db),secret:process.env.BETTER_AUTH_SECRET,baseURL:process.env.BETTER_AUTH_URL,emailAndPassword:{enabled:true,autoSignIn:false,minPasswordLength:10},databaseHooks:{user:{create:{before:async(user)=>{const allowed=process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();const existing=await db.collection("user").findOne({},{projection:{_id:1}});if(!allowed||user.email.toLowerCase()!==allowed||existing)throw new APIError("BAD_REQUEST",{message:"Account creation is disabled."});return{data:user}}}}}});
