// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";

// function SkeletonViewer({ keypoints }) {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       600 / 400,
//       0.1,
//       1000
//     );

//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(600, 400);
//     mountRef.current.appendChild(renderer.domElement);

//     const geometry = new THREE.SphereGeometry(0.05);
//     const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

//     const joints = [];

//     if (keypoints) {
//       keypoints[0].forEach((point) => {
//         const sphere = new THREE.Mesh(geometry, material);
//         sphere.position.set(point[0], point[1], point[2] || 0);
//         scene.add(sphere);
//         joints.push(sphere);
//       });
//     }

//     camera.position.z = 3;

//     const animate = () => {
//       requestAnimationFrame(animate);
//       renderer.render(scene, camera);
//     };

//     animate();

//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, [keypoints]);

//   return <div ref={mountRef}></div>;
// }

// export default SkeletonViewer;







import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./SkeletonViewer.css";

/**
 * SkeletonViewer — Three.js ASL skeleton renderer
 *
 * Props:
 *   keypoints — array of frames, each frame is an array of { x, y, z } joints
 *   Example shape:
 *   [
 *     [ {x:0,y:1,z:0}, {x:0.2,y:0.8,z:0}, ... ],  // frame 0
 *     [ {x:0,y:1,z:0}, {x:0.3,y:0.7,z:0}, ... ],  // frame 1
 *   ]
 *
 *  Joint index convention (adjust to match your ML model's output):
 *   0  = head
 *   1  = neck
 *   2  = left shoulder    3  = right shoulder
 *   4  = left elbow       5  = right elbow
 *   6  = left wrist       7  = right wrist
 *   8  = left hip         9  = right hip
 *   10 = left knee        11 = right knee
 *   12 = left ankle       13 = right ankle
 */

// Which joints to connect with bones
const BONES = [
  [0, 1],   // head → neck
  [1, 2],   // neck → left shoulder
  [1, 3],   // neck → right shoulder
  [2, 4],   // left shoulder → left elbow
  [3, 5],   // right shoulder → right elbow
  [4, 6],   // left elbow → left wrist
  [5, 7],   // right elbow → right wrist
  [1, 8],   // neck → left hip
  [1, 9],   // neck → right hip
  [8, 10],  // left hip → left knee
  [9, 11],  // right hip → right knee
  [10, 12], // left knee → left ankle
  [11, 13], // right knee → right ankle
];

const JOINT_COLOR = 0xffffff;
const BONE_COLOR  = 0xc8b4ff;   // soft lavender
const BG_COLOR    = 0x1a1523;   // matches --ink
const FPS         = 24;

export default function SkeletonViewer({ keypoints }) {
  const mountRef    = useRef(null);
  const sceneRef    = useRef(null);
  const rendererRef = useRef(null);
  const frameRef    = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    const W  = el.clientWidth;
    const H  = el.clientHeight;

    // ── Scene ──
    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    sceneRef.current = scene;

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 1, 4);
    camera.lookAt(0, 1, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    // ── Joint spheres ──
    const jointMat    = new THREE.MeshStandardMaterial({ color: JOINT_COLOR });
    const jointGeo    = new THREE.SphereGeometry(0.04, 12, 12);
    const jointMeshes = [];

    const jointCount = keypoints?.[0]?.length ?? 14;
    for (let i = 0; i < jointCount; i++) {
      const mesh = new THREE.Mesh(jointGeo, jointMat);
      scene.add(mesh);
      jointMeshes.push(mesh);
    }

    // ── Bone lines ──
    const boneMat   = new THREE.LineBasicMaterial({ color: BONE_COLOR, linewidth: 2 });
    const boneLines = BONES.map(([a, b]) => {
      const geo  = new THREE.BufferGeometry();
      const pts  = new Float32Array(6); // 2 points × 3 coords
      geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      const line = new THREE.Line(geo, boneMat);
      scene.add(line);
      return { line, pts };
    });

    // ── Update joints + bones for a given frame ──
    function applyFrame(frame) {
      frame.forEach((pt, i) => {
        if (jointMeshes[i]) jointMeshes[i].position.set(pt.x, pt.y, pt.z);
      });

      BONES.forEach(([a, b], i) => {
        if (!frame[a] || !frame[b]) return;
        const { pts } = boneLines[i];
        pts[0] = frame[a].x; pts[1] = frame[a].y; pts[2] = frame[a].z;
        pts[3] = frame[b].x; pts[4] = frame[b].y; pts[5] = frame[b].z;
        boneLines[i].line.geometry.attributes.position.needsUpdate = true;
      });
    }

    // ── Animation loop ──
    let currentFrame = 0;
    let lastTick     = 0;
    const interval   = 1000 / FPS;

    function animate(now) {
      frameRef.current = requestAnimationFrame(animate);

      if (keypoints?.length) {
        if (now - lastTick >= interval) {
          applyFrame(keypoints[currentFrame]);
          currentFrame = (currentFrame + 1) % keypoints.length;
          lastTick = now;
        }
      }

      renderer.render(scene, camera);
    }
    frameRef.current = requestAnimationFrame(animate);

    // ── Resize handler ──
    function onResize() {
      const W = el.clientWidth, H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }
    window.addEventListener("resize", onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [keypoints]);

  return (
    <div className="skeleton-viewer" ref={mountRef}>
      {!keypoints && (
        <div className="skeleton-placeholder">
          <span>🤲</span>
          <p>Animation will appear here</p>
        </div>
      )}
    </div>
  );
}