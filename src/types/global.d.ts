import type * as THREE from 'three';

export {};

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export class MeshLineGeometry extends THREE.BufferGeometry {
    setPoints(points: number[] | Float32Array | THREE.Vector3[], wcb?: (p: number) => number): void;
  }
  export class MeshLineMaterial extends THREE.Material {
    color: THREE.Color;
    lineWidth: number;
    resolution: THREE.Vector2;
    useMap: number | boolean;
    map: THREE.Texture | null;
    repeat: THREE.Vector2;
    constructor(parameters?: Record<string, unknown>);
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: {
        attach?: string;
        args?: unknown[];
      };
      meshLineMaterial: {
        transparent?: boolean;
        opacity?: number;
        color?: THREE.ColorRepresentation;
        depthTest?: boolean;
        resolution?: [number, number] | THREE.Vector2;
        useMap?: number;
        map?: THREE.Texture | null;
        repeat?: [number, number] | THREE.Vector2;
        lineWidth?: number;
      };
    }
  }
}
