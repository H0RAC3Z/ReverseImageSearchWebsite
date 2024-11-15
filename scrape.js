const puppeteer = require('puppeteer');

const mpr_url = 'https://mprtools.com/products/ingersoll-rand-1105max-d2-1-4-inch-composite-air-ratchet-by-ingersoll-rand';
const jb_url = 'https://ca.jbtools.com/ingersoll-rand-285b-6-air-impact-wrench-1-drive-with-6-extended-anvil-1475-ft-lbs-new/';
const tenaquip_url = 'https://www.tenaquip.com/product/ingersoll-rand-2135qxpa-impact-wrench-1-2-drive-1-4-npt-air-inlet-11000-no-load-rpm-2135qxpa-uae021?originalQuery=2135QXPA'; 

async function scrapePrice_mpr() {
    // Launch the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(mpr_url, { waitUntil: 'networkidle2' });

    // Extract the price from the script tag
    const price = await page.evaluate(() => {
        const scriptContent = document.querySelector('#viewed_product').textContent;
        
        // Extract the "Price" value using a regular expression
        const priceMatch = scriptContent.match(/Price:\s*"(.*?)"/);
        
        return priceMatch ? priceMatch[1] : null; // Return the price if found
    });

    
    console.log('MPR Extracted Price:', price);

    
    await browser.close();
}

async function scrapePrice_jb() {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();


  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

  const response = await page.goto(jb_url, { waitUntil: 'networkidle2' });

  const price = await page.evaluate(() => {
    return document.querySelector('span.price--withoutTax')?.innerText || "No Price found";
  });

  console.log('JB tools Price:', price);

  // Close the browser
  await browser.close();

}


async function scrapePrice_tenaquip() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set user-agent to simulate human browsing
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

  const response = await page.goto(tenaquip_url, { waitUntil: 'networkidle2' });

  const price = await page.evaluate(() => {
    return document.querySelector('span#details-product-priceSPAN')?.innerText || "No Price found";
  });

    await browser.close();

 return price;
 
}

const { MongoClient } = require('mongodb');

async function addData() {
    const uri = 'mongodb://localhost:27017'; // MongoDB URI
    const client = new MongoClient(uri);

    

    const value = await scrapePrice_tenaquip();
 
    try {
        await client.connect();
       const database = client.db('ToolsDB'); 
       const collection = database.collection('ToolsDB'); 
 

       const result = await collection.insertOne({ name: "Tenaquip3", price: value });
       console.log(`Document inserted with _id: ${result.insertedId}`);

    } finally {
        await client.close();
    }
 }

 addData();
