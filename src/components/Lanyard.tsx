'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import './Lanyard.css';

// Next.js serves these binary assets from `public`, avoiding a custom Webpack
// loader or Vite-specific asset configuration for `.glb` files.
const CARD_GLB = '/lanyard/card.glb';
const DEFAULT_LANYARD_IMAGE = '/lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  /** Camera position override for desktop (≥1024px) viewports. */
  desktopPosition?: [number, number, number];
  /** FOV override for desktop (≥1024px) viewports. */
  desktopFov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

function CameraSync({
  defaultPosition,
  defaultFov,
  desktopPosition,
  desktopFov
}: {
  defaultPosition: [number, number, number];
  defaultFov: number;
  desktopPosition: [number, number, number];
  desktopFov: number;
}) {
  const { camera } = useThree();
  useEffect(() => {
    const pCam = camera as THREE.PerspectiveCamera;
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    if (w < 768) {
      pCam.position.set(0, 0.46, 23);
      pCam.fov = 17.5;
    } else if (w >= 1024) {
      pCam.position.set(desktopPosition[0], desktopPosition[1], desktopPosition[2]);
      pCam.fov = desktopFov;
    } else {
      pCam.position.set(defaultPosition[0], defaultPosition[1], defaultPosition[2]);
      pCam.fov = defaultFov;
    }
    pCam.updateProjectionMatrix();

    const handleResize = () => {
      const newW = window.innerWidth;
      if (newW < 768) {
        pCam.position.set(0, 0.46, 23);
        pCam.fov = 17.5;
      } else if (newW >= 1024) {
        pCam.position.set(desktopPosition[0], desktopPosition[1], desktopPosition[2]);
        pCam.fov = desktopFov;
      } else {
        pCam.position.set(defaultPosition[0], defaultPosition[1], defaultPosition[2]);
        pCam.fov = defaultFov;
      }
      pCam.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);
  return null;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 14,
  desktopPosition = [0, 0.5, 26] as [number, number, number],
  desktopFov = 13,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = (): void => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsDesktop(w >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas reads camera props only once on mount; CameraSync keeps it in sync
  // on subsequent breakpoint changes.
  const initCamPos: [number, number, number] = isMobile ? [0, 0.46, 23] : isDesktop ? desktopPosition : position;
  const initCamFov = isMobile ? 17.5 : isDesktop ? desktopFov : fov;

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: initCamPos, fov: initCamFov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        style={{ touchAction: 'none' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <CameraSync
          defaultPosition={position}
          defaultFov={fov}
          desktopPosition={desktopPosition}
          desktopFov={desktopFov}
        />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            isDesktop={isDesktop}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  isDesktop?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  isDesktop = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  // Stable refs for scratch vectors — avoids allocating new objects every frame
  // which previously caused drag calculations to use stale/wrong values.
  const vec = useRef(new THREE.Vector3());
  const ang = useRef(new THREE.Vector3());
  const rot = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }

    return body.lerped;
  };

  const { nodes, materials } = useGLTF(CARD_GLB) as any;
  const texture = useTexture(lanyardImage || DEFAULT_LANYARD_IMAGE);
  const repeatedTexture = useMemo(() => {
    const nextTexture = texture.clone();
    nextTexture.wrapS = nextTexture.wrapT = THREE.RepeatWrapping;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [texture]);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image as any;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: any, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
  const [curve] = useState(() => {
    const nextCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    nextCurve.curveType = 'chordal';
    return nextCurve;
  });
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  const ropeJointParams = useMemo(
    () => [[0, 0, 0], [0, 0, 0], 1] as [[0,0,0],[0,0,0],number],
    []
  );
  useRopeJoint(fixed, j1, ropeJointParams);
  useRopeJoint(j1, j2, ropeJointParams);
  useRopeJoint(j2, j3, ropeJointParams);
  // Scale the card visual group per breakpoint. The spherical joint anchor is
  // kept at a stable value (1.45) that sits inside the CuboidCollider bounds
  // (half-height 1.125 → top at +1.125). Rapier requires the joint anchor to
  // be inside or very close to the collider; a value far outside causes NaN.
  // Visually the rope terminates at j3 which already lines up near the clip.
  const cardScale = isMobile ? 2.6 : isDesktop ? 2.8 : 2.25;
  const sphericalJointParams = useMemo(
    () => [[0, 0, 0], [0, 1.45, 0]] as [[0,0,0],[0,number,0]],
    []
  );
  useSphericalJoint(j3, card, sphericalJointParams);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.current.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.current.copy(vec.current).sub(state.camera.position).normalize();
      vec.current.add(dir.current.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.current.x - dragged.x,
        y: vec.current.y - dragged.y,
        z: vec.current.z - dragged.z
      });
    }
    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      [j1, j2].forEach(ref => {
        const lerped = getLerped(ref.current);
        const trans = ref.current.translation();
        if (Number.isFinite(trans.x) && Number.isFinite(trans.y) && Number.isFinite(trans.z)) {
          const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(trans)));
          lerped.lerp(trans, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
        }
      });
      const p0 = j3.current.translation();
      const p1 = getLerped(j2.current);
      const p2 = getLerped(j1.current);
      const p3 = fixed.current.translation();
      if (
        Number.isFinite(p0.x) && Number.isFinite(p0.y) && Number.isFinite(p0.z) &&
        Number.isFinite(p1.x) && Number.isFinite(p1.y) && Number.isFinite(p1.z) &&
        Number.isFinite(p2.x) && Number.isFinite(p2.y) && Number.isFinite(p2.z) &&
        Number.isFinite(p3.x) && Number.isFinite(p3.y) && Number.isFinite(p3.z)
      ) {
        curve.points[0].copy(p0);
        curve.points[1].copy(p1);
        curve.points[2].copy(p2);
        curve.points[3].copy(p3);
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      }
      const curAngvel = card.current.angvel();
      const curRot = card.current.rotation();
      if (
        Number.isFinite(curAngvel.x) && Number.isFinite(curAngvel.y) && Number.isFinite(curAngvel.z) &&
        Number.isFinite(curRot.x) && Number.isFinite(curRot.y) && Number.isFinite(curRot.z) && Number.isFinite(curRot.w)
      ) {
        ang.current.copy(curAngvel);
        rot.current.copy(curRot);
        card.current.setAngvel({ x: ang.current.x, y: ang.current.y - rot.current.y * 0.25, z: ang.current.z }, true);
      }
    }
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={cardScale}
            position={[0, -1.2, -0.05]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); hover(true); }}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              (e.target as Element).setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.current.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: new THREE.Vector2(1000, 1000) }]}
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={repeatedTexture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth * (isMobile ? 1.35 : 1)}
        />
      </mesh>
    </>
  );
}
