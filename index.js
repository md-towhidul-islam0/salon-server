import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'




const app=express();
app.use(express.json());
const PORT=process.env.PORT || 5000
app.use(cors());
const client = new MongoClient(process.env.MONGODB_URL);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const connectedclient=await connectToMongoDB();
const database=connectedclient.db('salondb')
const user=database.collection('user');
const allservices=database.collection('service-collection');
const sessions=database.collection('session');
const allappointments=database.collection('appointments-Collection');

const verifyToken=async(req,res,next)=>{
  const authHeader=req.headers.authorization;
  if (!authHeader){
    return res.status(401).send({message:"unauthorized access"})
  } 
  const token=authHeader.split(' ')[1];
  if (!token){
    return res.status(403).send({message:"forbidden access"})
  }
  const query={token:token};
  const session=await sessions.findOne(query);
  if (!session){
    return res.status(403).send({message:"forbidden access"})
  } 
  next()
}




app.get('/users',async(req,res)=>{
    const query={};
    const cursor=user.find(query);
    const result=await cursor.toArray();
    res.send(result)
})
app.get('/users/:id',async(req,res)=>{
  const id=req.params.id
    const query={_id:new ObjectId(id)};
    const cursor=user.find(query);
    const result=await cursor.toArray();
    res.send(result)
})
app.patch('/users/:id',async(req,res)=>{
  const id=req.params.id;
  const updatedService=req.body;
  const filter={_id: new ObjectId(id)};
  const updateDoc={$set:updatedService};
  console.log(updateDoc)
  const result=await user.updateOne(filter,updateDoc);
  console.log(result)
  res.send(result)
})


app.get('/services',async(req,res)=>{
  const query={};
  console.log(req.query)
  if (req.query){
    if (req.query.category)
    {
      query.category=req.query.category
    }
    if (req.query.search){
      query.$or=[{name:{$regex:req.query.search,$options:'i'}}]
    } 
  }
  const cursor=allservices.find(query);
  const result=await cursor.toArray();
  res.send(result)
})
// app.get('/services/:id',async(req,res)=>{
//   const id=req.params.id;
//   const query={_id:new ObjectId(id)};
//   const result=await allservices.findOne(query);
//   res.send(result)
// })
app.post("/services",async(req,res)=>{
  const newService=req.body;
  const result=await allservices.insertOne(newService);
  res.send(result)
})
app.get('/services/:id',verifyToken,async(req,res)=>{
  const id=req.params.id;
  const query={_id:new ObjectId(id)};
  const result=await allservices.findOne(query);
  res.send(result)
})
app.patch("/services/:id",async(req,res)=>{
  const id=req.params.id;
  const updatedService=req.body;
  const filter={_id: new ObjectId(id)};
  const updateDoc={$set:updatedService};
  const result=await allservices.updateOne(filter,updateDoc);
  console.log(result)
  res.send(result)
})
app.delete("/services/:id",async(req,res)=>{
  const id=req.params.id;
  const query={_id:new ObjectId(id)};
  const result=await allservices.deleteOne(query);
  res.send(result)
})  



app.get('/appointments',async(req,res)=>{
  const query={};
  const cursor=allappointments.find(query);
  const result=await cursor.toArray();
  res.send(result)
})  
app.post("/appointments",async(req,res)=>{
  const newAppointment=req.body;
  const result=await allappointments.insertOne(newAppointment);
  res.send(result)
})
app.patch("/appointments/:id",async(req,res)=>{
  const id=req.params.id;
  const updatedService=req.body;
  const filter={_id: new ObjectId(id)};
  const updateDoc={$set:updatedService};
  console.log(updateDoc)
  const result=await allappointments.updateOne(filter,updateDoc);
  console.log(result)
  res.send(result)
})
app.get('/appointments/:id',async(req,res)=>{
  const id=req.params.id;
  const query={customerId:id};
  const result=await allappointments.find(query).toArray()
  res.send(result)
})


app.listen(PORT,()=>{
  console.log(`App listening on port ${PORT}`)
})
export default app