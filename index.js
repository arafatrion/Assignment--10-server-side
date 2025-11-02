
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://recipe-book:LFcufq6lMp2QAKIQ@cluster0.5skonza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB");

    const db = client.db('recipeDB');
    const recipesCollection = db.collection('recipes');



    // Root
    app.get('/', (req, res) => {
      res.send('Simple card server is running');
    });

    // Top Recipes 
    app.get('/recipes/top', async (req, res) => {
      const top = await recipesCollection.find().sort({ like: -1 }).limit(6).toArray();
      res.send(top);
    });

    ;


    // All Recipes
    app.get('/recipes', async (req, res) => {
      const all = await recipesCollection.find().toArray();
      res.send(all);
    });

    // Recipe Details
    app.get('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const recipe = await recipesCollection.findOne({ _id: new ObjectId(id) });
      res.send(recipe);
    });

    app.get('/recipe-like/:id', async (req, res) => {
      const recipeId = req.params.id;
    });

    // My Recipe
    app.get('/recipes', async (req, res) => {
      const email = req.query.email;
      const result = await recipesCollection.find({ email }).toArray();
      res.send(result);
    });
    // delete rouute 
    app.delete('/recipes/:id', async (req, res) => {
      const id = req.params.id;

      try {
        const result = await recipesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
          res.send({ success: true, deletedCount: result.deletedCount });
        } else {
          res.status(404).send({ success: false, message: 'Recipe not found' });
        }
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    });

    app.put('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;


      delete updatedData._id;

      try {
        const result = await recipesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        res.send(result);
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    });



    // Add New Recipe
    app.post('/recipes', async (req, res) => {
      const recipe = req.body;
      const result = await recipesCollection.insertOne(recipe);
      res.status(201).send(result);
    });

    // Start the server here
    app.listen(port, () => {
      console.log(` Server is running on port ${port}`);
    });

  } catch (err) {
    console.error(' Error connecting to MongoDB:', err);
  }
}

run().catch(console.dir);

