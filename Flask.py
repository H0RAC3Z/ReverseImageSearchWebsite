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

    URL = os.getenv("WEAVIATE_URL", "*******") #insert your own api keys and url
    APIKEY = os.getenv("WEAVIATE_APIKEY", "********") 

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
        
        client = weaviateInitiate()

        
        mpn = imageSearch(client, image_url)

        
        if not mpn:
            return jsonify({"error": "MPN not found for the given image"}), 404

        
        nodeAPI = f"http://localhost:3000/api/search?MPN={mpn}"

        response = requests.get(nodeAPI)

        if response.status_code == 200:
            node_response = response.json()
            return jsonify(node_response)
        elif response.status_code == 404:
            return jsonify({"error": "Tool not found in Node.js API"}), 404
        else:
            return jsonify({"error": f"Node.js API error: {response.status_code}"}), 500

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
