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

app.get('/users',async(req,res)=>{
    const query={};
    const cursor=user.find(query);
    const reult=await cursor.toArray();
    res.send(reult)
})

app.get('/services',async(req,res)=>{
  const query={};
  const cursor=allservices.find(query);
  const reult=await cursor.toArray();
  res.send(reult)
})
app.post("/services",async(req,res)=>{
  const newService=req.body;
  const result=await allservices.insertOne(newService);
  res.send(result)
})
app.get('/services/:id',async(req,res)=>{
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
  console.log(updateDoc)
  const result=await allservices.updateOne(filter,updateDoc);
  console.log(result)
  res.send(result)
})


app.listen(PORT,()=>{
  console.log(`App listening on port ${PORT}`)
})
export default app