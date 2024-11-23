import weaviate
import os
from weaviate.auth import AuthApiKey
from weaviate.client import Client
import weaviate.exceptions
import weaviate
import json

def VectorOfImage(strURL):
    import requests
    from PIL import Image
    from imgbeddings import imgbeddings
    image = Image.open(requests.get(strURL, stream=True).raw)
    ibed = imgbeddings()
    embedding = ibed.to_embeddings(image)
    vector = embedding.flatten().tolist()
    return vector

URL = os.getenv("WEAVIATE_URL", "https://zmvltylqr3tyk4wje5ba.c0.us-east1.gcp.weaviate.cloud")
APIKEY = os.getenv("WEAVIATE_APIKEY", "GvXAlacwwXYYUpya68aUk9bTjwQGHtzRwXPR")


# Check if URL and APIKEY are properly retrieved
if not URL or not APIKEY:
    raise ValueError("Both WEAVIATE_URL and WEAVIATE_APIKEY must be set as environment variables.")

# Connect to Weaviate Cloud
try:
    client = Client(
        url=URL,
        auth_client_secret=AuthApiKey(APIKEY),
        timeout_config=(10, 10)
    )

    # Check connection
    if client.is_ready():
        print("Connection to Weaviate is successful.")
    else:
        print("Failed to connect to Weaviate.")
except weaviate.exceptions.WeaviateBaseError as e:
    print(f"Error connecting to Weaviate: {e}")

# Define the class schema
image_class = {
    "class": "ImageSearch",
    "description": "A class to store image data and vectors",
    "properties": [
        {
            "name": "imgsource",
            "dataType": ["text"],
            "description": "The source URL of the image"
        }
    ],
    "vectorizer": "none",  # We will add our own vectors
    "vectorIndexConfig": {
        "distance": "cosine"
    }
}

# Create the class in Weaviate
try:
    client.schema.create_class(image_class)
    print("Class 'ImageSearch' created successfully.")
except weaviate.exceptions.SchemaValidationError as e:
    print(f"Schema validation error: {e}")
except weaviate.exceptions.WeaviateBaseError as e:
    print(f"Error creating class: {e}")

import time
t0 = time.time()

imgSources = [
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280x1280/products/193046/328590/17682350-891d-45c2-8c2a-4a386c88d991_MLW-2967-20__80029.1730794290.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280w/products/108904/17984/47ff43e7-0968-46fe-9d24-a7793ade7ee9__73614.1647922477.jpg?c=1',
'https://mprtools.com/cdn/shop/files/Ingersoll-Rand-2175MAX-1-Pistol-Grip-Impact-Wrench.jpg?v=1724453495',
'https://mprtools.com/cdn/shop/files/Ingersoll-Rand-2135QXPA-Impactool_-12.jpg?v=1724406033',
'https://mprtools.com/cdn/shop/files/Ingersoll-Rand-7803RA-Heavy-Duty-12-Inch-Reversible-Pnuematic-Drill.jpg?v=1724406423',
'https://mprtools.com/cdn/shop/files/Ingersoll-Rand-119MAXK-Long-Barrel-Air-Hammer-Kit.jpg?v=1724445778',
'https://mprtools.com/cdn/shop/files/DeWalt-DWP849X-BufferPolisher-Variable-Speed-Soft-Start-7-Inch9-Inch.jpg?v=1724452712',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280x1280/products/41544/295467/34e43402-5036-4764-86f3-22e205a21de4_DEW-DCF630B__02936.1724056082.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280x1280/products/41625/321901/83546487-f7df-44e7-a656-e011755d514b_DEW-DCGG571B__13486.1727789047.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280x1280/products/42837/322686/a8151ff8-21f5-475e-8d7c-eba2fc5bbfd6_DEW-DW758__50894.1727791418.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280x1280/products/191446/322609/1d1919f3-806b-4b1d-a72b-d3d802864346_DEW-DCCS623B__39200.1727791202.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280w/products/67244/317863/f7e3caad-a1da-42e9-8408-68d7cf839743_IRC-4151__86613.1727777363.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280w/products/67230/318614/69fc239c-ed11-40e3-a4f7-7c60ad7225f0_IRC-36QMAX__76858.1727779505.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280x1280/products/67147/300537/2c303082-9863-407d-8082-697fb15f44cf_IRC-2850MAX__65861.1724070307.jpg?c=1',
'https://cdn11.bigcommerce.com/s-8sp77pdf4a/images/stencil/1280w/products/67150/325990/dbec898e-4978-4850-b892-7d24e2810293_IRC-285B-6__20340.1728807161.jpg?c=1',
'https://mprtools.com/cdn/shop/files/Ingersoll-Rand-261-34-Inch-Super-Duty-Air-Impact-Wrench.jpg?v=1724406127'
]



# Add images and vectors to Weaviate
with client.batch as batch:
    for url in imgSources:
        properties = {"imgsource": url}
        vector = VectorOfImage(url)
        batch.add_data_object(properties, "ImageSearch", vector=vector)

# End timer
t1 = time.time()
total = t1 - t0
print(f"Total time taken: {total} seconds")

def imageSearch(URLS):
    import weaviate.classes.query as wq
    query_text = URLS
 
    query_vector= VectorOfImage(URLS)
    
    response = (
        client.query
        .get("ImageSearch", ["imgsource"])
        .with_near_vector({"vector": query_vector})
        .with_limit(1)
        .with_additional("distance")
        .do()
    )
    
    for result in response['data']['Get']['ImageSearch']:
        print(result["imgsource"])
        print(f"Distance to query: {result['_additional']['distance']:.3f}\n")
        
imgSource= "https://www.tenaquip.com/images/large/n/nkd053b.webp?1631568460"

ToolsList =['Chicago Pneumatic CP7732C Air Impact Wrench (1/2 Inch)']
import time

t0 = time.time()

print(ToolsList)
imageSearch(imgSource)
t1 = time.time()
total = t1-t0
print('Time Taken')
print(total)  
    