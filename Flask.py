import os
import requests
from flask import Flask, request, jsonify
import flask_cors
from flask_cors import CORS
from weaviate.auth import AuthApiKey
from weaviate.client import Client
import weaviate.exceptions
import weaviate


app = Flask(__name__)
CORS(app)


def weaviateInitiate():

    URL = os.getenv("WEAVIATE_URL", "https://zmvltylqr3tyk4wje5ba.c0.us-east1.gcp.weaviate.cloud")
    APIKEY = os.getenv("WEAVIATE_APIKEY", "GvXAlacwwXYYUpya68aUk9bTjwQGHtzRwXPR") 

        # Debugging: Print the values
    print(f"WEAVIATE_URL: {URL}")
    print(f"WEAVIATE_APIKEY: {APIKEY}")


    client = Client(
    url=URL,
    auth_client_secret=AuthApiKey(APIKEY),
    timeout_config=(10, 10))

    return client


def VectorOfImage(strURL):
        import requests
        from PIL import Image
        from imgbeddings import imgbeddings
        image = Image.open(requests.get(strURL, stream=True).raw)
        ibed = imgbeddings()
        embedding = ibed.to_embeddings(image)
        vector = embedding.flatten().tolist()
        return vector


def imageSearch(client, image_url):
        import weaviate.classes.query as wq
        query_vector = VectorOfImage(image_url)
        
        response = (
            client.query
            .get("ImageSearch", ["mpn", "imgsource"])
            .with_near_vector({"vector": query_vector})
            .with_limit(1)
            .with_additional("distance")
            .do()
        )
        
        for result in response['data']['Get']['ImageSearch']:
            mpn = result.get("mpn", "N/A")
            imgsource = result.get("imgsource", "N/A")
            distance = result['_additional']['distance']
            return mpn
           

@app.route('/api/imgsearch', methods=['GET'])

def imageSearchAPI():
    image_url = request.args.get('image_url')
    if not image_url:
        return jsonify({"error": "Missing image_url parameter"}), 400

    try:
            client = weaviateInitiate()  # Initialize Weaviate client
            mpn = imageSearch(client, image_url)  # Get MPN from image search
        
        # Format the URL with the dynamic mpn value
            nodeAPI = f"http://localhost:3000/api/search?MPN={mpn}"
        
        # Send data to Node.js API
            response = requests.get(nodeAPI)  # POST request to Node.js API
        
        # Check if response from Node.js is successful
            if response.status_code == 200:
            # Return the response data after the Node.js API call
                return jsonify({"node_response": "connected"})
            else:
                return jsonify({"error": "Failed to update Node.js API"}), 500


    except Exception as e:
            return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)