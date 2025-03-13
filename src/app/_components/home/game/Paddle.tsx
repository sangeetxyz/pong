import * as THREE from "three";
import type React from "react";
import { useCallback, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { easing } from "maath";
import useGame from "@/hooks/useGame";
import type { TGLTFResult } from "../Game";

type TPaddleProps = {
  position?: [number, number, number];
};

const Paddle = memo(({ position }: TPaddleProps) => {
  const api = useRef<React.ComponentRef<typeof RigidBody>>(null);
  const model = useRef<THREE.Group>(null);
  const { pong } = useGame();
  const { nodes, materials } = useGLTF(
    "/pingpong.glb",
  ) as unknown as TGLTFResult;
  const imageTexture = useTexture("/hud-white.png");
  const vec = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const contactForce = useCallback(
    (payload: { totalForceMagnitude: number }) => {
      pong(payload.totalForceMagnitude / 100);
      if (model.current) {
        model.current.position.y = -payload.totalForceMagnitude / 10000;
      }
    },
    [pong],
  );

  useFrame((state, delta) => {
    const camera = state.camera;
    const pointer = state.pointer;

    // Update paddle position based on pointer
    vec.current.set(pointer.x, pointer.y, 0.5).unproject(camera);
    dir.current.copy(vec.current).sub(camera.position).normalize();
    vec.current.add(dir.current.multiplyScalar(camera.position.length()));

    // Update physics body
    if (api.current) {
      api.current.setNextKinematicTranslation({
        x: vec.current.x,
        y: vec.current.y,
        z: 0,
      });

      api.current.setNextKinematicRotation({
        x: 0,
        y: 0,
        z: (pointer.x * Math.PI) / 10,
        w: 1,
      });
    }

    // Smooth model position
    if (model.current) {
      easing.damp3(model.current.position, [0, 0, 0], 0.2, delta);
    }

    // (Removed camera-movement logic — now in <Background />)
  });

  return (
    <RigidBody
      ccd
      canSleep={false}
      ref={api}
      type="kinematicPosition"
      colliders={false}
      onContactForce={contactForce}
      position={position}
    >
      <CylinderCollider args={[0.15, 1.75]} />
      <group ref={model} position={[0, 2, 0]} scale={0.15}>
        {/* <Text
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 1, 0]}
          fontSize={10}
        >
          {count}
        </Text> */}
        <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9, 9]} />
          <meshBasicMaterial map={imageTexture} transparent />
        </mesh>
        {/* {nodes.Bone &&
          nodes.Bone003 &&
          nodes.Bone006 &&
          nodes.Bone010 &&
          nodes.arm && (
            <group rotation={[1.88, -0.35, 2.32]} scale={[2.97, 2.97, 2.97]}>
              <primitive object={nodes.Bone} />
              <primitive object={nodes.Bone003} />
              <primitive object={nodes.Bone006} />
              <primitive object={nodes.Bone010} />
              <skinnedMesh
                castShadow
                receiveShadow
                material={materials.glove}
                material-roughness={1}
                geometry={(nodes.arm as THREE.Mesh).geometry}
                skeleton={(nodes.arm as THREE.SkinnedMesh).skeleton}
              />
            </group>
          )} */}
        {nodes.mesh &&
          nodes.mesh_1 &&
          nodes.mesh_2 &&
          nodes.mesh_3 &&
          nodes.mesh_4 && (
            <group rotation={[0, -0.04, 0]} scale={141.94}>
              <mesh
                castShadow
                receiveShadow
                material={materials.wood}
                geometry={(nodes.mesh as THREE.Mesh).geometry}
              />
              <mesh
                castShadow
                receiveShadow
                material={materials.side}
                geometry={(nodes.mesh_1 as THREE.Mesh).geometry}
              />
              <mesh
                castShadow
                receiveShadow
                material={materials.foam}
                geometry={(nodes.mesh_2 as THREE.Mesh).geometry}
              />
              <mesh
                castShadow
                receiveShadow
                material={materials.lower}
                geometry={(nodes.mesh_3 as THREE.Mesh).geometry}
              />
              <mesh
                castShadow
                receiveShadow
                material={materials.upper}
                geometry={(nodes.mesh_4 as THREE.Mesh).geometry}
              />
            </group>
          )}
      </group>
    </RigidBody>
  );
});

Paddle.displayName = "Paddle";

export default Paddle;
