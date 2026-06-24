// ===========================================================================
// Lightweight STL parser (binary + ASCII)
// ===========================================================================
// Returns the triangle positions (for three.js rendering) plus a real volume
// and bounding-box estimate. This is what makes the estimator genuinely useful
// for STL files — volume feeds straight into estimatePrintCost().
//
// For 3MF/OBJ we don't parse here; the estimator falls back to a file-size
// based volume guess and the UI flags it clearly.

/**
 * @param {ArrayBuffer} buffer
 * @returns {{positions: Float32Array, triangleCount: number,
 *            dimensions: {x:number,y:number,z:number},
 *            volumeCm3: number}}
 */
export function parseSTL(buffer) {
  return isBinarySTL(buffer) ? parseBinarySTL(buffer) : parseAsciiSTL(buffer)
}

// Binary STL = 80-byte header + uint32 count + 50 bytes per triangle.
function isBinarySTL(buffer) {
  if (buffer.byteLength < 84) return false
  const view = new DataView(buffer)
  const faces = view.getUint32(80, true)
  const expected = 84 + faces * 50
  if (expected === buffer.byteLength) return true

  // Some binary files mis-report; also some ASCII files are short. As a
  // tie-breaker, look for the ASCII keyword "solid" at the very start.
  const header = new TextDecoder().decode(new Uint8Array(buffer, 0, 5)).toLowerCase()
  return header !== 'solid'
}

function parseBinarySTL(buffer) {
  const view = new DataView(buffer)
  const faces = view.getUint32(80, true)
  const positions = new Float32Array(faces * 9)

  let offset = 84
  let p = 0
  let volume = 0
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]

  for (let i = 0; i < faces; i++) {
    offset += 12 // skip the 3-float normal
    const v = []
    for (let j = 0; j < 3; j++) {
      const x = view.getFloat32(offset, true)
      const y = view.getFloat32(offset + 4, true)
      const z = view.getFloat32(offset + 8, true)
      offset += 12
      positions[p++] = x
      positions[p++] = y
      positions[p++] = z
      v.push([x, y, z])
      updateBounds(min, max, x, y, z)
    }
    offset += 2 // attribute byte count
    volume += signedVolume(v[0], v[1], v[2])
  }

  return finalise(positions, faces, min, max, volume)
}

function parseAsciiSTL(buffer) {
  const text = new TextDecoder().decode(buffer)
  const vertexRegex = /vertex\s+([\-+0-9.eE]+)\s+([\-+0-9.eE]+)\s+([\-+0-9.eE]+)/g
  const verts = []
  let m
  while ((m = vertexRegex.exec(text)) !== null) {
    verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])])
  }

  const faces = Math.floor(verts.length / 3)
  const positions = new Float32Array(faces * 9)
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  let volume = 0
  let p = 0

  for (let i = 0; i < faces; i++) {
    const a = verts[i * 3]
    const b = verts[i * 3 + 1]
    const c = verts[i * 3 + 2]
    for (const vtx of [a, b, c]) {
      positions[p++] = vtx[0]
      positions[p++] = vtx[1]
      positions[p++] = vtx[2]
      updateBounds(min, max, vtx[0], vtx[1], vtx[2])
    }
    volume += signedVolume(a, b, c)
  }

  return finalise(positions, faces, min, max, volume)
}

// Signed volume of the tetrahedron (origin, a, b, c); summed over all faces of
// a closed mesh this yields the enclosed volume (in mm^3 for STL units).
function signedVolume(a, b, c) {
  return (
    (-c[0] * b[1] * a[2] +
      b[0] * c[1] * a[2] +
      c[0] * a[1] * b[2] -
      a[0] * c[1] * b[2] -
      b[0] * a[1] * c[2] +
      a[0] * b[1] * c[2]) /
    6
  )
}

function updateBounds(min, max, x, y, z) {
  if (x < min[0]) min[0] = x
  if (y < min[1]) min[1] = y
  if (z < min[2]) min[2] = z
  if (x > max[0]) max[0] = x
  if (y > max[1]) max[1] = y
  if (z > max[2]) max[2] = z
}

function finalise(positions, triangleCount, min, max, volume) {
  const dimensions = {
    x: max[0] - min[0],
    y: max[1] - min[1],
    z: max[2] - min[2],
  }
  // STL units are conventionally millimetres -> volume mm^3 -> cm^3.
  const volumeCm3 = Math.abs(volume) / 1000
  return { positions, triangleCount, dimensions, volumeCm3 }
}
