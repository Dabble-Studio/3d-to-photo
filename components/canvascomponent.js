import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import styles from "../styles/studio.module.css";
import { OrbitControls } from '@react-three/drei'

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useGLTF, useGLB } from "@react-three/drei";
import { Box3, Vector3 } from 'three';

export function CanvasComponent({setCanvasRef, gltfModel}) {
  return (
      <>
      <Canvas
          camera={{ fov: 40, position: [0, 0, 5]}}
          gl={{ alpha:true, preserveDrawingBuffer: true }}
      >
          <Scene gltfModel={gltfModel} setCanvasRef={setCanvasRef}/>
          <OrbitControls dampingFactor={0.3} />
      </Canvas>

      </>
    )
}

function Scene({ setCanvasRef, gltfModel }) {
  const { gl, camera } = useThree();

  // Set camera position closer to the object
  // camera.position.set(0, 0, 5);  // x, y, z
  
  setCanvasRef(gl.domElement);

  return (
    <>
      <ambientLight />
      <pointLight position={[1, 1, 1]} />
      <Light brightness={100} color={"white"}/> // highlight-line
      <Model gltfModel={gltfModel} />
    </>
  );
}


function Model({ gltfModel, ...props }) {

  const modelRef = useRef();
  const { camera, size } = useThree();

  useEffect(() => {
    if (modelRef.current) {
      // Compute the bounding box of the loaded model
      const box = new Box3().setFromObject(modelRef.current);
      const sizeModel = new Vector3();
      box.getSize(sizeModel);

      console.log("model size 1 is ", sizeModel)

      // Determine the scaling factor
      const maxSize = Math.max(sizeModel.x, sizeModel.y, sizeModel.z);
      const scale = Math.min(size.width, size.height) / maxSize;


      console.log("scaling factor is ", scale)
      // Apply the scaling factor to the model
      modelRef.current.scale.set(scale, scale, scale);
      
      
      const boxAfterScaling = new Box3().setFromObject(modelRef.current);
      const sizeModelAfterScaling = new Vector3();
      boxAfterScaling.getSize(sizeModelAfterScaling);
      console.log("model size after scaling is ", sizeModelAfterScaling)

      const maxSizeAfterScaling = Math.max(sizeModelAfterScaling.x, sizeModelAfterScaling.y, sizeModelAfterScaling.z);

      // Optional: Adjust the camera if necessary
      camera.position.z =( maxSizeAfterScaling / (1 * Math.tan((camera.fov * Math.PI) / 360)));
  
      console.log("camera position is ", camera.position.z)
      camera.near = 0.1;
      camera.far = 10000;
      camera.updateProjectionMatrix();
    }
  }, [modelRef, camera]);

  return <primitive ref={modelRef} object={gltfModel.scene} />;
}


function Light({ brightness, color }) {
  return (
    <rectAreaLight
      width={3}
      height={3}
      color={color}
      intensity={brightness}
      position={[7, 0, 3]}
      lookAt={[0, 0, 0]}
      penumbra={1}
      castShadow
    />
  );
}
