import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo } from "react";
import { easing } from "maath";
import * as THREE from "three";

const Background = memo(() => {
  const texture = useTexture("/bg1.jpg");
  useFrame((state, delta) => {
    const { pointer, camera } = state;

    easing.damp3(
      camera.position,
      [-pointer.x * 4, 2.5 + pointer.y * -4, 12],
      0.3,
      delta,
    );
    camera.lookAt(0, 0, 0);
  });
  return (
    <mesh rotation={[0, Math.PI / 1.25, 0]} scale={100}>
      <sphereGeometry />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
});

Background.displayName = "Background";

export default Background;
