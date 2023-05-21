const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
require('dotenv').config()
//mongodb connection starting code here

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yekoygf.mongodb.net/?retryWrites=true&w=majority`;
// const uri =`mongodb://0.0.0.0:27017`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('toyDb');
    const toyCollection = database.collection('toys');


    // add a toy api
    app.post('/addToy',async(req,res)=>{
        const singleToyInfo=req.body
        const result=await toyCollection.insertOne(singleToyInfo)
        res.send(result)
    })

    // read all toy api
    app.get('/allToys/:id',async(req,res)=>{
      const id=req.params.id
      const sortObj={
        Price:id
      }
      const allToys=await toyCollection.find().sort(sortObj).skip(0).limit(20).toArray()
      res.send(allToys)
    })

    //get search api
    app.get("/searchText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection.find({ toyName: { $regex: text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    //get my toys api
    app.get('/myToys',async(req,res)=>{
      const email=req.query.email
      const result=await toyCollection.find({sellerEmail:email}).toArray()
      res.send(result)
    })

    app.delete('/delete/:id',async(req,res)=>{
      const id=req.params.id
      const result=await toyCollection.deleteOne({_id:new ObjectId(id)})
      res.send(result)
    })

    //update my toys get api
    app.get('/updateData/:id',async(req,res)=>{
      const id=req.params.id
      const result=await toyCollection.find({_id:new ObjectId(id)}).toArray()
      res.send(result)
    })
    
    // update by id api

    app.put('/updateInfo/:id',async(req,res)=>{
      const data=req.body
      const id=req.params.id
      const updateInfo={
        $set:{
          Price:data.Price,
          quantity:data.quantity,
          description:data.description
        }

      }
      const result=await toyCollection.updateOne({_id:new ObjectId(id)},updateInfo)
      res.send(result)
    })

    // get all data from server

    app.get('/allToyData',async(req,res)=>{
      const result=await toyCollection.find().toArray()
      res.send(result)
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//mongodb connection ending code here

app.get("/", (req, res) => {
  res.send("server running");
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

//
//
