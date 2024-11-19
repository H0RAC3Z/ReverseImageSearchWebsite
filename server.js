const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const path = require('path');

// Connect to MongoDB
// Replace with your MongoDB Atlas connection string if needed
mongoose.connect('mongodb://localhost:27017/toolsdatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

// Define a Schema for the "tools" collection
const toolSchema = new mongoose.Schema({
  SKU: String,
  MPN: String,
  "Image Link": String,
  "MPR Link": String,
  "JB TOOLS Link": String,
  "GRAINGER Link": String,
  "$ MPR TOOLS": Number,
  "$ JB TOOLS": Number,
  "GRAINGER": Number
}, { collection: 'tools' });  // Specify the collection name explicitly

// Create a model for the "tools" collection
const Tool = mongoose.model('Tool', toolSchema);

// Example query route to fetch all tools
app.get('/tools', async (req, res) => {
  try {
    const tools = await Tool.find();  // Query all tools from the "tools" collection
    res.json(tools);
  } catch (err) {
    res.status(500).send('Error retrieving tools');
  }
});

// Example query route to fetch tools by SKU
app.get('/tools/:sku', async (req, res) => {
  try {
    const tool = await Tool.findOne({ SKU: req.params.sku });  // Find a tool by SKU
    if (!tool) {
      return res.status(404).send('Tool not found');
    }
    res.json(tool);
  } catch (err) {
    res.status(500).send('Error retrieving tool');
  }
});

// Use images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve the JavaScript file
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Serve the search file file
app.get('/searchFile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'searchFile.html'));
});

// Serve the search mpn file
app.get('/searchMpn.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'searchMpn.html'));
});

// Serve the CSS file directly
app.get('/main.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.css'));
});

// Serve the HTML file
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
