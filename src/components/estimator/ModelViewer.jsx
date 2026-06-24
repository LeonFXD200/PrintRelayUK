import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Box } from 'lucide-react'

/**
 * Renders a parsed STL mesh (Float32Array of triangle positions) with three.js.
 * Auto-centres, scales to fit, lights the scene and enables orbit controls.
 * Falls back to a placeholder when no geometry is available (e.g. 3MF/OBJ).
 */
export default function ModelViewer({ positions, colour = '#c25a32' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!positions || !mountRef.current) return
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight || 320

    // --- scene / camera / renderer ---
    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // --- geometry from parsed positions ---
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()

    // centre the mesh on the origin
    const box = geometry.boundingBox
    const center = new THREE.Vector3()
    box.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)

    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colour),
      metalness: 0.15,
      roughness: 0.55,
      flatShading: false,
    })
    const mesh = new THREE.Mesh(geometry, material)
    // STL is usually Z-up; rotate so it sits naturally for the viewer.
    mesh.rotation.x = -Math.PI / 2
    scene.add(mesh)

    // subtle wireframe overlay for a "technical" look
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 30),
      new THREE.LineBasicMaterial({ color: 0x1c1813, transparent: true, opacity: 0.06 }),
    )
    wire.rotation.x = -Math.PI / 2
    scene.add(wire)

    // --- lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(1, 1.4, 1)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x1f6b5b, 0.5)
    rim.position.set(-1.2, 0.4, -1)
    scene.add(rim)

    // ground grid for scale
    const grid = new THREE.GridHelper(maxDim * 2.4, 16, 0xb8ac93, 0xd6cdba)
    grid.position.y = -size.y / 2 - maxDim * 0.02
    scene.add(grid)

    // --- camera framing ---
    camera.position.set(maxDim * 1.4, maxDim * 1.1, maxDim * 1.6)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.4
    controls.enablePan = false

    // --- render loop ---
    let frameId
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    // --- responsive resize ---
    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight || 320
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // --- cleanup ---
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      geometry.dispose()
      material.dispose()
      wire.geometry.dispose()
      wire.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [positions, colour])

  if (!positions) {
    return (
      <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-ink/15 bg-paper-dark p-6 text-center">
        <Box size={34} className="text-ink-soft/60" />
        <p className="mt-3 text-sm font-medium text-ink">No 3D preview available</p>
        <p className="mt-1 text-xs text-ink-soft">
          Live preview supports STL files. We still estimate 3MF / OBJ jobs from the file.
        </p>
      </div>
    )
  }

  return <div ref={mountRef} className="h-full min-h-[260px] w-full rounded-xl" />
}
