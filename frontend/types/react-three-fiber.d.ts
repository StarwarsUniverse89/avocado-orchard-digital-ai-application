import { Object3DNode, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend JSX namespace with Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      instancedMesh: Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>;
      line: Object3DNode<THREE.Line, typeof THREE.Line>;
      lineSegments: Object3DNode<THREE.LineSegments, typeof THREE.LineSegments>;
      points: Object3DNode<THREE.Points, typeof THREE.Points>;
      sprite: Object3DNode<THREE.Sprite, typeof THREE.Sprite>;
      
      // Geometries
      boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      cylinderGeometry: Object3DNode<THREE.CylinderGeometry, typeof THREE.CylinderGeometry>;
      planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      circleGeometry: Object3DNode<THREE.CircleGeometry, typeof THREE.CircleGeometry>;
      coneGeometry: Object3DNode<THREE.ConeGeometry, typeof THREE.ConeGeometry>;
      torusGeometry: Object3DNode<THREE.TorusGeometry, typeof THREE.TorusGeometry>;
      
      // Materials
      meshBasicMaterial: Object3DNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshPhysicalMaterial: Object3DNode<THREE.MeshPhysicalMaterial, typeof THREE.MeshPhysicalMaterial>;
      meshLambertMaterial: Object3DNode<THREE.MeshLambertMaterial, typeof THREE.MeshLambertMaterial>;
      meshPhongMaterial: Object3DNode<THREE.MeshPhongMaterial, typeof THREE.MeshPhongMaterial>;
      lineBasicMaterial: Object3DNode<THREE.LineBasicMaterial, typeof THREE.LineBasicMaterial>;
      pointsMaterial: Object3DNode<THREE.PointsMaterial, typeof THREE.PointsMaterial>;
      
      // Lights
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
      spotLight: Object3DNode<THREE.SpotLight, typeof THREE.SpotLight>;
      hemisphereLight: Object3DNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>;
      
      // Helpers
      gridHelper: Object3DNode<THREE.GridHelper, typeof THREE.GridHelper>;
      axesHelper: Object3DNode<THREE.AxesHelper, typeof THREE.AxesHelper>;
      
      // Camera
      perspectiveCamera: Object3DNode<THREE.PerspectiveCamera, typeof THREE.PerspectiveCamera>;
      orthographicCamera: Object3DNode<THREE.OrthographicCamera, typeof THREE.OrthographicCamera>;
    }
  }
}

// Made with Bob
