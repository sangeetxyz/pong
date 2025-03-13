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
  const physicsBody = useRef<React.ComponentRef<typeof RigidBody>>(null);
  const model = useRef<THREE.Group>(null);
  const { pong } = useGame();
  const { nodes, materials } = useGLTF(
    "/pingpong.glb",
  ) as unknown as TGLTFResult;
  const imageTexture = useTexture("/hud-white.png");

  const targetVec = useRef(new THREE.Vector3());
  const dirVec = useRef(new THREE.Vector3());
  const rotationQuat = useRef(new THREE.Quaternion());

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
    const { camera, pointer } = state;

    let pointerX = pointer.x;
    let pointerY = pointer.y;

    if (pointerX < -1) pointerX = -1;
    else if (pointerX > 1) pointerX = 1;

    if (pointerY < -1) pointerY = -1;
    else if (pointerY > 1) pointerY = 1;

    // Reuse existing vectors rather than recreating each frame
    targetVec.current.set(pointerX, pointerY, 0.5);
    targetVec.current.unproject(camera);

    dirVec.current.subVectors(targetVec.current, camera.position).normalize();
    targetVec.current
      .copy(camera.position)
      .addScaledVector(dirVec.current, camera.position.length());

    // Update physics only if position/rotation changed significantly
    if (physicsBody.current) {
      // Cache previous position to avoid unnecessary updates
      const currentPos = physicsBody.current.translation();
      const targetPos = {
        x: targetVec.current.x,
        y: targetVec.current.y,
        z: 0,
      };

      // Only update position if it changed significantly
      if (
        Math.abs(currentPos.x - targetPos.x) > 0.001 ||
        Math.abs(currentPos.y - targetPos.y) > 0.001
      ) {
        physicsBody.current.setNextKinematicTranslation(targetPos);
      }

      // Calculate rotation only when needed
      const angle = (pointerX * Math.PI) / 5;
      rotationQuat.current.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);

      physicsBody.current.setNextKinematicRotation(rotationQuat.current);
    }

    // Smooth model position with optimized easing
    if (
      model.current &&
      (model.current.position.x !== 0 ||
        model.current.position.y !== 0 ||
        model.current.position.z !== 0)
    ) {
      easing.damp3(model.current.position, [0, 0, 0], 0.2, delta);
    }
  });

  return (
    <RigidBody
      ccd
      canSleep={false}
      ref={physicsBody}
      type="kinematicPosition"
      colliders={false}
      onContactForce={contactForce}
      position={position}
    >
      <CylinderCollider args={[0.15, 1.75]} />
      <group ref={model} position={[0, 2, 0]} scale={0.15}>
        <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9, 9]} />
          <meshBasicMaterial map={imageTexture} transparent />
        </mesh>
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
