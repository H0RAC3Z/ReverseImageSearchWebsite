const express = require('express');
const { MongoClient } = require('mongodb');

const cors = require('cors');

const path = require('path');

const app1 = express();

const app2 = express(); 

const port = 3000;

// Middleware
app1.use(cors());
app1.use(express.json());

// MongoDB URI and Database Name
const uri = 'mongodb://localhost:27017'; // Change this to your MongoDB URI
const dbName = 'ToolsDB'; // Replace with your database name

let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => console.error(err));

app1.get('/api/search', async (req, res) => {
  const MPN = req.query.MPN;
  console.log("Received MPN:", MPN); // Debug input
  if (!MPN) {
    return res.status(400).json({ error: 'MPN query parameter is required' });
  }

  try {
    const tool = await db.collection('ToolsDB').findOne({MPN: MPN });
    if(!tool) {
      return res.status(404).json({error: 'Tool not found' });
    }

    const mprprice = tool.MPR_price;
    const jbprice = tool.JB_price; // why is this one capital p?
    const tenaquipprice = tool.Tenaquip_price;
    const imglink = tool.Image_link;
    const mprlink = tool.MPR_link;
    const jblink = tool.JB_link;
    const tenaquiplink = tool.Tenaquip_link;

    function cheapest() {
      const cheapestPrice = jbprice;
      const cheapestLink = jblink;
      const source = "JB";

      if(jbprice <= mprprice && jbprice <= tenaquipprice) {
        cheapestPrice = jbprice;
        cheapestLink = jblink;
        source = "JB";
      } else if(mprprice <= jbprice && mprprice <= tenaquipprice) {
        cheapestPrice = mprprice;
        cheapestLink = mprlink;
        source = "MPR";
      } else if(tenaquipprice <= jbprice && tenaquipprice <= mprprice) {
        cheapestPrice = tenaquipprice;
        cheapestLink = tenaquiplink;
        source = "Tenaquip";
      }

      const result = {
        imglink: imglink,
        price: cheapestPrice,
        link: cheapestLink,
        source: source
      };

      return result;
    }

    const result = cheapest();

    console.log("Query result: ", result.price);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tool from database' });
  }
});


// Start the server
app1.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


app1.use('/images', express.static(path.join(__dirname, 'images')));
app1.use('/pages', express.static(path.join(__dirname, 'pages')));

// Serve individual files
app1.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app1.get('/main.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.css'));
});

// Serve the index.html file at root
app1.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app1.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


