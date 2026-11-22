import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
import Stripe from 'stripe';




const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000
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
const connectedclient = await connectToMongoDB();
const database = connectedclient.db('salondb')
const user = database.collection('user');
const allservices = database.collection('service-collection');
const sessions = database.collection('session');
const allappointments = database.collection('appointments-Collection');
const Allpayment = database.collection('transactions-collection')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" })
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).send({ message: "forbidden access" })
  }
  const query = { token: token };
  const session = await sessions.findOne(query);
  if (!session) {
    return res.status(403).send({ message: "forbidden access" })
  }
  next()
}




app.get('/users', async (req, res) => {
  const query = {};
  const cursor = user.find(query);
  const result = await cursor.toArray();
  res.send(result)
})
app.get('/', async (req, res) => {
  res.send("HairSalon")
})
app.get('/users/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const cursor = user.find(query);
  const result = await cursor.toArray();
  res.send(result)
})
app.patch('/users/:id', async (req, res) => {
  const id = req.params.id;
  const updatedService = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: updatedService };
  console.log(updateDoc)
  const result = await user.updateOne(filter, updateDoc);
  console.log(result)
  res.send(result)
})


app.get('/services', async (req, res) => {
  const query = {};
  console.log(req.query)
  if (req.query) {
    if (req.query.category) {
      query.category = req.query.category
    }
    if (req.query.search) {
      query.$or = [{ name: { $regex: req.query.search, $options: 'i' } }]
    }
  }
  const cursor = allservices.find(query);
  const result = await cursor.toArray();
  res.send(result)
})
// app.get('/services/:id',async(req,res)=>{
//   const id=req.params.id;
//   const query={_id:new ObjectId(id)};
//   const result=await allservices.findOne(query);
//   res.send(result)
// })
app.post("/services", async (req, res) => {
  const newService = req.body;
  const result = await allservices.insertOne(newService);
  res.send(result)
})
// app.get('/services/:id', verifyToken, async (req, res) => {
//   const id = req.params.id;
//     console.log(id)
//   const query = { _id: new ObjectId(id) };
//   console.log(query)
//   const result = await allservices.findOne(query);
//   res.send(result)
// })

app.get('/services/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Check whether ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid service ID'
      });
    }

    const query = { _id: new ObjectId(id) };

    const result = await allservices.findOne(query);

    // Check whether service exists
    if (!result) {
      return res.status(404).send({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).send({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.patch("/services/:id", async (req, res) => {
  const id = req.params.id;
  const updatedService = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: updatedService };
  const result = await allservices.updateOne(filter, updateDoc);
  console.log(result)
  res.send(result)
})
app.delete("/services/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await allservices.deleteOne(query);
  res.send(result)
})



app.get('/appointments', async (req, res) => {
  const query = {};
  const cursor = allappointments.find(query);
  const result = await cursor.toArray();
  res.send(result)
})
app.post("/appointments", async (req, res) => {
  const newAppointment = req.body;
  const result = await allappointments.insertOne(newAppointment);
  res.send(result)
})
app.patch("/appointments/:id", async (req, res) => {
  const id = req.params.id;
  const updatedService = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: updatedService };
  console.log(updateDoc)
  const result = await allappointments.updateOne(filter, updateDoc);
  console.log(result)
  res.send(result)
})
app.get('/appointments/:id', async (req, res) => {
  const id = req.params.id;
  const query = { customerId: id };
  const result = await allappointments.find(query).toArray()
  res.send(result)
})
app.get('/appointments/e/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await allappointments.findOne(query)
  res.send(result)
})


app.post('/transactions', async (req, res) => {
  const { sessionId } = req.body;
  const {
    status,
    customer_email,
    payment_intent,
    payment_status,
    metadata,
    amount_total,
    currency,
    line_items
  } = await stripe.checkout.sessions.retrieve(sessionId)
  console.log(status, payment_status)
  if (status === 'complete' && payment_status === "paid") {
    const sessionQuery = { sessionId };
    const isPrev = await Allpayment.findOne(sessionQuery);
    if (isPrev) {
      console.log("already payment")
      res.send({ success: false, message: "Already payment" })
      return
    }
    const payment = {
      sessionId,
      status,
      payment_status,
      customer_email,
      userId: metadata.userID,
      serviceID: metadata.serviceID,
      payment_intent,
      amount_total,
      currency,
      line_items
    }
    const result = await Allpayment.insertOne(payment);
    const query = { _id: new ObjectId(metadata.serviceID) }
    const updateDOC = {
      $set: {
        paymentStatus: "paid"
      }
    }
    const updateResult = await allappointments.updateOne(query, updateDOC)
    console.log("All success")
    res.send({ sussess: true, result, updateResult })
    return
  }
  res.send({ sussess: false });

})
app.get('/transactions', async (req, res) => {

  const query = {};
  const cursor = Allpayment.find(query);
  const result = await cursor.toArray();
  res.send(result)
})


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

export default app