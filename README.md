This project is a website that allows the user to enter a image url or mpn to search a mongodb and weavaite to find the desired tool. The database is filled using scrape.js that can be run on a locally.
The JSON file contains the mongodb data that can be placed into mongodb, to initialize the database.

script.js does the front end work while the server.js uses express, cors, and mongodb packages in order to run and receive api requests to query mongodb.

The Flask.py is a RESTAPI that takes an inputed image and queries weaviate. Then sends return data to the the node API, which then allows for output on frontend.

To display cheapest price link and img. main.css is linked to index.html and html files in the pages folder to style them. images are located in the images
folder. 

To run the project, download and enter your own API key from weaviate in the Flask.py file and create a mongodb connection that contains the json files.
