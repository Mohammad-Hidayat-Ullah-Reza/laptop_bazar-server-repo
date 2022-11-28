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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    app.get("/allLaptops", async (req, res) => {
      const email = req.query.email;

      const result = await fakeLaptopCollection
        .find({ seller_email: email })
        .toArray();
      res.send(result);
    });

    app.delete("/allLaptops", async (req, res) => {
      const id = req.body.laptopId;

      const result = await fakeLaptopCollection.deleteOne({
        _id: ObjectId(id),
      });
      res.send(result);
    });

    app.post("/addLaptop", async (req, res) => {
      const addLaptopInfo = req.body;
      const result = await fakeLaptopCollection.insertOne(addLaptopInfo);
      res.send(result);
    });

    app.get("/myOrders", async (req, res) => {
      const buyerEmail = req.query.buyerEmail;
      const result = await fakeMyOrdersCollection
        .find({ buyerEmail: buyerEmail })
        .toArray();
      res.send(result);
    });

    app.post("/myOrders", async (req, res) => {
      const myOrders = await fakeMyOrdersCollection.insertOne(req.body);
      res.send(myOrders);
    });

    app.get("/myProducts", async (req, res) => {
      const filter = req.query;

      const result = await fakeLaptopCollection.find(filter).toArray();
      res.send(result);
    });

    app.put("/myProducts/:id", async (req, res) => {
      const advertise = req.body.advertise;
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          advertise,
        },
      };
      const result = await fakeLaptopCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/booked/:id", async (req, res) => {
      const booked = req.body.booked;
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          booked: booked,
        },
      };
      const result = await fakeLaptopCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // app.get("/user", async (req, res) => {
    //   const email = req.body;
    //   const result = await usersCollection.findOne(email).toArray();
    //   res.send(result);
    // });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/users", async (req, res) => {
      const id = req.body.id;
      const result = await usersCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const verified = req.body.verified;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          verified,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/users/:role", async (req, res) => {
      const role = req.params.role;
      const result = await usersCollection.find({ role }).toArray();
      res.send(result);
    });

    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.find({ email }).toArray();
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
