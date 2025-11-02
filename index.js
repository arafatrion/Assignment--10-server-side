const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5skonza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection failed:", err);
  }
}
connectDB();

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

// Delete Recipe
app.delete('/recipes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await recipesCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      res.send({ success: true });
    } else {
      res.status(404).send({ success: false, message: 'Recipe not found' });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

// Update Recipe
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

// Add Recipe
app.post('/recipes', async (req, res) => {
  const recipe = req.body;
  const result = await recipesCollection.insertOne(recipe);
  res.status(201).send(result);
});



module.exports = app; 
