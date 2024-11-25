const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');

async function scrapePrice_mpr(mpr_url) {
   
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    
    await page.goto(mpr_url, { waitUntil: 'networkidle2' });

  
    const price = await page.evaluate(() => {

        const scriptContent = document.querySelector('.\\#price-value').textContent;
        
        let cleanedPrice = scriptContent.replace(/[^0-9.]/g, "");

        let priceFinal = parseFloat(cleanedPrice)


        return priceFinal ? priceFinal : null; // Return the price if found
    });

    
    await browser.close();

    return price;
}

async function scrapePrice_jb(jb_url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

  const response = await page.goto(jb_url, { waitUntil: 'networkidle2' });

  const price = await page.evaluate(() => {

    const priceText = document.querySelector('span.price.price--withoutTax')?.textContent || "No Price found";
    
    let cleanedPrice = priceText.replace(/[^0-9.-]+/g, '');

    let finalPrice = parseFloat(cleanedPrice)

    return finalPrice ? finalPrice : null

  });

  await browser.close();

  return price;

}


async function scrapePrice_tenaquip(tenaquip_url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

  const response = await page.goto(tenaquip_url, { waitUntil: 'networkidle2' });

  const price = await page.evaluate(() => {
    
    const intitalScrape = document.querySelector('span#details-product-priceSPAN')?.innerText || "No Price found";

    let cleanedPrice = intitalScrape.replace(/[^0-9.-]+/g, '');

    let finalPrice = parseFloat(cleanedPrice);

    return finalPrice;
  
  });

    await browser.close();

 return price;
 
}


 function updatePrices() {
  const uri = 'mongodb://localhost:27017'; 
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  client.connect().then(() => {
    const db = client.db('ToolsDB');
    const collection = db.collection('ToolsDB'); 

    const cursor = collection.find();

    function processNext() 
    {
      cursor.hasNext().then(hasNext => {
        if (hasNext) 
          {
          cursor.next().then(document => {
            const mprLink = document.MPR_link;
            const jbLink = document.JB_link;
            const tenaquipLink = document.Tenaquip_link;

            const mprPricePromise = mprLink ? scrapePrice_mpr(mprLink) : Promise.resolve(null);
            const jbPricePromise = jbLink ? scrapePrice_jb(jbLink) : Promise.resolve(null);
            const tenaquipPricePromise = tenaquipLink ? scrapePrice_tenaquip(tenaquipLink) : Promise.resolve(null);

            Promise.all([mprPricePromise, jbPricePromise, tenaquipPricePromise]).then(prices => {
              const [mprPrice, jbPrice, tenaquipPrice] = prices;

              const updateFields = {};
              if (mprPrice !== null) updateFields.MPR_price = mprPrice;

              if (jbPrice !== null) updateFields.JB_price = jbPrice;
              if (tenaquipPrice !== null) updateFields.Tenaquip_price = tenaquipPrice;

              if (Object.keys(updateFields).length > 0) {
                collection.updateOne({ _id: document._id }, { $set: updateFields }).then(() => {
                  console.log(`Updated document ${document._id} with prices:`, updateFields);
                  processNext();
                });
              } else {
                console.log(`No prices found for document ${document._id}`);
                processNext();
              }
            });
          });
        } else {
          client.close().then(() => {
            console.log('Finished updating prices.');
          });
        }
      });
    }

    processNext();
  });
}

updatePrices();


