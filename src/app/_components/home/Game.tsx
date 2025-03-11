import * as THREE from "three";
import type React from "react";
import { useCallback, useRef, memo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Text, useGLTF, useTexture } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CylinderCollider,
  CuboidCollider,
  BallCollider,
  type RigidBodyOptions,
  RigidBodyProps,
} from "@react-three/rapier";
import { easing } from "maath";
import {
  EffectComposer,
  N8AO,
  TiltShift2,
  ToneMapping,
} from "@react-three/postprocessing";
import { proxy, useSnapshot } from "valtio";
import { clamp } from "lodash-es";

// Define types
type GameState = {
  count: number;
  api: {
    pong: (velocity: number) => void;
    reset: () => void;
  };
};

type PaddleProps = {
  position?: [number, number, number];
};

type BallProps = {
  position?: [number, number, number];
};

type GLTFResult = {
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

// Create a reusable audio instance
const createAudio = (src: string): HTMLAudioElement => {
  if (typeof window === "undefined") return {} as HTMLAudioElement;
  return new Audio(src);
};

// Initialize game state
const state = proxy<GameState>({
  count: 0,
  api: {
    pong(velocity: number) {
      const ping = createAudio("/ping.mp3");
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      ping.play().catch(() => {}); // Handle autoplay restrictions
      if (velocity > 10) ++state.count;
    },
    reset() {
      state.count = 0;
    },
  },
});

// Memoized Paddle component
const Paddle = memo(({ position }: PaddleProps) => {
  const api = useRef<React.ComponentRef<typeof RigidBody>>(null);
  const model = useRef<THREE.Group>(null);
  const { count } = useSnapshot(state);
  const { nodes, materials } = useGLTF(
    "/pingpong.glb",
  ) as unknown as GLTFResult;
  const vec = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());

  const contactForce = useCallback(
    (payload: { totalForceMagnitude: number }) => {
      state.api.pong(payload.totalForceMagnitude / 100);
      if (model.current) {
        model.current.position.y = -payload.totalForceMagnitude / 10000;
      }
    },
    [],
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

    // Update camera position
    easing.damp3(
      camera.position,
      [-pointer.x * 4, 2.5 + -pointer.y * 4, 12],
      0.3,
      delta,
    );

    camera.lookAt(0, 0, 0);
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
        <Text
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 1, 0]}
          fontSize={10}
        >
          {count}
        </Text>
        {nodes.Bone &&
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
          )}
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

// Memoized Ball component
const Ball = memo(({ position = [0, 5, 0] }: BallProps) => {
  const api = useRef<React.ComponentRef<typeof RigidBody>>(null);
  const map = useTexture("/crossp.jpg");
  const { viewport } = useThree();

  const onCollisionEnter = useCallback(() => {
    state.api.reset();
    if (api.current) {
      api.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
      api.current.setLinvel({ x: 0, y: 5, z: 0 }, true);
    }
  }, []);

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

// Background component
const Background = memo(() => {
  const texture = useTexture("/bg.jpg");

  return (
    <mesh rotation={[0, Math.PI / 1.25, 0]} scale={100}>
      <sphereGeometry />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
});

// Rendering effects component
const Effects = memo(() => (
  <EffectComposer enableNormalPass={false}>
    <N8AO aoRadius={0.5} intensity={2} />
    <TiltShift2 blur={0.2} />
    <ToneMapping />
  </EffectComposer>
));

// Main Game component
const Game = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      camera={{ position: [0, 5, 12], fov: 45 }}
      performance={{ min: 0.5 }}
    >
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
      <Physics gravity={[0, -40, 0]} timeStep="vary">
        <Ball position={[0, 5, 0]} />
        <Paddle position={[0, 0, 0]} />
      </Physics>
      <Effects />
      <Background />
    </Canvas>
  );
};

export default Game;
