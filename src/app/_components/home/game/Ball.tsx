import type React from "react";
import { useCallback, useRef, memo } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { RigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import useGame from "@/hooks/useGame";

type TBallProps = {
  position?: [number, number, number];
};

const Ball = memo(({ position = [0, 5, 0] }: TBallProps) => {
  const api = useRef<React.ComponentRef<typeof RigidBody>>(null);
  const map = useTexture("/crossp.jpg");
  const { endGame } = useGame();
  const { viewport } = useThree();

  const onCollisionEnter = useCallback(async () => {
    await endGame();
    if (api.current) {
      api.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
      api.current.setLinvel({ x: 0, y: 5, z: 0 }, true);
    }
  }, [endGame]);

  return (
    <group position={position}>
      <RigidBody
        ccd
        ref={api}
        angularDamping={0.8}
        restitution={1}
        canSleep={false}
        colliders={false}
        enabledTranslations={[true, true, false]}
      >
        <BallCollider args={[0.5]} />
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial map={map} />
        </mesh>
      </RigidBody>

      {/* Bottom boundary */}
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, -viewport.height * 2, 0]}
        restitution={2.1}
        onCollisionEnter={onCollisionEnter}
      >
        <CuboidCollider args={[1000, 2, 1000]} />
      </RigidBody>

      {/* Top boundary */}
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, viewport.height * 4, 0]}
        restitution={2.1}
        onCollisionEnter={onCollisionEnter}
      >
        <CuboidCollider args={[1000, 2, 1000]} />
      </RigidBody>
    </group>
  );
});

Ball.displayName = "Ball";

export default Ball;
