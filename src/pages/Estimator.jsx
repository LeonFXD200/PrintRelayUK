import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  FileBox,
  Loader2,
  X,
  Ruler,
  Triangle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookmarkPlus,
  Bookmark,
  Eye,
  Plus,
  Minus,
  Layers3,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import QuoteBreakdown from '../components/estimator/QuoteBreakdown.jsx'

// three.js is heavy, so the 3D viewer is code-split: its chunk (incl. three.js)
// only loads on this page, keeping the initial app bundle small.
const ModelViewer = lazy(() => import('../components/estimator/ModelViewer.jsx'))
import {
  Select,
  TextField,
  Toggle,
  SegmentedControl,
  ColourPicker,
} from '../components/ui/Field.jsx'

import { parseSTL } from '../utils/stl.js'
import {
  estimatePrint,
  estimateVolumeFromFileSize,
  materialFraction,
} from '../utils/estimatePrintCost.js'
import { formatBytes, formatDims } from '../utils/format.js'
import { colourToHex } from '../utils/colours.js'

import { materials, getMaterial, DEFAULT_MATERIAL_ID } from '../data/materials.js'
import { printers, getPrinter, DEFAULT_PRINTER_ID } from '../data/printers.js'
import {
  dispatchOptions,
  shippingMethods,
  layerHeights,
  infillPresets,
  DEFAULT_DISPATCH_ID,
  DEFAULT_SHIPPING_ID,
  DEFAULT_LAYER_HEIGHT,
  DEFAULT_INFILL,
} from '../data/options.js'

import { useAuth } from '../context/AuthContext.jsx'
import { createJob, saveEstimate } from '../lib/mockDb.js'

const ACCEPTED = ['.stl', '.3mf', '.obj']
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

let fileSeq = 0
const nextId = () => `f${++fileSeq}_${Math.round(performance.now())}`

// Build triangle positions for a simple box — used for the "Try a sample" demo
// so visitors without an STL still get a real 3D preview + estimate.
function makeBoxPositions(w, h, d) {
  const x = w / 2,
    y = h / 2,
    z = d / 2
  // 8 corners
  const c = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ]
  // 12 triangles (2 per face)
  const faces = [
    [0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6],
    [0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2],
    [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0],
  ]
  const pos = new Float32Array(faces.length * 9)
  let p = 0
  for (const f of faces) for (const idx of f) pos.set(c[idx], p), (p += 3)
  return pos
}

// Per-file volume (cm³) used for the estimate: real parse if available, else a
// file-size proxy for formats we can't preview (3MF/OBJ).
// For STL files with a real volume, apply cubic scaling: doubling a linear
// dimension multiplies volume by 8.
function fileVolume(f) {
  if (f.parseState === 'error') return 0
  const s = f.scale ?? 1
  if (f.geometry?.volumeCm3) return f.geometry.volumeCm3 * s ** 3
  if (f.size) return estimateVolumeFromFileSize(f.size)
  return 0
}

// Sanity warnings shown inside the dimension editor for a given file entry.
// Pure function — no component state needed.
function getDimWarnings(f) {
  if (!f.geometry) return []
  const { dimensions, volumeCm3 } = f.geometry
  const { x, y, z } = dimensions
  const s = f.scale ?? 1
  const warnings = []
  const scaledMax = Math.max(x, y, z) * s
  if (scaledMax < 1 || scaledMax > 999) {
    warnings.push(
      'Dimensions look unusual — verify your CAD export uses millimetres.',
    )
  }
  const bboxVolCm3 = (x * y * z) / 1000
  if (bboxVolCm3 > 0 && volumeCm3 > bboxVolCm3 * 1.01) {
    warnings.push(
      'Volume may be inaccurate — the model may have open faces or mesh errors.',
    )
  }
  return warnings
}

// Build the prefill object handed to the /quote form via router state, so the
// customer doesn't retype their spec. No email client, no external app — the
// estimate simply travels with the in-site navigation.
function buildQuotePrefill({ files, material, materialId, colour, layerHeight, infill, printer, dispatchId, shippingId, whiteLabel, shipDirect, urgent, postcode, estimate }) {
  const dimsFor = (f) => {
    const s = f.scale ?? 1
    return f.geometry
      ? formatDims({ x: f.geometry.dimensions.x * s, y: f.geometry.dimensions.y * s, z: f.geometry.dimensions.z * s })
      : null
  }

  const fileLines = files
    .map((f) => {
      const s = f.scale ?? 1
      const dimsStr = dimsFor(f)
      const scalePart = s !== 1 ? ` (scaled ${parseFloat(s.toFixed(2))}×)` : ''
      return `• ${f.name} — qty ${f.qty}${dimsStr ? `, ${dimsStr}${scalePart}` : ''}`
    })
    .join('\n')

  const dispatch = dispatchOptions.find((d) => d.id === dispatchId)
  const shipping = shippingMethods.find((s) => s.id === shippingId)

  const hrs = estimate.estimatedHours
  const hh = Math.floor(hrs)
  const mm = Math.round((hrs - hh) * 60)
  const printTime = hh > 0 ? `${hh} h ${mm} min` : `${mm} min`

  const what_printed =
    files.length === 1
      ? `${files[0].name}${dimsFor(files[0]) ? ` (${dimsFor(files[0])})` : ''}`
      : `${files.length} parts:\n${fileLines}`

  // Everything the old email captured, now as structured notes the team reads
  // alongside the enquiry.
  const notes = [
    'Estimator summary (online estimate only — final price confirmed after file review):',
    fileLines,
    '',
    `Material: ${material.name} · Colour: ${colour}`,
    `Layer height: ${layerHeight} mm · Infill: ${infill}%`,
    `Printer profile: ${printer.name}`,
    `Dispatch: ${dispatch ? `${dispatch.name}${dispatch.window ? ` (${dispatch.window})` : ''}` : dispatchId}`,
    `Shipping: ${shipping ? `${shipping.name}${shipping.eta ? ` · ${shipping.eta}` : ''}` : shippingId}`,
    postcode ? `Delivery postcode: ${postcode}` : null,
    `White-label: ${whiteLabel ? 'Yes' : 'No'} · Ship direct: ${shipDirect ? 'Yes' : 'No'} · Urgent: ${urgent ? 'Yes' : 'No'}`,
    `Estimated weight: ~${estimate.estimatedGrams} g · Print time: ~${printTime}`,
    `Estimated total: £${estimate.total.toFixed(2)} inc. shipping`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return {
    what_printed,
    quantity: files.reduce((s, f) => s + f.qty, 0),
    material: materialId,
    colour,
    dimensions: files.length === 1 ? dimsFor(files[0]) || '' : '',
    notes,
  }
}

/**
 * Estimator page — the core flow. Handles multi-file upload + STL parsing, a
 * live 3D preview of the selected part, shared print options, and a
 * continuously recomputed combined quote.
 */
export default function Estimator() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // ----- files (one estimate per upload, quoted together) -----
  const [files, setFiles] = useState([]) // { id, name, size, geometry, parseState, qty }
  const [activeId, setActiveId] = useState(null) // which part is shown in the 3D viewer
  const [dragOver, setDragOver] = useState(false)

  // ----- print options (shared across every part in the order) -----
  const [materialId, setMaterialId] = useState(DEFAULT_MATERIAL_ID)
  const [colour, setColour] = useState(getMaterial(DEFAULT_MATERIAL_ID).colours[0])
  const [layerHeight, setLayerHeight] = useState(DEFAULT_LAYER_HEIGHT)
  const [infill, setInfill] = useState(DEFAULT_INFILL)
  const [printerId, setPrinterId] = useState(DEFAULT_PRINTER_ID)
  const [dispatchId, setDispatchId] = useState(DEFAULT_DISPATCH_ID)
  const [shippingId, setShippingId] = useState(DEFAULT_SHIPPING_ID)
  const [whiteLabel, setWhiteLabel] = useState(false)
  const [shipDirect, setShipDirect] = useState(false)
  const [urgent, setUrgent] = useState(false)
  const [postcode, setPostcode] = useState('')

  // ----- submission state -----
  const [confirmOwnership, setConfirmOwnership] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null) // created job
  const [errors, setErrors] = useState({})

  // ----- save-as-draft state -----
  const [savingDraft, setSavingDraft] = useState(false)
  const [savedDraft, setSavedDraft] = useState(null) // saved estimate

  // ----- dimension editor state -----
  // Which file's scaling panel is open (null = all closed).
  const [expandedScaleId, setExpandedScaleId] = useState(null)
  // The dimension input currently being edited: { id, axis, value }.
  const [dimDraft, setDimDraft] = useState(null)

  const material = getMaterial(materialId)
  const printer = getPrinter(printerId)

  // Keep colour valid when the material changes.
  useEffect(() => {
    if (!material.colours.includes(colour)) setColour(material.colours[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId])

  // Total printed volume across every part (× its quantity) — flat job fees are
  // only charged once, so we quote the whole batch as a single estimate.
  const combinedVolume = useMemo(
    () => files.reduce((sum, f) => sum + fileVolume(f) * f.qty, 0),
    [files],
  )
  const totalParts = useMemo(() => files.reduce((s, f) => s + f.qty, 0), [files])

  // Live estimate — recomputed whenever any input changes.
  const estimate = useMemo(() => {
    if (!files.length || combinedVolume <= 0) return null
    return estimatePrint({
      volumeCm3: combinedVolume,
      materialId,
      printerId,
      layerHeight,
      infill,
      quantity: 1, // per-part quantities are already folded into combinedVolume
      dispatchId,
      shippingId,
      whiteLabel,
      urgent,
    })
  }, [files.length, combinedVolume, materialId, printerId, layerHeight, infill, dispatchId, shippingId, whiteLabel, urgent])

  // Compatibility warnings (non-blocking).
  const warnings = []
  if (!printer.materials.includes(materialId)) {
    warnings.push(`${printer.name} isn't profiled for ${material.name}. We may use a better-suited machine.`)
  }
  if (material.requiresEnclosure && !printer.enclosed) {
    warnings.push(`${material.name} prints best in an enclosed printer, so consider the P1S or K1C.`)
  }

  const activeFile = files.find((f) => f.id === activeId) || files.find((f) => f.geometry) || null

  // --------------------------------------------------------------------------
  // File handling (multiple)
  // --------------------------------------------------------------------------
  function updateFile(id, patch) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  async function addFiles(fileList) {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    setSubmitted(null)
    setSavedDraft(null)

    for (const file of incoming) {
      const id = nextId()
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      const known = ACCEPTED.includes(ext)

      const entry = {
        id,
        name: file.name,
        size: file.size,
        geometry: null,
        parseState: !known ? 'error' : ext === '.stl' ? 'parsing' : 'unsupported',
        qty: 1,
        scale: 1,
      }
      setFiles((prev) => [...prev, entry])
      if (!activeId && known) setActiveId(id)

      // STL gets a real parse + live preview; other formats are size-estimated.
      if (known && ext === '.stl') {
        try {
          const buffer = await file.arrayBuffer()
          const parsed = parseSTL(buffer)
          updateFile(id, { geometry: parsed, parseState: 'done' })
          setActiveId((cur) => cur ?? id)
        } catch {
          updateFile(id, { geometry: null, parseState: 'error' })
        }
      }
    }
  }

  function loadSample() {
    const dims = { x: 60, y: 40, z: 30 }
    const id = nextId()
    setFiles((prev) => [
      ...prev,
      {
        id,
        name: `sample_widget_${prev.length + 1}.stl`,
        size: 612_000,
        geometry: {
          positions: makeBoxPositions(dims.x, dims.y, dims.z),
          dimensions: dims,
          volumeCm3: ((dims.x * dims.y * dims.z) / 1000) * 0.45,
          triangleCount: 12,
        },
        parseState: 'done',
        qty: 1,
        scale: 1,
      },
    ])
    setActiveId(id)
    setSubmitted(null)
    setSavedDraft(null)
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
    setSubmitted(null)
    setSavedDraft(null)
  }

  function setQty(id, qty) {
    updateFile(id, { qty: Math.min(1000, Math.max(1, qty || 1)) })
  }

  function setScale(id, newScale) {
    updateFile(id, { scale: Math.min(100, Math.max(0.01, newScale)) })
  }

  function clearAll() {
    setFiles([])
    setActiveId(null)
    setSubmitted(null)
    setSavedDraft(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const hasErrorFile = files.some((f) => f.parseState === 'error')
  const hasUnsupported = files.some((f) => f.parseState === 'unsupported')

  // --------------------------------------------------------------------------
  // Submit (request quote / confirm order)
  // --------------------------------------------------------------------------
  async function handleSubmit() {
    const errs = {}
    if (!files.length) errs.file = 'Upload at least one model file first.'
    if (!confirmOwnership) errs.confirm = 'Please confirm you own these files or have permission.'
    if (postcode && !UK_POSTCODE.test(postcode.trim())) errs.postcode = 'Enter a valid UK postcode.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const totalSize = files.reduce((s, f) => s + (f.size || 0), 0)
      const primary = files[0]
      const fileLabel =
        files.length === 1 ? primary.name : `${primary.name} + ${files.length - 1} more`

      const job = await createJob({
        user_id: user?.id || 'guest',
        file_name: fileLabel,
        file_size: totalSize,
        file_count: files.length,
        files: files.map((f) => ({ name: f.name, size: f.size, quantity: f.qty })),
        material: materialId,
        colour,
        layer_height: layerHeight,
        infill,
        printer_profile: printerId,
        quantity: totalParts,
        dispatch_speed: dispatchId,
        white_label: whiteLabel,
        ship_direct: shipDirect,
        urgent,
        shipping_method: shippingId,
        postcode: postcode.trim(),
        estimated_grams: estimate.estimatedGrams,
        estimated_hours: estimate.estimatedHours,
        estimated_material_cost: estimate.breakdown.materialCost,
        estimated_machine_cost: estimate.breakdown.machineCost,
        estimated_total: estimate.total,
      })
      setSubmitted(job)
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------------------------------
  // Save the current estimate as a draft (no ownership confirmation needed).
  // --------------------------------------------------------------------------
  async function handleSaveDraft() {
    if (!estimate || !files.length) return
    setSavingDraft(true)
    try {
      const primary = files[0]
      const draft = await saveEstimate({
        user_id: user?.id || 'guest',
        file_name:
          files.length === 1 ? primary.name : `${primary.name} + ${files.length - 1} more`,
        file_count: files.length,
        material: materialId,
        colour,
        layer_height: layerHeight,
        infill,
        printer_profile: printerId,
        quantity: totalParts,
        estimated_grams: estimate.estimatedGrams,
        estimated_hours: estimate.estimatedHours,
        estimated_total: estimate.total,
      })
      setSavedDraft(draft)
    } finally {
      setSavingDraft(false)
    }
  }

  // --------------------------------------------------------------------------
  // Validate inputs, then continue to the in-site /quote form with the estimate
  // pre-filled. No mailto, no window.open, no external email app.
  // --------------------------------------------------------------------------
  function handleRequestQuote() {
    const errs = {}
    if (!files.length) errs.file = 'Upload at least one model file first.'
    if (!confirmOwnership) errs.confirm = 'Please confirm you own these files or have permission.'
    if (postcode && !UK_POSTCODE.test(postcode.trim())) errs.postcode = 'Enter a valid UK postcode.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const prefill = buildQuotePrefill({
      files,
      material,
      materialId,
      colour,
      layerHeight,
      infill,
      printer,
      dispatchId,
      shippingId,
      whiteLabel,
      shipDirect,
      urgent,
      postcode: postcode.trim(),
      estimate,
    })
    navigate('/quote', { state: { prefill } })
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div>
      <PageHeader
        eyebrow="Instant estimator"
        title="Upload your models, get a price in seconds"
        subtitle="Add as many parts as you like. STL files get a live 3D preview and a real volume-based estimate; 3MF and OBJ are estimated from the file and confirmed after review."
      />

      <div className="section py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ============ LEFT: upload + parts + options ============ */}
          <div className="space-y-6 lg:col-span-2">
            {/* Upload + preview */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Upload zone (keyboard accessible) + sample button below */}
              <div className="flex flex-col gap-3">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload 3D model files. Drop files here or activate to browse."
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      inputRef.current?.click()
                    }
                  }}
                  className={`flex min-h-[260px] flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                    dragOver
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-ink/20 bg-paper-light hover:border-brand-500/50 hover:bg-brand-50/50'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED.join(',')}
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <UploadCloud size={28} />
                  </span>
                  <p className="mt-3 font-semibold text-ink">Drop your files here</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    or click to browse · STL, 3MF, OBJ · add as many as you like
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSample}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink/[0.05] px-3 py-2 text-xs font-medium text-brand-700 hover:bg-ink/[0.08]"
                >
                  <Sparkles size={13} /> Add a sample model
                </button>
              </div>

              {/* Preview — three.js viewer is lazy-loaded and isolated by an error boundary */}
              <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper-dark">
                <ErrorBoundary compact>
                  <Suspense
                    fallback={
                      <div className="flex h-full min-h-[260px] items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-brand-500" />
                      </div>
                    }
                  >
                    <ModelViewer
                      positions={activeFile?.geometry?.positions}
                      colour={colourToHex(colour)}
                      scale={activeFile?.scale ?? 1}
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* Parts list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card-glass overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-ink/[0.08] px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Layers3 size={16} className="text-brand-600" />
                      {files.length} {files.length === 1 ? 'part' : 'parts'} · {totalParts} total
                    </p>
                    <button
                      onClick={clearAll}
                      className="text-xs font-medium text-ink-soft hover:text-ink"
                    >
                      Clear all
                    </button>
                  </div>

                  <ul className="divide-y divide-ink/[0.06]">
                    {files.map((f) => {
                      const grams = Math.round(
                        fileVolume(f) * f.qty * materialFraction(infill) * material.densityGCm3,
                      )
                      const isActive = activeFile?.id === f.id
                      return (
                        <li
                          key={f.id}
                          className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                            isActive ? 'bg-brand-50/50' : ''
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
                            {f.parseState === 'parsing' ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <FileBox size={18} />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{f.name}</p>
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                              <span>{formatBytes(f.size)}</span>
                              {f.geometry && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedScaleId((cur) =>
                                        cur === f.id ? null : f.id,
                                      )
                                    }
                                    className={`inline-flex items-center gap-1 rounded transition hover:text-ink ${
                                      expandedScaleId === f.id ? 'text-brand-600' : ''
                                    }`}
                                    aria-label="Edit dimensions and scale"
                                  >
                                    <Ruler size={12} />
                                    {formatDims({
                                      x: f.geometry.dimensions.x * (f.scale ?? 1),
                                      y: f.geometry.dimensions.y * (f.scale ?? 1),
                                      z: f.geometry.dimensions.z * (f.scale ?? 1),
                                    })}
                                    {(f.scale ?? 1) !== 1 && (
                                      <span className="text-brand-600">
                                        ({parseFloat((f.scale ?? 1).toFixed(2))}×)
                                      </span>
                                    )}
                                    <ChevronDown
                                      size={11}
                                      className={`transition-transform ${
                                        expandedScaleId === f.id ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                  <span className="inline-flex items-center gap-1">
                                    <Triangle size={12} />
                                    {f.geometry.triangleCount.toLocaleString()}
                                  </span>
                                </>
                              )}
                              {f.parseState === 'error' && (
                                <span className="font-medium text-red-600">Unsupported file</span>
                              )}
                              {f.parseState === 'unsupported' && (
                                <span className="text-amber-600">Estimated from file size</span>
                              )}
                              {grams > 0 && <span>≈ {grams} g</span>}
                            </p>
                          </div>

                          {/* per-part quantity stepper */}
                          <div className="flex items-center rounded-lg border border-ink/15 bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setQty(f.id, f.qty - 1)}
                              className="px-2 py-1.5 text-ink-soft hover:text-ink disabled:opacity-40"
                              disabled={f.qty <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={f.qty}
                              onChange={(e) => setQty(f.id, Number(e.target.value))}
                              className="w-12 border-x border-ink/10 bg-transparent py-1 text-center text-sm text-ink [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                              aria-label={`Quantity for ${f.name}`}
                            />
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setQty(f.id, f.qty + 1)}
                              className="px-2 py-1.5 text-ink-soft hover:text-ink"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* preview toggle (STL only) */}
                          {f.geometry && (
                            <button
                              type="button"
                              onClick={() => setActiveId(f.id)}
                              aria-label="Preview this part"
                              className={`rounded-lg p-2 transition ${
                                isActive
                                  ? 'bg-brand-100 text-brand-700'
                                  : 'text-ink-soft hover:bg-ink/[0.06] hover:text-ink'
                              }`}
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => removeFile(f.id)}
                            className="rounded-lg p-2 text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X size={16} />
                          </button>

                          {/* Dimension editor — STL only, toggled by clicking the dims chip */}
                          {f.geometry && expandedScaleId === f.id && (
                            <div className="w-full border-t border-ink/[0.06] pt-3">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                                  Proportional scaling
                                </p>
                                {(f.scale ?? 1) !== 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setScale(f.id, 1)}
                                    className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink"
                                  >
                                    <RotateCcw size={11} /> Reset to original
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {['x', 'y', 'z'].map((axis) => {
                                  const base = f.geometry.dimensions[axis]
                                  const computed = (base * (f.scale ?? 1)).toFixed(2)
                                  const isDrafting =
                                    dimDraft?.id === f.id && dimDraft?.axis === axis
                                  return (
                                    <div key={axis}>
                                      <label className="mb-1 block text-xs font-medium text-ink-soft">
                                        {axis.toUpperCase()} (mm)
                                      </label>
                                      <div className="flex items-center overflow-hidden rounded-lg border border-ink/20 bg-white">
                                        <input
                                          type="number"
                                          min={0.01}
                                          step={0.1}
                                          value={isDrafting ? dimDraft.value : computed}
                                          onFocus={() =>
                                            setDimDraft({ id: f.id, axis, value: computed })
                                          }
                                          onChange={(e) =>
                                            setDimDraft((d) =>
                                              d ? { ...d, value: e.target.value } : null,
                                            )
                                          }
                                          onBlur={() => {
                                            const parsed = parseFloat(dimDraft?.value)
                                            if (
                                              dimDraft &&
                                              Number.isFinite(parsed) &&
                                              parsed > 0 &&
                                              base > 0
                                            ) {
                                              setScale(f.id, parsed / base)
                                            }
                                            setDimDraft(null)
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.currentTarget.blur()
                                            if (e.key === 'Escape') {
                                              setDimDraft(null)
                                              e.currentTarget.blur()
                                            }
                                          }}
                                          className="min-w-0 flex-1 border-none bg-transparent py-2 pl-2 pr-1 text-sm text-ink [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                          aria-label={`${axis.toUpperCase()} dimension in mm`}
                                        />
                                        <span className="pr-2 text-xs text-ink-soft">mm</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {getDimWarnings(f).map((w) => (
                                <p
                                  key={w}
                                  className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
                                >
                                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                  {w}
                                </p>
                              ))}
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {hasErrorFile && (
              <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle size={16} /> One or more files aren&apos;t supported. Please upload
                valid STL, 3MF or OBJ files.
              </p>
            )}
            {hasUnsupported && (
              <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <AlertTriangle size={16} /> Live 3D preview is STL-only. 3MF / OBJ parts are
                estimated from the file size and confirmed after review.
              </p>
            )}

            {/* Options */}
            <div className="card-glass space-y-6 p-6">
              <div>
                <h2 className="text-lg font-semibold text-ink">Print options</h2>
                <p className="mt-0.5 text-sm text-ink-soft">Applied to every part in this order.</p>
              </div>

              <Select
                label="Material"
                value={materialId}
                onChange={setMaterialId}
                options={materials.map((m) => ({ value: m.id, label: m.name }))}
                hint={material.use}
              />

              <ColourPicker label="Colour" value={colour} onChange={setColour} colours={material.colours} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Layer height"
                  value={String(layerHeight)}
                  onChange={(v) => setLayerHeight(Number(v))}
                  options={layerHeights.map((l) => ({ value: String(l.value), label: l.label }))}
                />
                <Select
                  label="Infill"
                  value={String(infill)}
                  onChange={(v) => setInfill(Number(v))}
                  options={infillPresets.map((i) => ({ value: String(i), label: `${i}%` }))}
                />
              </div>

              <Select
                label="Printer profile"
                value={printerId}
                onChange={setPrinterId}
                options={printers.map((p) => ({ value: p.id, label: p.name }))}
                hint={printer.blurb}
              />

              <SegmentedControl
                label="Dispatch speed"
                value={dispatchId}
                onChange={setDispatchId}
                options={dispatchOptions.map((d) => ({
                  value: d.id,
                  label: d.name,
                  sublabel: d.window,
                }))}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Shipping method"
                  value={shippingId}
                  onChange={setShippingId}
                  options={shippingMethods.map((s) => ({ value: s.id, label: `${s.name} · ${s.eta}` }))}
                />
                <TextField
                  label="Delivery postcode"
                  value={postcode}
                  onChange={setPostcode}
                  placeholder="e.g. M1 2AB"
                  error={errors.postcode}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Toggle
                  label="White-label packaging"
                  description="Neutral, unbranded"
                  checked={whiteLabel}
                  onChange={setWhiteLabel}
                />
                <Toggle
                  label="Ship direct to customer"
                  description="We post on your behalf"
                  checked={shipDirect}
                  onChange={setShipDirect}
                />
                <Toggle
                  label="Urgent job"
                  description="Prioritise in the queue"
                  checked={urgent}
                  onChange={setUrgent}
                />
              </div>

              {/* compatibility warnings */}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((w) => (
                    <p
                      key={w}
                      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
                    >
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============ RIGHT: sticky quote ============ */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {estimate ? (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-ink/[0.08] bg-white px-4 py-2.5 text-sm">
                    <span className="text-ink-soft">Order contents</span>
                    <span className="font-semibold text-ink">
                      {files.length} {files.length === 1 ? 'part' : 'parts'} · {totalParts} item
                      {totalParts === 1 ? '' : 's'}
                    </span>
                  </div>
                  <QuoteBreakdown estimate={estimate} />
                </>
              ) : (
                <div className="card-glass flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                  <FileBox size={32} className="text-ink-soft" />
                  <p className="mt-3 font-medium text-ink">Your estimate appears here</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Upload one or more models (or add the sample) to see weight, print time and a
                    combined price.
                  </p>
                </div>
              )}

              {/* Ownership confirmation + submit */}
              {estimate && !submitted && (
                <div className="card-glass space-y-4 p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={confirmOwnership}
                      onChange={(e) => setConfirmOwnership(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-ink/30 bg-white text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-ink-light">
                      I confirm I own these files or have permission to have them printed.{' '}
                      <Link to="/terms" className="text-brand-600 underline">
                        File responsibility
                      </Link>
                    </span>
                  </label>
                  {errors.confirm && <p className="text-xs text-red-600">{errors.confirm}</p>}
                  {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}

                  <button
                    type="button"
                    onClick={handleRequestQuote}
                    className="btn-primary w-full py-3"
                  >
                    Request a reviewed quote <ArrowRight size={18} />
                  </button>
                  <p className="text-center text-xs text-ink-soft">
                    Continues to our quick quote form with this estimate prefilled — no email app
                    needed. Online figure is an estimate; final pricing is confirmed after file
                    review.
                  </p>

                  {/* Save as draft — no commitment, lands in the dashboard */}
                  <div className="border-t border-ink/10 pt-4">
                    {savedDraft ? (
                      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                        <Bookmark size={16} /> Saved as {savedDraft.id}
                        {user ? (
                          <Link to="/dashboard" className="underline">
                            View
                          </Link>
                        ) : (
                          <Link to="/login" className="underline">
                            Sign in to view
                          </Link>
                        )}
                      </p>
                    ) : (
                      <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft}
                        className="btn-ghost w-full py-2.5"
                      >
                        {savingDraft ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Saving…
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={16} /> Save estimate as draft
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
