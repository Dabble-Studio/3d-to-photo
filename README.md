# 3D to Photo

3D to Photo is an open-source package by Dabble, that combines threeJS and Stable diffusion to build a virtual photo studio for product photography. Load a 3D model into the browser and virtual shoot it in any kind of scene you can imagine. The app currently uses Stable Diffusion 1.5-inpainting, hosted on Replicate.

[Demo Video](https://youtu.be/iv-iOJDvtvc?si=MwYTDScrixLsLksR)

[![3D Photo to Studio Demo](https://i.imgur.com/opwbcT9.jpg)](https://www.youtube.com/watch?v=iv-iOJDvtvc)



## How it Works
* Upload a 3D model of any object in .glb format.
* Adjust the position and orientation of the model on the canvas
* Describe the scene you want to create in the text box and click generate image

## Use Cases
* Product Photography: Create product lifestyle photos in any backdrop you can imagine, without a physical photoshoot.
* Synthetic Data Generation: Generate synthetic images of an item in a variety of scenes. Useful when training object detection models.
* Previsualize Game Assets: Upload your game assets and generate level art around it to previsualize scenes.

## Tech Stack
* [ThreeJS](https://threejs.org) to handle loading and viewing 3D models
* Stable Diffusion 1.5 (inpainting) by [stability.ai](https://stability.ai/)
* [Replicate](https://replicate.com/) to run Stable Diffusion
* [NextJS](https://nextjs.org/) by Vercel for the front-end
* Python Flask Server for some backend image processing functions

## Install and Run

1. Clone this repository
```
git clone git@github.com:Dabble-Studio/3d-to-photo.git
```

2. Install necessary packages for the front end

```
cd 3d-to-photo
npm install
```

3. Install necessary packages for the python backend

```
cd image_proc_server
pip install -r requirements.txt
```

4. Run the Flask Server
```
flask run
```

5. Set your Replicate API key. In another terminal, navigate to the root folder and create a file called .env. You can use the .env.example file as a template. Paste your Replicate API key in this line REPLICATE_API_TOKEN=YOUR_API_TOKEN, in place of YOUR_API_TOKEN


6. Run the NextJS app
```
npm run dev
```

7. Use one of the sample 3D models and drag it into the upload area. Enter a prompt in the text box and click "Generate Image"
