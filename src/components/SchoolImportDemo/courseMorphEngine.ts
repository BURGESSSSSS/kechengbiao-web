import type { SchoolImportCourse } from './schoolImportData'

export interface MorphRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CourseGeometryEntry {
  sourceRect: MorphRect
  stripRect: MorphRect
  previewRect: MorphRect
}

export interface StageGeometryCache {
  isMobile: boolean
  stageWidth: number
  stageHeight: number
  stripLaneTopRect: MorphRect
  stripLaneBottomRect: MorphRect
  processBoxRect: MorphRect
  courses: Record<string, CourseGeometryEntry>
}

export type CourseMorphStage =
  | 'idle-source'
  | 'stage-a-extract'
  | 'stage-b-stream'
  | 'stage-c-process'
  | 'stage-d-preview'
  | 'settled-preview'

export interface CourseMorphState {
  courseId: string
  stage: CourseMorphStage
  localP: number
  visible: boolean
  zIndex: number

  // Continuous Geometry
  x: number
  y: number
  width: number
  height: number
  scale: number
  borderRadius: number

  // Surface & Elevation
  backgroundColor: string
  borderAlpha: number
  shadowStrength: number
  overlayOpacity: number

  // Left Color Identity Bar -> Preview Dot Morph
  leftBarOpacity: number
  leftBarToDotProgress: number // 0 = 2.5x14px vertical bar, 1 = 6x6px circle dot

  // Internal Content Cross-Morph Layers
  sourceTextOpacity: number
  stripTextOpacity: number
  isNormalizedStrip: boolean
  processLayerOpacity: number
  processLabelOpacity: number
  processAlignT: number // 0 = initial slight offset, 1 = crisp aligned grid
  previewTextOpacity: number

  // Static DOM Counterparts
  staticSourceOpacity: number
  staticPreviewOpacity: number
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export function interpolateHexColor(hexA: string, hexB: string, t: number): string {
  const clamped = clamp(t, 0, 1)
  const [r1, g1, b1] = parseHex(hexA)
  const [r2, g2, b2] = parseHex(hexB)
  const r = Math.round(lerp(r1, r2, clamped))
  const g = Math.round(lerp(g1, g2, clamped))
  const b = Math.round(lerp(b1, b2, clamped))
  return `rgb(${r}, ${g}, ${b})`
}

// Local progress stage boundaries
const STAGE_A_DETACH_END = 0.065
const STAGE_A_END = 0.24
const STAGE_B_END = 0.44
const STAGE_C_EXPAND_END = 0.52
const STAGE_C_ALIGN_END = 0.62
const STAGE_C_END = 0.70
const STAGE_D_STREAM_END = 0.80
const STAGE_D_MORPH_END = 0.95

/**
 * Pure, deterministic Course Morph calculation for Phase 05B:
 * SOURCE -> DATA STRIP -> PROCESS ORGANIZER -> PREVIEW ROW
 */
export function computeCourseMorphState(
  globalProgress: number,
  course: SchoolImportCourse,
  index: number,
  geometry: StageGeometryCache
): CourseMorphState {
  const entry = geometry.courses[course.id]
  const fallbackRect: MorphRect = { x: 0, y: 0, width: 120, height: 36 }
  const sourceRect = entry?.sourceRect ?? fallbackRect
  const previewRect = entry?.previewRect ?? fallbackRect

  const isMobile = geometry.isMobile
  const laneRect =
    index % 2 === 0 ? geometry.stripLaneTopRect : geometry.stripLaneBottomRect
  const processBoxRect = geometry.processBoxRect

  const rawLocal = (globalProgress - course.startP) / (course.endP - course.startP)
  const localP = clamp(rawLocal, 0, 1)

  // 1. Before extraction begins: course rests inside SOURCE grid
  if (localP <= 0.0001) {
    return {
      courseId: course.id,
      stage: 'idle-source',
      localP: 0,
      visible: false,
      zIndex: 10 + course.order,
      x: sourceRect.x,
      y: sourceRect.y,
      width: sourceRect.width,
      height: sourceRect.height,
      scale: 1,
      borderRadius: 5,
      backgroundColor: course.sourceColor,
      borderAlpha: 0,
      shadowStrength: 0,
      overlayOpacity: 0,
      leftBarOpacity: 0,
      leftBarToDotProgress: 0,
      sourceTextOpacity: 1,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 0,
      previewTextOpacity: 0,
      staticSourceOpacity: 1,
      staticPreviewOpacity: 0,
    }
  }

  // 2. After Preview settle completes: static Preview Row owns the display
  if (localP >= 0.9999) {
    return {
      courseId: course.id,
      stage: 'settled-preview',
      localP: 1,
      visible: false,
      zIndex: 10 + course.order,
      x: previewRect.x,
      y: previewRect.y,
      width: previewRect.width,
      height: previewRect.height,
      scale: 1,
      borderRadius: 4,
      backgroundColor: 'rgb(255, 255, 255)',
      borderAlpha: 0,
      shadowStrength: 0,
      overlayOpacity: 0,
      leftBarOpacity: 0.8,
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: true,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 1,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 1,
    }
  }

  // Static SOURCE node fades out cleanly as soon as Overlay takes over detachment
  const staticSourceOpacity = 1 - clamp(localP / 0.04, 0, 1)

  // Key spatial waypoints in Stage coordinate system
  const detachX = sourceRect.x + (isMobile ? 0 : 4)
  const detachY = sourceRect.y - 6

  const stripH = Math.max(32, laneRect.height || 34)
  const stripW = laneRect.width || 260

  // Entry & exit of Stage B (Data Strip Stream)
  const laneSign = index % 2 === 0 ? -1 : 1
  const stripStartX = isMobile ? laneRect.x + laneSign * 5 : laneRect.x - 24
  const stripStartY = isMobile ? laneRect.y - 8 : laneRect.y + laneSign * 4

  const stripEndX = isMobile ? laneRect.x - laneSign * 4 : laneRect.x + 14
  const stripEndY = isMobile ? laneRect.y + 8 : laneRect.y - laneSign * 3

  // Exit of Stage C (Normalized Data Record after field organization)
  const normStripX = isMobile ? processBoxRect.x : processBoxRect.x + 16
  const normStripY = isMobile
    ? processBoxRect.y + processBoxRect.height - stripH
    : processBoxRect.y + processBoxRect.height * 0.38
  const normStripW = processBoxRect.width || stripW

  // Entry of Stage D2 (Approach to Preview Row)
  const previewApproachX = isMobile ? previewRect.x : previewRect.x - 16
  const previewApproachY = isMobile ? previewRect.y - 6 : previewRect.y
  const previewApproachW = lerp(normStripW, previewRect.width, 0.55)

  // ---------------------------------------------------------------------------
  // STAGE A: SOURCE -> DATA STRIP (localP: 0 -> 0.24)
  // ---------------------------------------------------------------------------
  if (localP <= STAGE_A_END) {
    if (localP <= STAGE_A_DETACH_END) {
      // Sub-phase A1: Detach from SOURCE grid cell (lift + slight scale + shadow)
      const u = localP / STAGE_A_DETACH_END
      const e = easeOutQuad(u)
      return {
        courseId: course.id,
        stage: 'stage-a-extract',
        localP,
        visible: true,
        zIndex: 40 + course.order,
        x: lerp(sourceRect.x, detachX, e),
        y: lerp(sourceRect.y, detachY, e),
        width: sourceRect.width,
        height: sourceRect.height,
        scale: lerp(1, 1.015, e),
        borderRadius: lerp(5, 6, e),
        backgroundColor: course.sourceColor,
        borderAlpha: 0,
        shadowStrength: 0.55 * e,
        overlayOpacity: 1,
        leftBarOpacity: 0,
        leftBarToDotProgress: 0,
        sourceTextOpacity: 1 - 0.1 * e,
        stripTextOpacity: 0,
        isNormalizedStrip: false,
        processLayerOpacity: 0,
        processLabelOpacity: 0,
        processAlignT: 0,
        previewTextOpacity: 0,
        staticSourceOpacity,
        staticPreviewOpacity: 0,
      }
    }

    // Sub-phase A2: Compress & Morph from detached block into slender Data Strip
    const u = (localP - STAGE_A_DETACH_END) / (STAGE_A_END - STAGE_A_DETACH_END)
    const ePos = easeInOutCubic(u)
    const eHeight = easeOutCubic(u)
    const colorT = easeInOutQuad(clamp((u - 0.08) / 0.82, 0, 1))

    return {
      courseId: course.id,
      stage: 'stage-a-extract',
      localP,
      visible: true,
      zIndex: 40 + course.order,
      x: lerp(detachX, stripStartX, ePos),
      y: lerp(detachY, stripStartY, ePos),
      width: lerp(sourceRect.width, stripW, ePos),
      height: lerp(sourceRect.height, stripH, eHeight),
      scale: lerp(1.015, 1.0, ePos),
      borderRadius: lerp(6, 7, ePos),
      backgroundColor: interpolateHexColor(course.sourceColor, '#FAFAFC', colorT),
      borderAlpha: lerp(0, 0.085, colorT),
      shadowStrength: lerp(0.55, 0.32, ePos),
      overlayOpacity: 1,
      leftBarOpacity: clamp((u - 0.16) / 0.48, 0, 1),
      leftBarToDotProgress: 0,
      sourceTextOpacity: 1 - clamp(u / 0.5, 0, 1),
      stripTextOpacity: clamp((u - 0.32) / 0.55, 0, 1),
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 0,
      previewTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE B: DATA STRIP STREAM (localP: 0.24 -> 0.44)
  // ---------------------------------------------------------------------------
  if (localP <= STAGE_B_END) {
    const u = (localP - STAGE_A_END) / (STAGE_B_END - STAGE_A_END)
    const q = 0.35 * u + 0.65 * easeInOutQuad(u)

    return {
      courseId: course.id,
      stage: 'stage-b-stream',
      localP,
      visible: true,
      zIndex: 30 + course.order,
      x: lerp(stripStartX, stripEndX, q),
      y: lerp(stripStartY, stripEndY, q),
      width: stripW,
      height: stripH,
      scale: 1,
      borderRadius: 7,
      backgroundColor: 'rgb(250, 250, 252)',
      borderAlpha: 0.085,
      shadowStrength: 0.32,
      overlayOpacity: 1,
      leftBarOpacity: 1,
      leftBarToDotProgress: 0,
      sourceTextOpacity: 0,
      stripTextOpacity: 1,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 0,
      previewTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE C: PROCESS ORGANIZER (localP: 0.44 -> 0.70)
  // Expand into 5-field table -> Align fields -> Re-compact into Normalized Record
  // ---------------------------------------------------------------------------
  if (localP <= STAGE_C_END) {
    if (localP <= STAGE_C_EXPAND_END) {
      // Sub-phase C1: Expand from Data Strip into 5-row Process Organizer box
      const u = (localP - STAGE_B_END) / (STAGE_C_EXPAND_END - STAGE_B_END)
      const e = easeOutCubic(u)

      return {
        courseId: course.id,
        stage: 'stage-c-process',
        localP,
        visible: true,
        zIndex: 60 + course.order,
        x: lerp(stripEndX, processBoxRect.x, e),
        y: lerp(stripEndY, processBoxRect.y, e),
        width: lerp(stripW, processBoxRect.width, e),
        height: lerp(stripH, processBoxRect.height, e),
        scale: 1,
        borderRadius: lerp(7, 10, e),
        backgroundColor: interpolateHexColor('#FAFAFC', '#FFFFFF', e),
        borderAlpha: lerp(0.085, 0.095, e),
        shadowStrength: lerp(0.32, 0.45, e),
        overlayOpacity: 1,
        leftBarOpacity: 1,
        leftBarToDotProgress: 0,
        sourceTextOpacity: 0,
        stripTextOpacity: 1 - clamp(u / 0.55, 0, 1),
        isNormalizedStrip: false,
        processLayerOpacity: clamp((u - 0.18) / 0.65, 0, 1),
        processLabelOpacity: clamp((u - 0.32) / 0.65, 0, 1),
        processAlignT: easeOutQuad(clamp((u - 0.2) / 0.8, 0, 1)) * 0.65,
        previewTextOpacity: 0,
        staticSourceOpacity: 0,
        staticPreviewOpacity: 0,
      }
    }

    if (localP <= STAGE_C_ALIGN_END) {
      // Sub-phase C2: Subtle field alignment & crisp hold inside Process Organizer
      const u = (localP - STAGE_C_EXPAND_END) / (STAGE_C_ALIGN_END - STAGE_C_EXPAND_END)
      const alignFinish = 0.65 + 0.35 * easeOutCubic(clamp(u / 0.6, 0, 1))

      return {
        courseId: course.id,
        stage: 'stage-c-process',
        localP,
        visible: true,
        zIndex: 60 + course.order,
        x: processBoxRect.x,
        y: processBoxRect.y,
        width: processBoxRect.width,
        height: processBoxRect.height,
        scale: 1,
        borderRadius: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        borderAlpha: 0.095,
        shadowStrength: 0.45,
        overlayOpacity: 1,
        leftBarOpacity: 1,
        leftBarToDotProgress: 0,
        sourceTextOpacity: 0,
        stripTextOpacity: 0,
        isNormalizedStrip: false,
        processLayerOpacity: 1,
        processLabelOpacity: 1,
        processAlignT: alignFinish,
        previewTextOpacity: 0,
        staticSourceOpacity: 0,
        staticPreviewOpacity: 0,
      }
    }

    // Sub-phase C3: Re-compact 5-row field table into Normalized Data Record
    const u = (localP - STAGE_C_ALIGN_END) / (STAGE_C_END - STAGE_C_ALIGN_END)
    const e = easeInOutCubic(u)

    return {
      courseId: course.id,
      stage: 'stage-c-process',
      localP,
      visible: true,
      zIndex: 55 + course.order,
      x: lerp(processBoxRect.x, normStripX, e),
      y: lerp(processBoxRect.y, normStripY, e),
      width: lerp(processBoxRect.width, normStripW, e),
      height: lerp(processBoxRect.height, stripH, e),
      scale: 1,
      borderRadius: lerp(10, 7, e),
      backgroundColor: interpolateHexColor('#FFFFFF', '#FAFAFC', e),
      borderAlpha: lerp(0.095, 0.085, e),
      shadowStrength: lerp(0.45, 0.32, e),
      overlayOpacity: 1,
      leftBarOpacity: 1,
      leftBarToDotProgress: 0,
      sourceTextOpacity: 0,
      stripTextOpacity: clamp((u - 0.35) / 0.58, 0, 1),
      isNormalizedStrip: true,
      processLayerOpacity: 1 - clamp(u / 0.55, 0, 1),
      processLabelOpacity: 1 - clamp(u / 0.42, 0, 1),
      processAlignT: 1,
      previewTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE D: NORMALIZED RECORD -> PREVIEW ROW (localP: 0.70 -> 1.00)
  // ---------------------------------------------------------------------------
  if (localP <= STAGE_D_STREAM_END) {
    // Sub-phase D1: Stream Normalized Record toward Preview target row
    const u = (localP - STAGE_C_END) / (STAGE_D_STREAM_END - STAGE_C_END)
    const e = easeInOutQuad(u)

    return {
      courseId: course.id,
      stage: 'stage-d-preview',
      localP,
      visible: true,
      zIndex: 35 + course.order,
      x: lerp(normStripX, previewApproachX, e),
      y: lerp(normStripY, previewApproachY, e),
      width: lerp(normStripW, previewApproachW, e),
      height: stripH,
      scale: 1,
      borderRadius: 7,
      backgroundColor: 'rgb(250, 250, 252)',
      borderAlpha: 0.085,
      shadowStrength: 0.3,
      overlayOpacity: 1,
      leftBarOpacity: 1,
      leftBarToDotProgress: 0,
      sourceTextOpacity: 0,
      stripTextOpacity: 1,
      isNormalizedStrip: true,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
    }
  }

  if (localP <= STAGE_D_MORPH_END) {
    // Sub-phase D2: Expand & Morph Normalized Record into exact Preview Row geometry
    const u = (localP - STAGE_D_STREAM_END) / (STAGE_D_MORPH_END - STAGE_D_STREAM_END)
    const e = easeOutCubic(u)

    return {
      courseId: course.id,
      stage: 'stage-d-preview',
      localP,
      visible: true,
      zIndex: 25 + course.order,
      x: lerp(previewApproachX, previewRect.x, e),
      y: lerp(previewApproachY, previewRect.y, e),
      width: lerp(previewApproachW, previewRect.width, e),
      height: lerp(stripH, previewRect.height, e),
      scale: 1,
      borderRadius: lerp(7, 4, e),
      backgroundColor: interpolateHexColor('#FAFAFC', '#FFFFFF', e),
      borderAlpha: lerp(0.085, 0, e),
      shadowStrength: lerp(0.3, 0, e),
      overlayOpacity: 1,
      leftBarOpacity: lerp(1, 0.78, e),
      leftBarToDotProgress: e,
      sourceTextOpacity: 0,
      stripTextOpacity: 1 - clamp(u / 0.34, 0, 1),
      isNormalizedStrip: true,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: clamp((u - 0.30) / 0.48, 0, 1),
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
    }
  }

  // Sub-phase D3: Seamless final handoff at exact previewRect (localP: 0.95 -> 1.00)
  const handoffT = clamp(
    (localP - STAGE_D_MORPH_END) / (1 - STAGE_D_MORPH_END),
    0,
    1
  )

  return {
    courseId: course.id,
    stage: 'stage-d-preview',
    localP,
    visible: true,
    zIndex: 20 + course.order,
    x: previewRect.x,
    y: previewRect.y,
    width: previewRect.width,
    height: previewRect.height,
    scale: 1,
    borderRadius: 4,
    backgroundColor: 'rgb(255, 255, 255)',
    borderAlpha: 0,
    shadowStrength: 0,
    overlayOpacity: 1 - handoffT,
    leftBarOpacity: 0.78,
    leftBarToDotProgress: 1,
    sourceTextOpacity: 0,
    stripTextOpacity: 0,
    isNormalizedStrip: true,
    processLayerOpacity: 0,
    processLabelOpacity: 0,
    processAlignT: 1,
    previewTextOpacity: 1,
    staticSourceOpacity: 0,
    staticPreviewOpacity: handoffT,
  }
}
