import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import styles from "../styles/studio.module.css";
import { OrbitControls } from '@react-three/drei'

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useGLTF, useGLB } from "@react-three/drei";

// export function CanvasComponent({setCanvasRef}) {


//     return (
//         <>
//         <Canvas
//             gl={{ preserveDrawingBuffer: true }}
//         >
//             <Scene setCanvasRef={setCanvasRef}/>
//             <OrbitControls dampingFactor={0.3} />
//         </Canvas>

//         </>
//       )
// }

// function Scene({setCanvasRef}) {
//   const gl = useThree((state) => state.gl)
//   setCanvasRef(gl.domElement);


//   return (
//     <>
//       <ambientLight />
//       <pointLight position={[10, 10, 10]} />
     
//       <Model position={[0, 0, 0]} /> 
//     </>
//   )
// }



//   function Model(props) {
//     const { nodes, materials } = useGLTF("/sneaker.glb");
//     return (
//       <group {...props} dispose={null}>
//         <group rotation={[-Math.PI / 2, 0, 0]}>
//           <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
//             <group
//               position={[0, 5.13, 0]}
//               rotation={[-Math.PI / 2, 0, 0]}
//               scale={100}
//             >
//               <mesh
//                 geometry={nodes.Plane_Material_0.geometry}
//                 material={materials.Material}
//               />
//             </group>
//           </group>
//         </group>
//       </group>
//     );
//   }
  
//   useGLTF.preload("/sneaker.glb");



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


// function Scene({ setCanvasRef, gltfModel }) {
//   const gl = useThree((state) => state.gl)
//   setCanvasRef(gl.domElement);
  
//   return (
//       <>

//           <Model gltfModel={gltfModel}  position={[0, 0, 0]} /> 
//       </>
//   )
// }


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

  console.log(gltfModel)


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
// useGLTF.preload("/sneaker.glb");