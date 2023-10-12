import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import styles from "../styles/studio.module.css";
import { OrbitControls } from '@react-three/drei'

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useGLTF, useGLB } from "@react-three/drei";


export function CanvasComponent({setCanvasRef, gltfModel}) {
  return (
      <>
      <Canvas
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
      <Light brightness={100} color={"white"} /> // highlight-line
      <Model gltfModel={gltfModel} position={[0, 0, 0]} />
    </>
  );
}


function Model({ gltfModel, ...props }) {

  const { nodes, materials } = gltfModel;
  
  console.log("model loaded")
  return (

    <group
              scale={10}
            >
      <primitive object={gltfModel.scene} />
      </group>
  );
}

function Light({ brightness, color }) {
  return (
    <rectAreaLight
      width={3}
      height={3}
      color={color}
      intensity={brightness}
      position={[-2, 0, 5]}
      lookAt={[0, 0, 0]}
      penumbra={1}
      castShadow
    />
  );
}
