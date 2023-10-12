from flask import Flask, request
from PIL import Image, ImageOps
import requests
import io
import os
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# authorization for removebg
removebg_api_key = "YOUR_API_KEY"

@app.route('/get_item_mask', methods=['POST'])
def get_item_mask():

    # use remove bg to get a png image and convert it to a black and white mask image.
    print("get item mask called")

    image_file = request.files['image']
    image_bytes = image_file.read()
    image = Image.open(io.BytesIO(image_bytes))

    image = image.convert('RGB')

    jpeg_buffer = io.BytesIO()
    image.save(jpeg_buffer, format='JPEG')

    #print(jpeg_buffer.getvalue())

    # set API endpoint and headers
    api_url = "https://api.remove.bg/v1.0/removebg"
    headers = {"X-Api-Key": removebg_api_key}

    # send the request to remove.bg API
    response = requests.post(api_url, headers=headers, files={'image_file': jpeg_buffer.getvalue()})


    # Check if the API returned a successful response
    if response.status_code == requests.codes.ok:
        
        # print("response is ok")
        # print("Success:", response.status_code, response.text)

        # Save the PNG image to a file
        with open('output.png', 'wb') as out_file:
            out_file.write(response.content)

        png_buffer = io.BytesIO()
        ux_mask_buffer = io.BytesIO()

        response_image = Image.open(io.BytesIO(response.content))
        response_image = response_image.convert('RGBA')
        
        ai_mask_image = convert_to_black_and_white(response_image)
        ai_mask_image = ai_mask_image.convert('RGB')
        ai_mask_image.save(png_buffer, format="JPEG")
        ai_mask_image_base64 = base64.b64encode(png_buffer.getvalue()).decode('utf-8')
        
        
        ux_mask_image = convert_to_green(response_image)
        ux_mask_image = ux_mask_image.convert('RGBA')
        ux_mask_image.save(ux_mask_buffer, format="PNG")

        ux_mask_image.save('greenoutput.png')

        ux_mask_image_base64 = base64.b64encode(ux_mask_buffer.getvalue()).decode('utf-8')

        return {'ai_mask': ai_mask_image_base64, 'ux_mask': ux_mask_image_base64}

    else:
        # Print an error message if the API call was not successful
        print("Error:", response.status_code, response.text)
        return {'error': "There was a problem with the remove bg operation"}


def convert_to_black_and_white(image):

    
    # Create a new image with the same size as the original, but with a white background
    new_image = Image.new('RGB', image.size, (255, 255, 255))
    
    # Create a mask for the alpha channel
    alpha_mask = image.split()[-1]
    
    modified_alpha_mask = modify_alpha_mask(alpha_mask)

    # Paste the original image onto the new image using the alpha channel as the mask
    new_image.paste(image, mask=modified_alpha_mask)

    new_image.save('temp_mask_image.png')
    
    # Convert the new image to grayscale
    new_image = new_image.convert('L')

    new_image.save('temp_mask_image_grayscale.png')
    
    # Convert all non-alpha pixels to black and all alpha pixels to white
    black_and_white_image = new_image.point(lambda x: 255 if x == 255 else 0, '1')
    
    return black_and_white_image


def modify_alpha_mask(alpha_mask):
    # Ensure the input image has an alpha channel
    if alpha_mask.mode != 'L':
        alpha_mask = alpha_mask.convert('L')

    # Create a new image with modified alpha values
    modified_alpha_mask = Image.new('L', alpha_mask.size)

    # Iterate over each pixel and modify the alpha value
    for x in range(alpha_mask.width):
        for y in range(alpha_mask.height):
            alpha_value = alpha_mask.getpixel((x, y))

            # Check if the alpha value is semi-transparent (not fully transparent or opaque)
            if alpha_value > 0 and alpha_value < 100:
                alpha_value = 0  # Set to fully transparent

            # Set the modified alpha value in the new image
            modified_alpha_mask.putpixel((x, y), alpha_value)

    return modified_alpha_mask


def convert_to_green(image):
    # Create a new image with the same size as the original, but with a transparent background
    new_image = Image.new('RGBA', image.size, (0, 0, 0, 0))
    
    # Create a mask for the alpha channel
    alpha_mask = image.split()[-1]
    
    # Paste the original image onto the new image using the alpha channel as the mask
    new_image.paste(image, mask=alpha_mask)
    
    # Create a new image with the same size as the original, but with 0.5 alpha green color
    green_image = Image.new('RGBA', image.size, (255, 200, 0, 180))

    # Create a mask for the alpha channel
    alpha_mask = new_image.split()[-1]
    
    alpha_mask = ImageOps.invert(alpha_mask)

    # Paste the green image onto the new image using the alpha channel as the mask
    new_image.paste(green_image, mask=alpha_mask)
    
    return new_image