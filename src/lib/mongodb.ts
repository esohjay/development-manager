import "server-only";
import {MongoClient,ServerApiVersion} from "mongodb";
const uri=process.env.MONGODB_URI;if(!uri)throw new Error("MONGODB_URI is not configured");
const globalForMongo=globalThis as unknown as{mongoClientPromise?:Promise<MongoClient>};
export const clientPromise=globalForMongo.mongoClientPromise??Promise.resolve(new MongoClient(uri,{serverApi:{version:ServerApiVersion.v1,strict:true,deprecationErrors:true}}));
if(process.env.NODE_ENV!=="production")globalForMongo.mongoClientPromise=clientPromise;
export async function getDb(){return(await clientPromise).db(process.env.MONGODB_DB||"northstar")}
