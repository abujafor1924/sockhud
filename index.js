const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.get("/", (req, res) => {
  res.send("Hello Stock hub project ");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frl4ype.mongodb.net/?retryWrites=true&w=majority`;

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
    //     await client.connect();

    const userCollection = client.db("dataSave").collection("user");
    const categoryCollection = client.db("dataSave").collection("category");
    const productCollection = client.db("dataSave").collection("product");
    // Send a ping to confirm a successful connection
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // User Post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "already singUp" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // admin Email
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // manager email
    app.get("/users/manager/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { instructor: user?.role === "manager" };
      res.send(result);
    });

    // update
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/manager/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "manager",
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      //  console.log(query);
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Category Section

    app.get("/allCategory", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    app.post("/addCategory", async (req, res) => {
      const newItem = req.body;
      const result = await categoryCollection.insertOne(newItem);
      res.send(result);
    });

    app.delete("/allCategory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoryCollection.deleteOne(query);
      res.send(result);
    });

    // Product Section
    app.get("/allProduct", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.get("/allProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.post("/addProduct", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/allProductUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...body,
        },
      };
      const result = await productCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/allProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    //  singale product view

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running port: ${port}`);
});
