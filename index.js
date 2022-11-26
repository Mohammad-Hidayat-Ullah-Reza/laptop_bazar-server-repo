const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dp8wnte.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client.db("laptopBazar").collection("services");
    const blogCollection = client.db("laptopBazar").collection("blog");
    const usersCollection = client.db("laptopBazar").collection("users");
    const fakeLaptopCollection = client
      .db("laptopBazar")
      .collection("fakeLaptop");
    const fakeMyOrdersCollection = client
      .db("laptopBazar")
      .collection("fakeMyOrders");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/blog", async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const blog = await cursor.toArray();
      res.send(blog);
    });

    app.get("/categories/:category", async (req, res) => {
      const category = req.params.category;
      const result = await fakeLaptopCollection
        .find({ category: category })
        .toArray();
      res.send(result);
    });

    app.post("/myOrders", async (req, res) => {
      const myOrders = await fakeMyOrdersCollection.insertOne(req.body);
      res.send(myOrders);
    });

    app.put("/booked/:id", async (req, res) => {
      const booked = req.body.booked;
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          booked: booked,
        },
      };
      console.log(updateDoc);
      const result = await fakeLaptopCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}

run().catch((e) => console.log(e));

app.get("/", (req, res) => {
  res.send("laptop bazar server running");
});

app.listen(port, () => {
  console.log(`laptop bazar server is running on port: ${port}`);
});
