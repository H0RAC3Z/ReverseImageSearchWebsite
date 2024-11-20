const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const uri = 'mongodb://localhost:27017';  
const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;
let collection;

client.connect().then(() => {
  db = client.db('ToolsDB');
  collection = db.collection('ToolsDB'); // Collection name is 'ToolsDB'

  // Start the Express server after the DB connection is established
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Route to get all tools
app.get('/toolsdb', async (req, res) => {
  try {
    const tools = await collection.find().toArray();
    res.json(tools);
  } catch (err) {
    res.status(500).send('Error retrieving tools');
  }
});

// Route to get a tool by MPN
app.get('/tools/:mpn', async (req, res) => {
  try {
    const tool = await collection.findOne({ MPN: req.params.mpn });
    if (!tool) {
      return res.status(404).send('Tool not found');
    }
    res.json(tool);
  } catch (err) {
    res.status(500).send('Error retrieving tool');
  }
});

// Serve static files from 'images' and 'pages' directories
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Serve individual files
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/main.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.css'));
});

// Serve the index.html file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
