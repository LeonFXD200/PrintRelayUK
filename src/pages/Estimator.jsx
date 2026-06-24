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
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import QuoteBreakdown from '../components/estimator/QuoteBreakdown.jsx'

// three.js is heavy, so the 3D viewer is code-split: its chunk (incl. three.js)
// only loads on this page, keeping the initial app bundle small.
const ModelViewer = lazy(() => import('../components/estimator/ModelViewer.jsx'))
import {
  Select,
  NumberField,
  TextField,
  Toggle,
  SegmentedControl,
  ColourPicker,
} from '../components/ui/Field.jsx'

import { parseSTL } from '../utils/stl.js'
import { estimatePrint, estimateVolumeFromFileSize } from '../utils/estimatePrintCost.js'
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

export default function Estimator() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // ----- file / geometry state -----
  const [fileMeta, setFileMeta] = useState(null) // { name, size }
  const [geometry, setGeometry] = useState(null) // { positions, dimensions, volumeCm3, triangleCount }
  const [parseState, setParseState] = useState('idle') // idle|parsing|done|unsupported|error
  const [dragOver, setDragOver] = useState(false)

  // ----- print options -----
  const [materialId, setMaterialId] = useState(DEFAULT_MATERIAL_ID)
  const [colour, setColour] = useState(getMaterial(DEFAULT_MATERIAL_ID).colours[0])
  const [layerHeight, setLayerHeight] = useState(DEFAULT_LAYER_HEIGHT)
  const [infill, setInfill] = useState(DEFAULT_INFILL)
  const [printerId, setPrinterId] = useState(DEFAULT_PRINTER_ID)
  const [quantity, setQuantity] = useState(1)
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

  const material = getMaterial(materialId)
  const printer = getPrinter(printerId)

  // Keep colour valid when the material changes.
  useEffect(() => {
    if (!material.colours.includes(colour)) setColour(material.colours[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId])

  // Volume used for the estimate: real parse if available, else file-size guess.
  const volumeCm3 = useMemo(() => {
    if (geometry?.volumeCm3) return geometry.volumeCm3
    if (fileMeta?.size) return estimateVolumeFromFileSize(fileMeta.size)
    return null
  }, [geometry, fileMeta])

  // Live estimate — recomputed whenever any input changes.
  const estimate = useMemo(() => {
    if (!volumeCm3) return null
    return estimatePrint({
      volumeCm3,
      materialId,
      printerId,
      layerHeight,
      infill,
      quantity,
      dispatchId,
      shippingId,
      whiteLabel,
      urgent,
    })
  }, [volumeCm3, materialId, printerId, layerHeight, infill, quantity, dispatchId, shippingId, whiteLabel, urgent])

  // Compatibility warnings (non-blocking).
  const warnings = []
  if (!printer.materials.includes(materialId)) {
    warnings.push(`${printer.name} isn't profiled for ${material.name}. We may use a better-suited machine.`)
  }
  if (material.requiresEnclosure && !printer.enclosed) {
    warnings.push(`${material.name} prints best in an enclosed printer, so consider the P1S or K1C.`)
  }

  // --------------------------------------------------------------------------
  // File handling
  // --------------------------------------------------------------------------
  async function handleFile(file) {
    if (!file) return
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setParseState('error')
      setFileMeta({ name: file.name, size: file.size })
      setGeometry(null)
      return
    }

    setFileMeta({ name: file.name, size: file.size })
    setSubmitted(null)
    setSavedDraft(null)

    if (ext === '.stl') {
      setParseState('parsing')
      try {
        const buffer = await file.arrayBuffer()
        const parsed = parseSTL(buffer)
        setGeometry(parsed)
        setParseState('done')
      } catch {
        setGeometry(null)
        setParseState('error')
      }
    } else {
      // 3MF / OBJ — no live preview; estimate from file size.
      setGeometry(null)
      setParseState('unsupported')
    }
  }

  function loadSample() {
    const dims = { x: 60, y: 40, z: 30 }
    setFileMeta({ name: 'sample_widget_60x40x30.stl', size: 612_000 })
    setGeometry({
      positions: makeBoxPositions(dims.x, dims.y, dims.z),
      dimensions: dims,
      // solid box volume * a solidity factor to mimic a real part
      volumeCm3: ((dims.x * dims.y * dims.z) / 1000) * 0.45,
      triangleCount: 12,
    })
    setParseState('done')
    setSubmitted(null)
    setSavedDraft(null)
  }

  function clearFile() {
    setFileMeta(null)
    setGeometry(null)
    setParseState('idle')
    setSubmitted(null)
    setSavedDraft(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  // --------------------------------------------------------------------------
  // Submit (request quote / confirm order)
  // --------------------------------------------------------------------------
  async function handleSubmit() {
    const errs = {}
    if (!fileMeta) errs.file = 'Upload a model file first.'
    if (!confirmOwnership) errs.confirm = 'Please confirm you own this file or have permission.'
    if (postcode && !UK_POSTCODE.test(postcode.trim())) errs.postcode = 'Enter a valid UK postcode.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const job = await createJob({
        user_id: user?.id || 'guest',
        file_name: fileMeta.name,
        file_size: fileMeta.size,
        material: materialId,
        colour,
        layer_height: layerHeight,
        infill,
        printer_profile: printerId,
        quantity,
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
    if (!estimate || !fileMeta) return
    setSavingDraft(true)
    try {
      const draft = await saveEstimate({
        user_id: user?.id || 'guest',
        file_name: fileMeta.name,
        material: materialId,
        colour,
        layer_height: layerHeight,
        infill,
        printer_profile: printerId,
        quantity,
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
  // Render
  // --------------------------------------------------------------------------
  return (
    <div>
      <PageHeader
        eyebrow="Instant estimator"
        title="Upload a model, get a price in seconds"
        subtitle="STL files get a live 3D preview and a real volume-based estimate. 3MF and OBJ are estimated from the file and confirmed after review."
      />

      <div className="section py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ============ LEFT: upload + options ============ */}
          <div className="space-y-6 lg:col-span-2">
            {/* Upload + preview */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Upload zone (keyboard accessible) + sample button below */}
              <div className="flex flex-col gap-3">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload a 3D model file. Drop a file here or activate to browse."
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
                      ? 'border-clay-500 bg-clay-50'
                      : 'border-ink/20 bg-paper-light hover:border-clay-500/50 hover:bg-clay-50/50'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(',')}
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  {parseState === 'parsing' ? (
                    <Loader2 size={36} className="animate-spin text-clay-500" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-50 text-pine-600">
                      <UploadCloud size={28} />
                    </span>
                  )}
                  <p className="mt-3 font-semibold text-ink">
                    {parseState === 'parsing' ? 'Reading your model…' : 'Drop your file here'}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">or click to browse · STL, 3MF, OBJ</p>
                </div>
                <button
                  type="button"
                  onClick={loadSample}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink/[0.05] px-3 py-2 text-xs font-medium text-clay-700 hover:bg-ink/[0.08]"
                >
                  <Sparkles size={13} /> Try a sample model
                </button>
              </div>

              {/* Preview — three.js viewer is lazy-loaded and isolated by an error boundary */}
              <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper-dark">
                <ErrorBoundary compact>
                  <Suspense
                    fallback={
                      <div className="flex h-full min-h-[260px] items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-clay-500" />
                      </div>
                    }
                  >
                    <ModelViewer positions={geometry?.positions} colour={colourToHex(colour)} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* File metadata */}
            <AnimatePresence>
              {fileMeta && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card-glass flex flex-wrap items-center gap-4 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-50 text-pine-600">
                    <FileBox size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{fileMeta.name}</p>
                    <p className="text-xs text-ink-soft">{formatBytes(fileMeta.size)}</p>
                  </div>
                  {geometry && (
                    <>
                      <div className="flex items-center gap-1.5 text-sm text-ink-light">
                        <Ruler size={15} className="text-pine-600" />
                        {formatDims(geometry.dimensions)}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-ink-light">
                        <Triangle size={15} className="text-pine-600" />
                        {geometry.triangleCount.toLocaleString()} triangles
                      </div>
                    </>
                  )}
                  <button
                    onClick={clearFile}
                    className="ml-auto rounded-lg p-2 text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {parseState === 'error' && (
              <p className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertTriangle size={16} /> We couldn&apos;t read that file. Please upload a valid STL,
                3MF or OBJ.
              </p>
            )}
            {parseState === 'unsupported' && (
              <p className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                <AlertTriangle size={16} /> Live 3D preview is STL-only. We&apos;ve estimated this{' '}
                {fileMeta?.name.split('.').pop().toUpperCase()} from the file size — final figures
                confirmed after review.
              </p>
            )}

            {/* Options */}
            <div className="card-glass space-y-6 p-6">
              <h2 className="text-lg font-semibold text-ink">Print options</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Material"
                  value={materialId}
                  onChange={setMaterialId}
                  options={materials.map((m) => ({ value: m.id, label: m.name }))}
                  hint={material.use}
                />
                <NumberField label="Quantity" value={quantity} onChange={setQuantity} min={1} max={1000} />
              </div>

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
                      className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
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
                <QuoteBreakdown estimate={estimate} />
              ) : (
                <div className="card-glass flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                  <FileBox size={32} className="text-ink-soft" />
                  <p className="mt-3 font-medium text-ink">Your estimate appears here</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Upload a model or try the sample to see weight, print time and price.
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
                      className="mt-0.5 h-5 w-5 rounded border-ink/30 bg-white text-pine-600 focus:ring-pine-500"
                    />
                    <span className="text-sm text-ink-light">
                      I confirm I own this file or have permission to have it printed.{' '}
                      <Link to="/terms" className="text-clay-600 underline">
                        File responsibility
                      </Link>
                    </span>
                  </label>
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
                  {errors.file && <p className="text-xs text-red-400">{errors.file}</p>}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary w-full py-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        Request quote / order <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-ink-soft">
                    No payment taken now. We review the file and confirm the final price.
                  </p>

                  {/* Save as draft — no commitment, lands in the dashboard */}
                  <div className="border-t border-ink/10 pt-4">
                    {savedDraft ? (
                      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
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

              {/* Success state */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card overflow-hidden"
                  >
                    <div className="bg-emerald-600 p-5 text-white">
                      <CheckCircle2 size={28} />
                      <p className="mt-2 text-lg font-bold">Quote request received</p>
                      <p className="text-sm text-emerald-50">Reference {submitted.id}</p>
                    </div>
                    <div className="space-y-3 p-5">
                      <p className="text-sm text-ink-soft">
                        We&apos;ll review <strong>{submitted.file_name}</strong> and confirm the final
                        price. You can track this job from your dashboard.
                      </p>
                      <div className="flex gap-2">
                        {user ? (
                          <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary flex-1 py-2.5"
                          >
                            View in dashboard
                          </button>
                        ) : (
                          <Link to="/login" className="btn-primary flex-1 py-2.5">
                            Sign in to track
                          </Link>
                        )}
                        <button onClick={clearFile} className="btn-light flex-1 py-2.5">
                          New estimate
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
