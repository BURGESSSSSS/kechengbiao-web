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
  destinationRect: MorphRect
}

export interface StageGeometryCache {
  isMobile: boolean
  stageWidth: number
  stageHeight: number
  stripLaneTopRect: MorphRect
  stripLaneBottomRect: MorphRect
  processBoxRect: MorphRect
  destinationGridTopY: number
  courses: Record<string, CourseGeometryEntry>
}

export type CourseMorphStage =
  | 'idle-source'
  | 'stage-a-extract'
  | 'stage-b-stream'
  | 'stage-c-process'
  | 'stage-d-preview'
  | 'settled-preview'
  | 'stage-e-detach-preview'
  | 'stage-f-commit-destination'
  | 'settled-destination'

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
  compactRecordTextOpacity: number
  destinationTextOpacity: number

  // Static DOM Counterparts
  staticSourceOpacity: number
  staticPreviewOpacity: number
  staticDestinationOpacity: number
}

export interface StageRailStepState {
  index: number
  activeWeight: number // 0..1 continuous current-step emphasis
  doneWeight: number // 0..1 continuous completed-step emphasis
  segmentFill: number // 0..1 continuous vertical segment fill
  railWidthPx: number // 1px -> 3.5px (current) -> 2px (done)
  railColor: string // continuous gray -> charcoal -> black
  nodeSizePx: number // 6px -> 9.5px (current) -> 7px (done)
  nodeColor: string
  codeColor: string
  titleColor: string
  titleWeight: number
  subtitleColor: string
}

export interface Phase05MacroState {
  globalP: number
  sourceToPreviewP: number
  previewToDestinationP: number
  activeStepIndex: 0 | 1 | 2 | 3
  railProgressPct: number
  railSteps: StageRailStepState[]
  // Desktop StageViewport container opacities & centering offsets
  sourceStageOpacity: number
  processStageOpacity: number
  previewStageOpacity: number
  destinationStageOpacity: number
  sourceCenterOffsetFactor: number // 1 during Step 01 hold, 0 during morph
  previewCenterOffsetFactor: number // 1 during Step 03 hold, 0 during morph
  destinationCenterOffsetFactor: number // 1 during Step 04 complete hold, 0 during morph
  // Mobile StageViewport container opacities
  mobileSourceOpacity: number
  mobileProcessOpacity: number
  mobilePreviewOpacity: number
  mobileDestinationOpacity: number
  // Legacy / compatibility fields
  upstreamOpacity: number
  upstreamScale: number
  previewContainerOpacity: number
  destinationContainerOpacity: number
  // Completion caption (Section 21 & 22)
  completionOpacity: number
  completionY: number
  settledDestinationCount: number
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

function parseHex(colorStr: string): [number, number, number] {
  const trimmed = colorStr.trim()
  if (trimmed.startsWith('rgb')) {
    const parts = trimmed.match(/\d+/g)
    if (parts && parts.length >= 3) {
      return [Number(parts[0]), Number(parts[1]), Number(parts[2])]
    }
  }
  const clean = trimmed.replace('#', '')
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

// =============================================================================
// Phase 05 Narrative Redesign Timeline Constants (storyP in [0, 1])
// Step 01 | SOURCE      : 0.00 -> 0.22 (Hold 0.00 -> 0.15, Transition 0.15 -> 0.22)
// Step 02 | PROCESS     : 0.22 -> 0.52 (Pipeline 0.16 -> 0.50, Transition 0.50 -> 0.52)
// Step 03 | PREVIEW     : 0.52 -> 0.74 (Hold 0.53 -> 0.68, Transition 0.68 -> 0.74)
// Step 04 | DESTINATION : 0.74 -> 1.00 (Write 0.73 -> 0.91, Complete Hold 0.91 -> 1.00)
// =============================================================================
export const PHASE05B_GLOBAL_START = 0.16
export const PHASE05B_GLOBAL_END = 0.50
export const PHASE05C_GLOBAL_START = 0.73
export const PHASE05C_GLOBAL_END = 0.91

// Phase 05B local progress stage boundaries (widened STAGE_C Process field alignment hold)
const STAGE_A_DETACH_END = 0.06
const STAGE_A_END = 0.22
const STAGE_B_END = 0.38
const STAGE_C_EXPAND_END = 0.46
const STAGE_C_ALIGN_END = 0.66
const STAGE_C_END = 0.74
const STAGE_D_STREAM_END = 0.83
const STAGE_D_MORPH_END = 0.95

// Phase 05C local progress stage boundaries
const STAGE_E_DETACH_END = 0.15
const STAGE_E_COMPACT_END = 0.36
const STAGE_F_COMMIT_END = 0.94

/**
 * Pure, deterministic Course Morph calculation for Phase 05B:
 * SOURCE -> DATA STRIP -> PROCESS ORGANIZER -> PREVIEW ROW
 * (Preserved intact from Phase 05B)
 */
export function computeCourseMorphState(
  sourceToPreviewP: number,
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

  const rawLocal = (sourceToPreviewP - course.startP) / (course.endP - course.startP)
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
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 1,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
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
      leftBarOpacity: 0.78,
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: true,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 1,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 1,
      staticDestinationOpacity: 0,
    }
  }

  const staticSourceOpacity = 1 - clamp(localP / 0.04, 0, 1)

  const detachX = sourceRect.x + (isMobile ? 0 : 4)
  const detachY = sourceRect.y - 6

  const stripH = Math.max(32, laneRect.height || 34)
  const stripW = laneRect.width || 260

  const laneSign = index % 2 === 0 ? -1 : 1
  const stripStartX = isMobile ? laneRect.x + laneSign * 5 : laneRect.x - 24
  const stripStartY = isMobile ? laneRect.y - 8 : laneRect.y + laneSign * 4

  const stripEndX = isMobile ? laneRect.x - laneSign * 4 : laneRect.x + 14
  const stripEndY = isMobile ? laneRect.y + 8 : laneRect.y - laneSign * 3

  const normStripX = isMobile ? processBoxRect.x : processBoxRect.x + 16
  const normStripY = isMobile
    ? processBoxRect.y + processBoxRect.height - stripH
    : processBoxRect.y + processBoxRect.height * 0.38
  const normStripW = processBoxRect.width || stripW

  const previewApproachX = isMobile ? previewRect.x : previewRect.x - 16
  const previewApproachY = isMobile ? previewRect.y - 6 : previewRect.y
  const previewApproachW = lerp(normStripW, previewRect.width, 0.55)

  // STAGE A: SOURCE -> DATA STRIP (localP: 0 -> 0.24)
  if (localP <= STAGE_A_END) {
    if (localP <= STAGE_A_DETACH_END) {
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
        compactRecordTextOpacity: 0,
        destinationTextOpacity: 0,
        staticSourceOpacity,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

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
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // STAGE B: DATA STRIP STREAM (localP: 0.24 -> 0.44)
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
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // STAGE C: PROCESS ORGANIZER (localP: 0.44 -> 0.70)
  if (localP <= STAGE_C_END) {
    if (localP <= STAGE_C_EXPAND_END) {
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
        compactRecordTextOpacity: 0,
        destinationTextOpacity: 0,
        staticSourceOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    if (localP <= STAGE_C_ALIGN_END) {
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
        compactRecordTextOpacity: 0,
        destinationTextOpacity: 0,
        staticSourceOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

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
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // STAGE D: NORMALIZED RECORD -> PREVIEW ROW (localP: 0.70 -> 1.00)
  if (localP <= STAGE_D_STREAM_END) {
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
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  if (localP <= STAGE_D_MORPH_END) {
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
      previewTextOpacity: clamp((u - 0.3) / 0.48, 0, 1),
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

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
    compactRecordTextOpacity: 0,
    destinationTextOpacity: 0,
    staticSourceOpacity: 0,
    staticPreviewOpacity: handoffT,
    staticDestinationOpacity: 0,
  }
}

/**
 * Pure, deterministic Course Morph calculation for Phase 05C:
 * PREVIEW ROW -> COMPACT RECORD -> DESTINATION APP WEEK BLOCK
 */
export function computeDestinationMorphState(
  previewToDestinationP: number,
  course: SchoolImportCourse,
  _index: number,
  geometry: StageGeometryCache
): CourseMorphState {
  const entry = geometry.courses[course.id]
  const fallbackRect: MorphRect = { x: 0, y: 0, width: 120, height: 36 }
  const previewRect = entry?.previewRect ?? fallbackRect
  const destinationRect = entry?.destinationRect ?? fallbackRect

  const isMobile = geometry.isMobile
  const targetRadius = isMobile ? 11 : 13
  const appBgHex = course.appTheme === 'warm' ? '#F3ECE1' : '#E9E7F7'

  const rawWriteP =
    (previewToDestinationP - course.destStartP) /
    (course.destEndP - course.destStartP)
  const writeLocalP = clamp(rawWriteP, 0, 1)

  // 1. Before this course's batch write starts: course remains settled in Preview Row
  if (writeLocalP <= 0.0001) {
    return {
      courseId: course.id,
      stage: 'settled-preview',
      localP: 0,
      visible: false,
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
      overlayOpacity: 0,
      leftBarOpacity: 0.78,
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: true,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 1,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 1,
      staticDestinationOpacity: 0,
    }
  }

  // 2. After Destination settle completes: static Destination Course Block owns display
  if (writeLocalP >= 0.9999) {
    return {
      courseId: course.id,
      stage: 'settled-destination',
      localP: 1,
      visible: false,
      zIndex: 20 + course.order,
      x: destinationRect.x,
      y: destinationRect.y,
      width: destinationRect.width,
      height: destinationRect.height,
      scale: 1,
      borderRadius: targetRadius,
      backgroundColor: interpolateHexColor(appBgHex, appBgHex, 1),
      borderAlpha: 0,
      shadowStrength: 0,
      overlayOpacity: 0,
      leftBarOpacity: 0,
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 0,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 1,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 1,
    }
  }

  // Static Preview Row hands off to Overlay during first 4% of writeLocalP
  const staticPreviewOpacity = 1 - clamp(writeLocalP / 0.04, 0, 1)

  // Compact Record target dimensions (Section 10)
  const compactW = clamp(previewRect.width * 0.58, 172, 232)
  const compactH = 32

  // Compute Compact Record waypoint along direct linear corridor toward destinationRect
  const alignOffsetX =
    previewRect.x + (previewRect.width - compactW) * (course.dayCol / 4)
  let compactX = lerp(alignOffsetX, destinationRect.x, 0.22)
  let compactY = lerp(previewRect.y, destinationRect.y, 0.22)

  if (isMobile) {
    // Mobile transition corridor (Section 28 & 29): keep compact record centered/aligned
    // and step smoothly into the top of Destination grid without long erratic travel
    const gridTopY =
      geometry.destinationGridTopY > 0
        ? geometry.destinationGridTopY
        : destinationRect.y - 40
    compactX = lerp(
      previewRect.x + (previewRect.width - compactW) * 0.5,
      destinationRect.x,
      0.28
    )
    compactY = lerp(previewRect.y + 18, Math.min(gridTopY, destinationRect.y), 0.35)
  }

  // ---------------------------------------------------------------------------
  // STAGE E1: Preview Row Detachment (writeLocalP: 0 -> 0.14)
  // ---------------------------------------------------------------------------
  if (writeLocalP <= STAGE_E_DETACH_END) {
    const u = writeLocalP / STAGE_E_DETACH_END
    const e = easeOutQuad(u)

    return {
      courseId: course.id,
      stage: 'stage-e-detach-preview',
      localP: writeLocalP,
      visible: true,
      zIndex: 50 + course.order,
      x: previewRect.x,
      y: previewRect.y + 1.5 * e,
      width: previewRect.width,
      height: previewRect.height,
      scale: lerp(1, 0.985, e),
      borderRadius: lerp(4, 8, e),
      backgroundColor: interpolateHexColor('#FFFFFF', '#FAFAFC', e),
      borderAlpha: lerp(0, 0.085, e),
      shadowStrength: lerp(0, 0.24, e),
      overlayOpacity: 1,
      leftBarOpacity: 0.78,
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 1,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity,
      staticDestinationOpacity: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE E2: Preview Row -> Compact Record (writeLocalP: 0.14 -> 0.34)
  // ---------------------------------------------------------------------------
  if (writeLocalP <= STAGE_E_COMPACT_END) {
    const u =
      (writeLocalP - STAGE_E_DETACH_END) /
      (STAGE_E_COMPACT_END - STAGE_E_DETACH_END)
    const e = easeInOutQuad(u)

    return {
      courseId: course.id,
      stage: 'stage-e-detach-preview',
      localP: writeLocalP,
      visible: true,
      zIndex: 50 + course.order,
      x: lerp(previewRect.x, compactX, e),
      y: lerp(previewRect.y + 1.5, compactY, e),
      width: lerp(previewRect.width, compactW, e),
      height: lerp(previewRect.height, compactH, e),
      scale: 0.985,
      borderRadius: lerp(8, 9, e),
      backgroundColor: 'rgb(255, 255, 255)',
      borderAlpha: lerp(0.085, 0.115, e),
      shadowStrength: lerp(0.24, 0.36, e),
      overlayOpacity: 1,
      leftBarOpacity: lerp(0.78, 0.92, e),
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 1 - clamp(u / 0.42, 0, 1),
      compactRecordTextOpacity: clamp((u - 0.32) / 0.52, 0, 1),
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE F: Direct Commit Flight & Morph into Destination Course Block (0.34 -> 0.94)
  // ---------------------------------------------------------------------------
  if (writeLocalP <= STAGE_F_COMMIT_END) {
    const u =
      (writeLocalP - STAGE_E_COMPACT_END) /
      (STAGE_F_COMMIT_END - STAGE_E_COMPACT_END)

    // Direct linear + light ease-in-out trajectory (no arc, no rotation, no overshoot)
    const pT = 0.28 * u + 0.72 * easeInOutCubic(u)
    const morphDimT = easeInOutCubic(clamp((u - 0.36) / 0.56, 0, 1))
    const colorT = easeInOutQuad(clamp((u - 0.34) / 0.54, 0, 1))

    return {
      courseId: course.id,
      stage: 'stage-f-commit-destination',
      localP: writeLocalP,
      visible: true,
      zIndex: 45 + course.order,
      x: lerp(compactX, destinationRect.x, pT),
      y: lerp(compactY, destinationRect.y, pT),
      width: lerp(compactW, destinationRect.width, morphDimT),
      height: lerp(compactH, destinationRect.height, morphDimT),
      scale: lerp(0.985, 1.0, easeOutQuad(u)),
      borderRadius: lerp(9, targetRadius, morphDimT),
      backgroundColor: interpolateHexColor('#FFFFFF', appBgHex, colorT),
      borderAlpha: lerp(0.115, 0, colorT),
      shadowStrength: lerp(0.36, 0, easeInOutQuad(clamp((u - 0.25) / 0.75, 0, 1))),
      overlayOpacity: 1,
      leftBarOpacity: lerp(0.92, 0, clamp((u - 0.34) / 0.26, 0, 1)),
      leftBarToDotProgress: 1,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 1,
      previewTextOpacity: 0,
      compactRecordTextOpacity: 1 - clamp((u - 0.4) / 0.16, 0, 1),
      destinationTextOpacity: clamp((u - 0.54) / 0.24, 0, 1),
      staticSourceOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE G: Flush Settle & Seamless Handoff to Static Destination Block (0.94 -> 1.00)
  // ---------------------------------------------------------------------------
  const handoffT = clamp(
    (writeLocalP - STAGE_F_COMMIT_END) / (1 - STAGE_F_COMMIT_END),
    0,
    1
  )

  return {
    courseId: course.id,
    stage: 'stage-f-commit-destination',
    localP: writeLocalP,
    visible: true,
    zIndex: 25 + course.order,
    x: destinationRect.x,
    y: destinationRect.y,
    width: destinationRect.width,
    height: destinationRect.height,
    scale: 1,
    borderRadius: targetRadius,
    backgroundColor: interpolateHexColor(appBgHex, appBgHex, 1),
    borderAlpha: 0,
    shadowStrength: 0,
    overlayOpacity: 1 - handoffT,
    leftBarOpacity: 0,
    leftBarToDotProgress: 1,
    sourceTextOpacity: 0,
    stripTextOpacity: 0,
    isNormalizedStrip: false,
    processLayerOpacity: 0,
    processLabelOpacity: 0,
    processAlignT: 1,
    previewTextOpacity: 0,
    compactRecordTextOpacity: 0,
    destinationTextOpacity: 1,
    staticSourceOpacity: 0,
    staticPreviewOpacity: 0,
    staticDestinationOpacity: handoffT,
  }
}

/**
 * Unified Phase 05 (05B + 05C) Course State Coordinator for globalP (storyP) in [0, 1].
 */
export function computeFullPhase05CourseState(
  globalP: number,
  course: SchoolImportCourse,
  index: number,
  geometry: StageGeometryCache
): CourseMorphState {
  const clampedGlobal = clamp(globalP, 0, 1)
  if (clampedGlobal <= PHASE05C_GLOBAL_START) {
    const sourceToPreviewP = clamp(
      (clampedGlobal - PHASE05B_GLOBAL_START) /
        (PHASE05B_GLOBAL_END - PHASE05B_GLOBAL_START),
      0,
      1
    )
    return computeCourseMorphState(sourceToPreviewP, course, index, geometry)
  }

  const previewToDestinationP = clamp(
    (clampedGlobal - PHASE05C_GLOBAL_START) /
      (PHASE05C_GLOBAL_END - PHASE05C_GLOBAL_START),
    0,
    1
  )
  return computeDestinationMorphState(previewToDestinationP, course, index, geometry)
}

const STEP_WINDOWS: readonly [number, number][] = [
  [0.0, 0.22],
  [0.22, 0.52],
  [0.52, 0.74],
  [0.74, 1.0],
]

/**
 * Macro Stage State for Phase 05 (StageRail continuous interpolation + StageViewport protagonist weights + completion copy).
 */
export function computePhase05MacroState(
  globalP: number,
  courses: SchoolImportCourse[]
): Phase05MacroState {
  const p = clamp(globalP, 0, 1)
  const sourceToPreviewP = clamp(
    (p - PHASE05B_GLOBAL_START) / (PHASE05B_GLOBAL_END - PHASE05B_GLOBAL_START),
    0,
    1
  )
  const previewToDestinationP = clamp(
    (p - PHASE05C_GLOBAL_START) / (PHASE05C_GLOBAL_END - PHASE05C_GLOBAL_START),
    0,
    1
  )

  // 1. Active step index for mobile indicator & accessibility
  let activeStepIndex: 0 | 1 | 2 | 3 = 0
  if (p >= 0.74) activeStepIndex = 3
  else if (p >= 0.52) activeStepIndex = 2
  else if (p >= 0.22) activeStepIndex = 1

  // 2. Continuous Stage Rail interpolation (DONE / CURRENT / FUTURE)
  const tau = 0.032
  const railSteps: StageRailStepState[] = STEP_WINDOWS.map(([sStart, sEnd], idx) => {
    const enterT =
      idx === 0
        ? 1
        : easeInOutQuad(clamp((p - (sStart - tau)) / (2 * tau), 0, 1))
    const exitT =
      idx === 3
        ? 0
        : easeInOutQuad(clamp((p - (sEnd - tau)) / (2 * tau), 0, 1))

    const activeWeight = clamp(enterT * (1 - exitT), 0, 1)
    const doneWeight = exitT
    const effectiveEnd = idx === 3 ? 0.92 : sEnd
    const segmentFill = clamp((p - sStart) / (effectiveEnd - sStart), 0, 1)

    // Rail segment thickness: 1px (future) -> 3.5px (current) -> 2px (done)
    const railWidthPx = lerp(lerp(1.0, 2.0, doneWeight), 3.5, activeWeight)
    // Rail segment color: #D4D4D8 (future) -> #52525B (done) -> #111111 (current)
    const doneRailHex = interpolateHexColor(
      '#D4D4D8',
      '#52525B',
      clamp(doneWeight + segmentFill * 0.55, 0, 1)
    )
    const railColor = interpolateHexColor(doneRailHex, '#111111', activeWeight)

    // Node diameter: 6px (future) -> 7.5px (done) -> 10px (current)
    const nodeSizePx = lerp(lerp(6.0, 7.5, doneWeight), 10.0, activeWeight)
    const doneNodeHex = interpolateHexColor('#D4D4D8', '#52525B', doneWeight)
    const nodeColor = interpolateHexColor(doneNodeHex, '#111111', activeWeight)

    // Typography colors & weights: FUTURE (#A1A1AA) -> DONE (#6E6E77) -> CURRENT (#111111)
    const doneCodeHex = interpolateHexColor('#A1A1AA', '#6E6E77', doneWeight)
    const codeColor = interpolateHexColor(doneCodeHex, '#111111', activeWeight)

    const doneTitleHex = interpolateHexColor('#A1A1AA', '#52525B', doneWeight)
    const titleColor = interpolateHexColor(doneTitleHex, '#111111', activeWeight)
    const titleWeight = Math.round(lerp(lerp(450, 520, doneWeight), 680, activeWeight))

    const doneSubHex = interpolateHexColor('#C4C4CC', '#8E8E96', doneWeight)
    const subtitleColor = interpolateHexColor(doneSubHex, '#3F3F46', activeWeight)

    return {
      index: idx,
      activeWeight,
      doneWeight,
      segmentFill,
      railWidthPx,
      railColor,
      nodeSizePx,
      nodeColor,
      codeColor,
      titleColor,
      titleWeight,
      subtitleColor,
    }
  })

  // Continuous overall rail progress (0% -> 100%)
  const totalRailFill =
    (railSteps[0].segmentFill +
      railSteps[1].segmentFill +
      railSteps[2].segmentFill +
      railSteps[3].segmentFill) *
    25
  const railProgressPct = clamp(totalRailFill, 0, 100)

  // 3. Desktop StageViewport protagonist opacities (only 1 stage is main protagonist at a time)
  // Step 01: SOURCE is protagonist (0.00 -> 0.22)
  let sourceStageOpacity = 1
  if (p <= 0.16) {
    sourceStageOpacity = 1
  } else if (p <= 0.25) {
    sourceStageOpacity = lerp(1, 0.36, easeInOutQuad((p - 0.16) / 0.09))
  } else if (p <= 0.47) {
    sourceStageOpacity = 0.36
  } else if (p <= 0.53) {
    sourceStageOpacity = lerp(0.36, 0, easeInOutQuad((p - 0.47) / 0.06))
  } else {
    sourceStageOpacity = 0
  }

  // Step 02: PROCESS is protagonist (0.22 -> 0.52)
  let processStageOpacity = 0
  if (p <= 0.12) {
    processStageOpacity = 0
  } else if (p <= 0.19) {
    processStageOpacity = easeInOutQuad((p - 0.12) / 0.07)
  } else if (p <= 0.48) {
    processStageOpacity = 1
  } else if (p <= 0.54) {
    processStageOpacity = 1 - easeInOutQuad((p - 0.48) / 0.06)
  } else {
    processStageOpacity = 0
  }

  // Step 03: PREVIEW is protagonist (0.52 -> 0.74), receives in Step 02, feeds in Step 04
  let previewStageOpacity = 0
  if (p <= 0.18) {
    previewStageOpacity = 0
  } else if (p <= 0.26) {
    previewStageOpacity = lerp(0, 0.86, easeInOutQuad((p - 0.18) / 0.08))
  } else if (p <= 0.48) {
    previewStageOpacity = 0.86
  } else if (p <= 0.53) {
    previewStageOpacity = lerp(0.86, 1, easeInOutQuad((p - 0.48) / 0.05))
  } else if (p <= 0.73) {
    previewStageOpacity = 1
  } else if (p <= 0.86) {
    previewStageOpacity = lerp(1, 0.72, easeInOutQuad((p - 0.73) / 0.13))
  } else if (p <= 0.92) {
    previewStageOpacity = lerp(0.72, 0, easeInOutQuad((p - 0.86) / 0.06))
  } else {
    previewStageOpacity = 0
  }

  // Step 04: DESTINATION is protagonist (0.74 -> 1.00), 100% hidden during Steps 01-03
  let destinationStageOpacity = 0
  if (p <= 0.68) {
    destinationStageOpacity = 0
  } else if (p <= 0.74) {
    destinationStageOpacity = easeInOutQuad((p - 0.68) / 0.06)
  } else {
    destinationStageOpacity = 1
  }

  // Safe centering factors when CourseMorphOverlay is completely idle (all courses settled in static DOM)
  // - sourceCenterOffsetFactor: 1 during 0.00..0.10, smoothly 0 by 0.155 (before PHASE05B_GLOBAL_START = 0.16)
  const sourceCenterOffsetFactor =
    p <= 0.10 ? 1 : p < 0.155 ? 1 - easeInOutCubic((p - 0.10) / 0.055) : 0

  // - previewCenterOffsetFactor: 0 at <=0.505, rises to 1 during 0.505..0.55, holds 1 during 0.55..0.66, returns to 0 by 0.725 (before PHASE05C_GLOBAL_START = 0.73)
  let previewCenterOffsetFactor = 0
  if (p > 0.505 && p <= 0.55) {
    previewCenterOffsetFactor = easeInOutCubic((p - 0.505) / 0.045)
  } else if (p > 0.55 && p <= 0.66) {
    previewCenterOffsetFactor = 1
  } else if (p > 0.66 && p < 0.725) {
    previewCenterOffsetFactor = 1 - easeInOutCubic((p - 0.66) / 0.065)
  }

  // - destinationCenterOffsetFactor: 0 at <=0.905 (after PHASE05C_GLOBAL_END = 0.91 finishes last course at 0.903), rises to 1 by 0.94
  const destinationCenterOffsetFactor =
    p <= 0.906 ? 0 : p < 0.94 ? easeInOutCubic((p - 0.906) / 0.034) : 1

  // 4. Mobile single-protagonist stage opacities
  const mobileSourceOpacity =
    p <= 0.16 ? 1 : p < 0.22 ? 1 - easeInOutQuad((p - 0.16) / 0.06) : 0
  const mobileProcessOpacity =
    p <= 0.16
      ? 0
      : p < 0.22
        ? easeInOutQuad((p - 0.16) / 0.06)
        : p <= 0.47
          ? 1
          : p < 0.52
            ? 1 - easeInOutQuad((p - 0.47) / 0.05)
            : 0
  const mobilePreviewOpacity =
    p <= 0.47
      ? 0
      : p < 0.52
        ? easeInOutQuad((p - 0.47) / 0.05)
        : p <= 0.69
          ? 1
          : p < 0.74
            ? 1 - easeInOutQuad((p - 0.69) / 0.05)
            : 0
  const mobileDestinationOpacity =
    p <= 0.69 ? 0 : p < 0.74 ? easeInOutQuad((p - 0.69) / 0.05) : 1

  // Count how many courses have settled into Destination
  let settledDestinationCount = 0
  for (const c of courses) {
    const wP = (previewToDestinationP - c.destStartP) / (c.destEndP - c.destStartP)
    if (wP >= 0.85) settledDestinationCount++
  }

  // Completion caption fades in (opacity 0->1, y 6px->0) after 9th course settles (storyP ~ 0.903)
  const compT = easeOutQuad(clamp((p - 0.90) / (0.935 - 0.90), 0, 1))
  const completionOpacity = compT
  const completionY = lerp(6, 0, compT)

  return {
    globalP: p,
    sourceToPreviewP,
    previewToDestinationP,
    activeStepIndex,
    railProgressPct,
    railSteps,
    sourceStageOpacity,
    processStageOpacity,
    previewStageOpacity,
    destinationStageOpacity,
    sourceCenterOffsetFactor,
    previewCenterOffsetFactor,
    destinationCenterOffsetFactor,
    mobileSourceOpacity,
    mobileProcessOpacity,
    mobilePreviewOpacity,
    mobileDestinationOpacity,
    upstreamOpacity: sourceStageOpacity,
    upstreamScale: 1,
    previewContainerOpacity: previewStageOpacity,
    destinationContainerOpacity: destinationStageOpacity,
    completionOpacity,
    completionY,
    settledDestinationCount,
  }
}
