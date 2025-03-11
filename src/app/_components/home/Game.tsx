import * as THREE from "three";
import { type JSX, MemoExoticComponent, useCallback, useRef } from "react";
import {
  Canvas,
  type EventHandlers,
  type InstanceProps,
  type MathProps,
  type ReactProps,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Text, useGLTF, useTexture } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CylinderCollider,
  CuboidCollider,
  BallCollider,
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
import clamp from "lodash-es/clamp";
import type {
  Mutable,
  Overwrite,
} from "@react-three/fiber/dist/declarations/src/core/utils";

const ready = true;

const Game = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      camera={{ position: [0, 5, 12], fov: 45 }}
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
        {ready && <Ball position={[0, 5, 0]} />}
        <Paddle />
      </Physics>
      <EffectComposer enableNormalPass={false}>
        <N8AO aoRadius={0.5} intensity={2} />
        <TiltShift2 blur={0.2} />
        <ToneMapping />
      </EffectComposer>
      <Bg />
    </Canvas>
  );
};

export default Game;

const ping = new Audio("/ping.mp3");

const state = proxy({
  count: 0,
  api: {
    pong(velocity: number) {
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      ping.play();
      if (velocity > 10) ++state.count;
    },
    reset() {
      state.count = 0;
    },
  },
});

function Paddle({ vec = new THREE.Vector3(), dir = new THREE.Vector3() }) {
  const api = useRef(null);
  const model = useRef<THREE.Group>(null);
  const { count } = useSnapshot(state);
  const { nodes, materials } = useGLTF("/pingpong.glb");
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
    vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
    dir.copy(vec).sub(state.camera.position).normalize();
    vec.add(dir.multiplyScalar(state.camera.position.length()));
    api.current?.setNextKinematicTranslation({ x: vec.x, y: vec.y, z: 0 });
    api.current?.setNextKinematicRotation({
      x: 0,
      y: 0,
      z: (state.pointer.x * Math.PI) / 10,
      w: 1,
    });
    model.current &&
      easing.damp3(model.current.position, [0, 0, 0], 0.2, delta);
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 4, 2.5 + -state.pointer.y * 4, 12],
      0.3,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <RigidBody
      ccd
      canSleep={false}
      ref={api}
      type="kinematicPosition"
      colliders={false}
      onContactForce={contactForce}
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
        <group rotation={[1.88, -0.35, 2.32]} scale={[2.97, 2.97, 2.97]}>
          {nodes.Bone && <primitive object={nodes.Bone} />}
          {nodes.Bone003 && <primitive object={nodes.Bone003} />}
          {nodes.Bone006 && <primitive object={nodes.Bone006} />}
          {nodes.Bone010 && <primitive object={nodes.Bone010} />}
          {nodes.arm && (
            <skinnedMesh
              castShadow
              receiveShadow
              material={materials.glove}
              material-roughness={1}
              geometry={(nodes.arm as THREE.Mesh).geometry}
              skeleton={(nodes.arm as THREE.SkinnedMesh).skeleton}
            />
          )}
        </group>
        <group rotation={[0, -0.04, 0]} scale={141.94}>
          {nodes.mesh && (
            <mesh
              castShadow
              receiveShadow
              material={materials.wood}
              geometry={(nodes.mesh as THREE.Mesh).geometry}
            />
          )}
          {nodes.mesh_1 && (
            <mesh
              castShadow
              receiveShadow
              material={materials.side}
              geometry={(nodes.mesh_1 as THREE.Mesh).geometry}
            />
          )}
          {nodes.mesh_2 && (
            <mesh
              castShadow
              receiveShadow
              material={materials.foam}
              geometry={(nodes.mesh_2 as THREE.Mesh).geometry}
            />
          )}
          {nodes.mesh_3 && (
            <mesh
              castShadow
              receiveShadow
              material={materials.lower}
              geometry={(nodes.mesh_3 as THREE.Mesh).geometry}
            />
          )}
          {nodes.mesh_4 && (
            <mesh
              castShadow
              receiveShadow
              material={materials.upper}
              geometry={(nodes.mesh_4 as THREE.Mesh).geometry}
            />
          )}
        </group>
      </group>
    </RigidBody>
  );
}

type TBallProps = {
  position?: [number, number, number];
  props?: JSX.IntrinsicAttributes &
    Mutable<
      Overwrite<
        Partial<
          Overwrite<
            THREE.Group<THREE.Object3DEventMap>,
            MathProps<THREE.Group<THREE.Object3DEventMap>> &
              ReactProps<THREE.Group<THREE.Object3DEventMap>> &
              Partial<EventHandlers>
          >
        >,
        Omit<
          InstanceProps<
            THREE.Group<THREE.Object3DEventMap>,
            typeof THREE.Group
          >,
          "object"
        >
      >
    >;
};

function Ball(props: TBallProps) {
  const api = useRef(null);
  const map = useTexture("/crossp.jpg");
  const { viewport } = useThree();
  const onCollisionEnter = useCallback(() => {
    state.api.reset();
    if (api.current) {
      api.current.setTranslation({ x: 0, y: 5, z: 0 });
      api.current.setLinvel({ x: 0, y: 5, z: 0 });
    }
  }, []);
  return (
    <group {...props}>
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
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, -viewport.height * 2, 0]}
        restitution={2.1}
        onCollisionEnter={onCollisionEnter}
      >
        <CuboidCollider args={[1000, 2, 1000]} />
      </RigidBody>
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
}

function Bg() {
  const texture = useTexture("/bg.jpg");
  return (
    <mesh rotation={[0, Math.PI / 1.25, 0]} scale={100}>
      <sphereGeometry />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}
