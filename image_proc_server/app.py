from flask import Flask, request
from PIL import Image, ImageOps
import requests
import io
import os
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/get_item_mask', methods=['POST'])
def get_item_mask():

    # use remove bg to get a png image and convert it to a black and white mask image.
    print("get item mask called")

    image_file = request.files['image']
    image_bytes = image_file.read()
    image = Image.open(io.BytesIO(image_bytes))

    image = image.convert('RGBA')
    image.save('input.png')

    jpeg_buffer = io.BytesIO()

    ai_mask_image = convert_to_black_and_white(image)

    ai_mask_image.save("output.png")
    ai_mask_image = ai_mask_image.convert('RGB')
    ai_mask_image.save(jpeg_buffer, format="JPEG")
    ai_mask_image_base64 = base64.b64encode(jpeg_buffer.getvalue()).decode('utf-8')

    return {'ai_mask': ai_mask_image_base64}


def convert_to_black_and_white(image):
    # Create a new image with the same size as the original, but with a white background
    new_image = Image.new('RGB', image.size, (255, 255, 255))
    
    # Ensure the image has an alpha channel
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    # Get pixel data
    data = image.getdata()

    # Create new image data
    new_data = []
    for item in data:
        # If the pixel is fully transparent (alpha value of 0), set it to white. Else, set it to black.
        if item[3] == 0:
            new_data.append((255, 255, 255, 255))
        else:
            new_data.append((0, 0, 0, 255))

    # Update new image data
    new_image.putdata(new_data)

    # Convert the final image to grayscale for black and white effect
    black_and_white_image = new_image.convert('L')

    return black_and_white_image
