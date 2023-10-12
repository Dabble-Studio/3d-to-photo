import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/studio.module.css";
import FormData from 'form-data';
import Dropzone from 'react-dropzone';
import { userAgentFromString } from "next/server";
import TextInput from "@/components/textinput";
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {CanvasComponent} from "@/components/canvascomponent";


/*
links for thereejs implementation
https://codesandbox.io/s/basic-demo-forked-rnuve?file=/src/App.js

*/


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


export default function Studio(){

    // const imageContainer = {
    //     position: 'absolute',
    //     top: '0',
    //     left: '0',
    //     backgroundColor: 'rgb(70, 232, 83)',
    //     height: '100%',
    //     width: '100%',
    // };

    const [canvasSnapshotUrl, setCanvasSnapshotUrl] = useState(null)
    const [maskImageUrl, setMaskImageUrl] = useState(null);
    const [uxMaskImageUrl, setUxMaskImageUrl] = useState(null);

    const [imageFile, setImageFile] = useState(null)
    const [modelFile, setModelFile] = useState(null);
    const [modelBuffer, setModelBuffer] = useState(null);
    const [gltfModel, setGltfModel] = useState(null);
    
    const [isImgUploadVisible, setIsImgUploadVisible] = useState(null)
    const [isMaskVisible, setIsMaskVisible] = useState(null)
    const [isResultVisible, setIsResultVisible] = useState(null)
    const [isFlashingProgressVisible, setIsFlashingProgressVisible] = useState(null)

    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    const [inputValue, setInputValue] = useState('');

    // create a canvas reference in the main state
    const [canvasRef, setCanvasRef] = useState(null);

    function handleInputValueChange(newInputValue) {
        setInputValue(newInputValue);
    }

    useEffect(() => {
        console.log("loaded the page");

        // define visibiltiy of the 3 layers
        setIsImgUploadVisible(true)
        setIsMaskVisible(true)
        setIsResultVisible(false)
        setIsFlashingProgressVisible(false)

    },[]);


    const handleDrop = (event) => {
        event.preventDefault();
    
        const file = event.dataTransfer.files[0];
        if (file && file.name.endsWith('.glb')) {
            const reader = new FileReader();
    
            reader.readAsArrayBuffer(file);
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
    
                const loader = new GLTFLoader();
                loader.parse(arrayBuffer, '', (gltf) => {
                    setGltfModel(gltf);
                    console.log("gltf model loaded")
                    console.log('Loaded Scene:', gltf.scene);

                }, (error) => {
                    console.error('ArrayBuffer loading error:', error);
                });
            };
        }
    };
    

    const getReplicateResults = async (image, mask) => {

        setIsFlashingProgressVisible(true)

        let promptText = "beautiful living room"

        if (inputValue) {
            promptText = inputValue
        }

        const response = await fetch("/api/predictions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            //prompt: e.target.prompt.value,
            //prompt: "high resolution photography of a beige interior living room with dining chairs, around dining table, wooden floor, beige blue salmon pastel, sunlight, contrast, realistic artstation concept art, hyperdetailed, ultradetail, cinematic 8k, architectural rendering, unreal engine 5, rtx, volumetric light, cozy atmosphere",
            //prompt: "minimalist kitchen, wooden floor, beige blue salmon pastel, sunlight, contrast, realistic artstation concept art, hyperdetailed, ultradetail, cinematic 8k, architectural rendering, unreal engine 5, rtx, volumetric light, cozy atmosphere",
            prompt: promptText + ", creative marketing advertisement",
            negative_prompt: "blurry, painting, cartoon, abstract, ugly, deformed",
            image: image,
            mask: mask,
            num_outputs: 4,
            guidance_scale: 7.5,
          }),
        });
        let prediction = await response.json();
        if (response.status !== 201) {
          setError(prediction.detail);
          return;
        }
        setPrediction(prediction);
    
        while (
          prediction.status !== "succeeded" &&
          prediction.status !== "failed"
        ) {
          await sleep(1000);
          const response = await fetch("/api/predictions/" + prediction.id);
          prediction = await response.json();
          if (response.status !== 200) {
            setError(prediction.detail);
            return;
          }

          if (prediction.status == "succeeded" && prediction.output) {
            setIsImgUploadVisible(true)
            setIsMaskVisible(true)
            setIsResultVisible(true)
            setIsFlashingProgressVisible(false)
          }

          console.log({prediction})
          setPrediction(prediction);
        }
    };

    async function generateImages() {
        console.log("Called the generate images function")
    
        // Do something with the image data URL
        let snapshotImage = capture3DSnapshot()

        const formData = new FormData();
        formData.append('image', snapshotImage);
        
        if (!snapshotImage) {
            console.log("image file is null")
        }
        // Generate base64 url image for remove bg

        

        try {

            const response = await fetch('http://127.0.0.1:5000/get_item_mask', {
              method: 'POST',
              body: formData
            });
    
            // Handle response
            // const imageBlob = await response.blob();
            // const url = URL.createObjectURL(imageBlob);
            // setMaskImageUrl(url)
            console.log(response)

            const data = await response.json();
            //console.log(data.image)

            let maskBase64Url = `data:image/jpeg;base64,${data.ai_mask}`
            let uxMaskBase64Url = `data:image/jpeg;base64,${data.ux_mask}`

            setMaskImageUrl(maskBase64Url)
            setUxMaskImageUrl(uxMaskBase64Url)

            setIsMaskVisible(true)
            setIsImgUploadVisible(true)
            setIsResultVisible(false)


            let imageURLTemp = "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80"
            
            // Generate base64 image for input image.
            // Filereader converts a file blob into a base64 string
            const reader = new FileReader();
            reader.readAsDataURL(snapshotImage);
            reader.onload = async () => {
                const imageBase64Url = reader.result;

                // now send a request to replicate
                await getReplicateResults(imageBase64Url ,maskBase64Url)

            };
            
        
        } catch (error) {
            console.error(error);
        }
    
        // const img = document.createElement('img');
        // img.src = url;
        // document.body.appendChild(img);
    }

    function base64ToBlob(base64Image) {
        const parts = base64Image.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const byteString = atob(parts[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
      
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
      
        return new Blob([arrayBuffer], { type: mimeType });
    }

    function capture3DSnapshot() {

        const dataUrl = canvasRef.toDataURL("image/png")
        setCanvasSnapshotUrl(dataUrl)

        const blob = base64ToBlob(dataUrl);
        setImageFile(blob)
        setIsMaskVisible(false)
        setIsImgUploadVisible(true)
        setIsResultVisible(false)


        return blob
         
    }

    //download snapshot
    const download3DSnapshot = () => {
        const link = document.createElement("a");
        link.setAttribute("download", "canvas.png");
        link.setAttribute(
          "href",
          canvasRef.toDataURL("image/png").replace("image/png", "image/octet-stream")
        );
        link.click();
    };


    return(
        <div className={styles.page}>

            {/* threejs container  */}

            <div className={styles.inputPanel}>
                {/* <div className={styles.mainImageContainer}>
                    {isImgUploadVisible? (
                        <div
                            className={styles.imageContainer}
                            onDrop={handleDrop}
                            onDragOver={(event) => event.preventDefault()}
                        >
                            {imageFile? (
                                <div>
                                    <Image
                                        src={URL.createObjectURL(imageFile)}
                                        alt="Uploaded image"
                                        fill={true}
                                    />
                                </div>
                            ) : (
                                <div className={styles.dragAndDropText}>Drag and Drop your image here</div>
                            )}

                        </div>
                    ): (<></>)
                    }
                    <CanvasComponent setCanvasRef={setCanvasRef} />

                </div> */}

                <div className={styles.mainImageContainer}>
                    <div
                        className={styles.imageContainer}
                        onDrop={handleDrop}
                        onDragOver={(event) => event.preventDefault()}
                    >
                        {gltfModel ? <CanvasComponent setCanvasRef={setCanvasRef} gltfModel={gltfModel} /> : "Drop your GLB model here"}
                    </div>
                </div>

                <div><TextInput onTextChange={handleInputValueChange} /></div>

                <div className={styles.buttonContainer}>
                    {/* <div 
                        className={styles.startNewButton}
                        onClick={()=>setImageFile(null)}
                    >
                            Start New
                    </div> */}

                    <div 
                        className={styles.generateButton}
                        onClick={()=>generateImages()}
                    >
                            Generate Images
                    </div>


                </div>


            </div>


            <div className={styles.resultsPanel}>

                    {/* {isImgUploadVisible? (
                        <div
                            className={styles.imageContainer}
                            onDrop={handleDrop}
                            onDragOver={(event) => event.preventDefault()}
                        >
                            {imageFile? (
                                <div>
                                    <Image
                                        src={URL.createObjectURL(imageFile)}
                                        alt="Uploaded image"
                                        fill={true}
                                    />
                                </div>
                            ) : (
                                <div className={styles.dragAndDropText}>Drag and Drop your image here. Or click 3D</div>
                            )}


                            {canvasSnapshotUrl? (
                                <div>
                                    <Image
                                        src={canvasSnapshotUrl}
                                        alt="Uploaded image"
                                        fill={true}
                                    />
                                </div>
                            ) : (
                                <></>
                            )
                            }

                        </div>
                    ): (<></>)
                    } */}

                    {/* {canvasSnapshotUrl? (
                        <div 
                            className={`${styles.maskImageContainer} ${canvasSnapshotUrl ? styles.slideDown : ""}`}
                        >    
                            {canvasSnapshotUrl? (
                                <Image
                                    src={canvasSnapshotUrl? canvasSnapshotUrl : ""}
                                    alt="output"
                                    fill="true"
                                    hidden={!canvasSnapshotUrl}
                                />
                            ):(
                                <div> </div>
                            )
                            }
                        </div>
                    ) : (
                        <></>
                    )} */}

                    {/* <div 
                        className={`${styles.maskImageContainer} ${isMaskVisible ? styles.slideDown : ""}`}
                    >    
                        {uxMaskImageUrl? (
                            <Image
                                src={uxMaskImageUrl? uxMaskImageUrl : ""}
                                alt="output"
                                width="400"
                                height="400"
                                objectFit="contain"
                                hidden={!uxMaskImageUrl}
                            />
                        ):(
                            <div> </div>
                        )
                        }
                    </div> */}


                        {/* {isFlashingProgressVisible? (
                        <div 
                            className={styles.flashingProgressContainer}
                        >    

                        </div>

                        ):(<></>)} */}

                    {isResultVisible? (
                        <>

                        <div>
                        {prediction.output && (
                            <div className={styles.imageResultsContainer}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                    fill
                                    src={prediction.output[0]}
                                    alt="output"
                                    />
                                </div>
                                <div className={styles.imageWrapper}>
                                    <Image
                                    fill
                                    src={prediction.output[1]}
                                    alt="output"
                                    />
                                </div>
                                <div className={styles.imageWrapper}>
                                    <Image
                                    fill
                                    src={prediction.output[2]}
                                    alt="output"
                                    />
                                </div>
                                <div className={styles.imageWrapper}>
                                    <Image
                                    fill
                                    src={prediction.output[3]}
                                    alt="output"
                                    />
                                </div>
                            </div>
                        )}  

                        </div>
                        

                    </>
                    ) : (
                        <></>
                    )}
                    {
                        isFlashingProgressVisible?
                        (<p>Loading...</p>):(<></>)
                    }




            </div>

            {/* <div className={styles.contentPanel}>
                    
            {error && <div>{error}</div>}

            {prediction && (
            <div>
                {prediction.output && (
                    <div className={styles.imageResultsContainer}>
                        <div className={styles.imageWrapper}>
                            <Image
                            fill
                            src={prediction.output[0]}
                            alt="output"
                            />
                        </div>
                        <div className={styles.imageWrapper}>
                            <Image
                            fill
                            src={prediction.output[1]}
                            alt="output"
                            />
                        </div>
                        <div className={styles.imageWrapper}>
                            <Image
                            fill
                            src={prediction.output[2]}
                            alt="output"
                            />
                        </div>
                        <div className={styles.imageWrapper}>
                            <Image
                            fill
                            src={prediction.output[3]}
                            alt="output"
                            />
                        </div>
                    </div>
                )}  
                <p>status: {prediction.status}</p>
            </div>
            )}



            </div> */}

        </div>
    );

}
