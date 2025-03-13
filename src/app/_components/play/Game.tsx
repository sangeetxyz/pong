import type * as THREE from "three";
import type React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import useGame from "@/hooks/useGame";
import Paddle from "./game/Paddle";
import Ball from "./game/Ball";
import Loader from "./game/Loader";
import Effects from "./game/Effects";
import Background from "./game/Background";

export type TGLTFResult = {
  nodes: {
    Bone?: THREE.Bone;
    Bone003?: THREE.Bone;
    Bone006?: THREE.Bone;
    Bone010?: THREE.Bone;
    arm?: THREE.SkinnedMesh;
    mesh?: THREE.Mesh;
    mesh_1?: THREE.Mesh;
    mesh_2?: THREE.Mesh;
    mesh_3?: THREE.Mesh;
    mesh_4?: THREE.Mesh;
  };
  materials: {
    glove: THREE.Material;
    wood: THREE.Material;
    side: THREE.Material;
    foam: THREE.Material;
    lower: THREE.Material;
    upper: THREE.Material;
  };
};

const Game = () => {
  const { isPlaying } = useGame();
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      camera={{ position: [0, 5, 12], fov: 45 }}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={<Loader />}>
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight
          decay={0}
          position={[-10, 15, -5]}
          angle={1}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={1024}
          shadow-bias={-0.0001}
        />
        {isPlaying && (
          <Physics gravity={[0, -40, 0]} timeStep="vary">
            <Ball position={[0, 5, 0]} />
            <Paddle position={[0, 0, 0]} />
          </Physics>
        )}
        <Effects />
        <Background />
        <Stats showPanel={0} />
      </Suspense>
    </Canvas>
  );
};

export default Game;
