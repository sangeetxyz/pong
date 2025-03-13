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

  const prevPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());

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

    // Store previous position
    prevPosition.current.copy(currentPosition.current);

    // Your existing pointer clamping
    const pointerX = THREE.MathUtils.clamp(pointer.x, -1, 1);
    const pointerY = THREE.MathUtils.clamp(pointer.y, -1, 1);

    // Your existing target calculation
    targetVec.current.set(pointerX, pointerY, 0.5);
    targetVec.current.unproject(camera);
    dirVec.current.subVectors(targetVec.current, camera.position).normalize();
    targetVec.current
      .copy(camera.position)
      .addScaledVector(dirVec.current, camera.position.length());

    // Update current target position
    currentPosition.current.set(targetVec.current.x, targetVec.current.y, 0);

    // Create interpolated position
    const interpPosition = new THREE.Vector3();
    interpPosition
      .copy(prevPosition.current)
      .lerp(currentPosition.current, 0.7);

    if (physicsBody.current) {
      const targetPos = {
        x: interpPosition.x,
        y: interpPosition.y,
        z: 0,
      };

      physicsBody.current.setNextKinematicTranslation(targetPos);

      // Existing rotation code
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
      linearDamping={5}
      angularDamping={5}
      friction={0.7}
      restitution={0.2}
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
