import {
  FEATURED_PROCESS_COURSE,
  PHASE05_MOTION_CONFIG,
  type SchoolImportCourse,
} from './schoolImportData'

export interface MorphRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CourseGeometryEntry {
  sourceRect: MorphRect
  stripRect: MorphRect
  secondaryStripRect?: MorphRect
  corridor2RowRect?: MorphRect
  previewRect: MorphRect
  destinationRect: MorphRect
}

export interface StageGeometryCache {
  isMobile: boolean
  viewportHeight: number
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
  staticCorridorStripOpacity?: number
  staticSecondaryStripOpacity?: number
  staticCorridor2RowOpacity?: number
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
  nodeSizePx: number // 6px -> 10px (current) -> 7.5px (done)
  nodeColor: string
  codeColor: string
  titleColor: string
  titleWeight: number
  subtitleColor: string
}

export interface Phase05MacroState {
  globalP: number
  corridorP: number
  processP: number
  corridor2P: number
  previewReadingP: number
  corridor3P: number
  finalReadingP: number
  sourceToPreviewP: number
  previewToDestinationP: number
  activeStepIndex: 0 | 1 | 2 | 3
  railProgressPct: number
  railSteps: StageRailStepState[]
  corridorTransitionHintOpacity: number
  corridorTransitionHintY: number
  corridor2TransitionHintOpacity: number
  corridor2TransitionHintY: number
  corridor3TransitionHintOpacity: number
  corridor3TransitionHintY: number
  // Active course motion telemetry for Round 1 / Round 2 / Round 3 verification
  activeMainCourseCount: number
  activeSecondaryCourseCount: number
  corridor2ActiveMainCourseCount: number
  corridor2ActiveSecondaryCourseCount: number
  corridor3ActiveMainCourseCount: number
  corridor3ActiveSecondaryCourseCount: number
  settledPreviewCount: number
  staticProcessEntryOpacity: number
  staticProcessFieldsOpacity: number
  corridor1ContainerOpacity: number
  corridor2ContainerOpacity: number
  corridor3ContainerOpacity: number
  // Spatial carrier offsets for Preview -> Destination simultaneous visibility in Corridor 3
  previewCarrierXPx: number
  previewCarrierYPx: number
  destinationCarrierXPx: number
  destinationCarrierYPx: number
  // Desktop StageViewport container opacities & centering offsets
  sourceStageOpacity: number
  processStageOpacity: number
  previewStageOpacity: number
  destinationStageOpacity: number
  sourceCenterOffsetFactor: number
  previewCenterOffsetFactor: number
  destinationCenterOffsetFactor: number
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
  // Completion caption
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
 * Computes the pure 2D spatial carrier offsets (no sticky, no pin, no scale)
 * for Preview and Destination during Corridor 3 so both stages remain
 * simultaneously visible in the viewport while continuously scrolling upward.
 */
export function computeCorridor3CarrierOffsets(
  globalP: number,
  viewportHeight: number,
  isMobile: boolean
): {
  previewCarrierXPx: number
  previewCarrierYPx: number
  destinationCarrierXPx: number
  destinationCarrierYPx: number
} {
  if (isMobile) {
    return {
      previewCarrierXPx: 0,
      previewCarrierYPx: 0,
      destinationCarrierXPx: 0,
      destinationCarrierYPx: 0,
    }
  }

  const p = clamp(globalP, 0, 1)
  const vhPx = (viewportHeight || 900) / 100
  const scrollVh = p * PHASE05_MOTION_CONFIG.totalActiveScrollVh

  // 1. Preview Carrier:
  // Zero offset for scrollVh <= 370vh (all of Round 1, 1.1, 2, and first 14vh of Preview Reading Space).
  // For scrollVh > 370vh, Preview continues moving upward in the viewport on every wheel tick
  // at 0.118vh per 1vh of scroll (so it stays visible in the upper-left throughout Corridor 3).
  let previewCarrierXPx = 0
  let previewCarrierYPx = 0
  if (scrollVh > 370) {
    const deltaVh = scrollVh - 370
    previewCarrierYPx = deltaVh * 0.882 * vhPx
    const shiftT = easeInOutQuad(clamp((scrollVh - 376) / 180, 0, 1))
    previewCarrierXPx = -24 * shiftT
  }

  // 2. Destination Carrier:
  // At scrollVh >= 616vh (Final Reading Space), Destination has zero carrier offset (pure native scroll).
  // During Corridor 3 (396vh -> 616vh), Destination rises continuously in the viewport from 52.2vh (470px)
  // to 30.67vh (276px) while gliding horizontally from +56px to 0px (centered).
  // During the lead-in (372vh -> 396vh), Destination enters the lower-right viewport from 104vh to 52.2vh.
  let destinationCarrierXPx = 0
  let destinationCarrierYPx = 0
  if (scrollVh < 396) {
    const leadInT = easeOutCubic(clamp((scrollVh - 372) / 24, 0, 1))
    const desiredViewportVh = lerp(104, 52.2, leadInT)
    const baseViewportVh = 646.67 - scrollVh
    destinationCarrierYPx = (desiredViewportVh - baseViewportVh) * vhPx
    destinationCarrierXPx = 56
  } else if (scrollVh < 616) {
    const remVh = 616 - scrollVh
    destinationCarrierYPx = -remVh * 0.90214 * vhPx
    const c3P = clamp((scrollVh - 396) / 220, 0, 1)
    destinationCarrierXPx = 56 * (1 - easeInOutCubic(c3P))
  }

  return {
    previewCarrierXPx,
    previewCarrierYPx,
    destinationCarrierXPx,
    destinationCarrierYPx,
  }
}

/**
 * Spatial Narrative Long Page (Round 1.1 + Round 2 + Round 3):
 * SourceZone -> Corridor 1 (D1=40vh, S1=20vh, 200vh) -> ProcessZone
 * -> Corridor 2 (D2=34vh, S2=17vh, 170vh) -> PreviewZone + Preview Reading Space (100vh)
 * -> Corridor 3 (D3=44vh, S3=22vh, 220vh) -> DestinationZone + Final Reading Space (92vh)
 */
export function computeLongPageRound1CourseState(
  globalP: number,
  course: SchoolImportCourse,
  _index: number,
  geometry: StageGeometryCache
): CourseMorphState {
  const p = clamp(globalP, 0, 1)
  const corridorP = clamp(
    (p - PHASE05_MOTION_CONFIG.corridorStartP) /
      (PHASE05_MOTION_CONFIG.corridorEndP - PHASE05_MOTION_CONFIG.corridorStartP),
    0,
    1
  )
  const processP = clamp(
    (p - PHASE05_MOTION_CONFIG.processStartP) /
      (PHASE05_MOTION_CONFIG.processEndP - PHASE05_MOTION_CONFIG.processStartP),
    0,
    1
  )
  const corridor2P = clamp(
    (p - PHASE05_MOTION_CONFIG.corridor2StartP) /
      (PHASE05_MOTION_CONFIG.corridor2EndP - PHASE05_MOTION_CONFIG.corridor2StartP),
    0,
    1
  )
  const corridor3P = clamp(
    (p - PHASE05_MOTION_CONFIG.corridor3StartP) /
      (PHASE05_MOTION_CONFIG.corridor3EndP - PHASE05_MOTION_CONFIG.corridor3StartP),
    0,
    1
  )

  const entry = geometry.courses[course.id]
  const fallbackRect: MorphRect = { x: 0, y: 0, width: 120, height: 38 }
  const sourceRect = entry?.sourceRect ?? fallbackRect
  const corridorStripRect = entry?.stripRect ?? geometry.stripLaneTopRect ?? fallbackRect
  const secondaryStripRect = entry?.secondaryStripRect ?? corridorStripRect
  const corridor2RowRect = entry?.corridor2RowRect ?? entry?.previewRect ?? fallbackRect
  const basePreviewRect = entry?.previewRect ?? corridor2RowRect
  const baseDestinationRect = entry?.destinationRect ?? basePreviewRect

  const carriers = computeCorridor3CarrierOffsets(
    p,
    geometry.viewportHeight || 900,
    geometry.isMobile
  )
  const previewRect: MorphRect = {
    x: basePreviewRect.x + carriers.previewCarrierXPx,
    y: basePreviewRect.y + carriers.previewCarrierYPx,
    width: basePreviewRect.width,
    height: basePreviewRect.height,
  }
  const destinationRect: MorphRect = {
    x: baseDestinationRect.x + carriers.destinationCarrierXPx,
    y: baseDestinationRect.y + carriers.destinationCarrierYPx,
    width: baseDestinationRect.width,
    height: baseDestinationRect.height,
  }
  const processEntryRect = geometry.stripLaneTopRect ?? corridorStripRect
  const processBoxRect = geometry.processBoxRect ?? fallbackRect

  // ===========================================================================
  // PHASE D: Corridor 3 (Preview Row -> Compact Record -> Destination Block)
  // & Final Reading Space (Sections 7, 8, 9, 10)
  // ===========================================================================
  if (corridor3P > 0.0001) {
    const rawC3Local =
      (corridor3P - course.corridor3StartP) /
      (course.corridor3EndP - course.corridor3StartP)
    const c3LocalP = clamp(rawC3Local, 0, 1)

    const isMobile = geometry.isMobile
    const targetRadius = isMobile ? 11 : 13
    const appBgHex = course.appTheme === 'warm' ? '#F3ECE1' : '#E9E7F7'

    // 1. Before this course's Corridor 3 write turn starts: stays crisp in Preview Row
    if (c3LocalP <= 0.0001) {
      return {
        courseId: course.id,
        stage: 'settled-preview',
        localP: 0,
        visible: false,
        zIndex: 25 + course.order,
        x: previewRect.x,
        y: previewRect.y,
        width: previewRect.width,
        height: previewRect.height,
        scale: 1,
        borderRadius: 8,
        backgroundColor: 'rgb(255, 255, 255)',
        borderAlpha: 0.075,
        shadowStrength: 0,
        overlayOpacity: 0,
        leftBarOpacity: 0.9,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 1,
        staticPreviewOpacity: 1,
        staticDestinationOpacity: 0,
      }
    }

    // 2. After Destination write finishes: static Destination Course Block owns display,
    // while Preview Row remains softly de-emphasized (0.28) so Preview list never jumps.
    if (c3LocalP >= 0.9999) {
      return {
        courseId: course.id,
        stage: 'settled-destination',
        localP: 1,
        visible: false,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 1,
        staticPreviewOpacity: 0.28,
        staticDestinationOpacity: 1,
      }
    }

    // Static Preview Row fades from 1.0 -> 0.28 (subtle written state, never collapses)
    const staticPreviewOpacity = lerp(1, 0.28, clamp(c3LocalP / 0.10, 0, 1))

    // Compact Record dimensions (Section 7 E2: compact structured capsule)
    const compactW = clamp(previewRect.width * 0.45, 188, 228)
    const compactH = 36

    // Straight-line waypoint from Preview Row toward Destination target cell (zero arc)
    const alignStartX =
      previewRect.x + (previewRect.width - compactW) * (0.15 + 0.55 * (course.dayCol / 4))
    const compactX = lerp(alignStartX, destinationRect.x, 0.22)
    const compactY = lerp(previewRect.y, destinationRect.y, 0.22)

    // E1: Preview Row Detach (c3LocalP: 0.00 -> 0.14)
    if (c3LocalP <= 0.14) {
      const u = c3LocalP / 0.14
      const e = easeOutQuad(u)
      return {
        courseId: course.id,
        stage: 'stage-e-detach-preview',
        localP: c3LocalP,
        visible: true,
        zIndex: 60 + course.order,
        x: previewRect.x,
        y: previewRect.y + 2 * e,
        width: previewRect.width,
        height: previewRect.height,
        scale: lerp(1, 0.99, e),
        borderRadius: lerp(8, 9, e),
        backgroundColor: interpolateHexColor('#FFFFFF', '#FAFAFC', e),
        borderAlpha: lerp(0.075, 0.095, e),
        shadowStrength: lerp(0.08, 0.28, e),
        overlayOpacity: 1,
        leftBarOpacity: 0.9,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 1,
        staticPreviewOpacity,
        staticDestinationOpacity: 0,
      }
    }

    // E2: Compact into Compact Record (c3LocalP: 0.14 -> 0.34)
    if (c3LocalP <= 0.34) {
      const u = (c3LocalP - 0.14) / (0.34 - 0.14)
      const e = easeInOutQuad(u)
      return {
        courseId: course.id,
        stage: 'stage-e-detach-preview',
        localP: c3LocalP,
        visible: true,
        zIndex: 60 + course.order,
        x: lerp(previewRect.x, compactX, e),
        y: lerp(previewRect.y + 2, compactY, e),
        width: lerp(previewRect.width, compactW, e),
        height: lerp(previewRect.height, compactH, e),
        scale: lerp(0.99, 1.0, e),
        borderRadius: lerp(9, 10, e),
        backgroundColor: 'rgb(255, 255, 255)',
        borderAlpha: lerp(0.095, 0.115, e),
        shadowStrength: lerp(0.28, 0.38, e),
        overlayOpacity: 1,
        leftBarOpacity: 0.92,
        leftBarToDotProgress: 1,
        sourceTextOpacity: 0,
        stripTextOpacity: 0,
        isNormalizedStrip: false,
        processLayerOpacity: 0,
        processLabelOpacity: 0,
        processAlignT: 1,
        previewTextOpacity: 1 - clamp(u / 0.42, 0, 1),
        compactRecordTextOpacity: clamp((u - 0.28) / 0.52, 0, 1),
        destinationTextOpacity: 0,
        staticSourceOpacity: 0,
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 1,
        staticPreviewOpacity: 0.28,
        staticDestinationOpacity: 0,
      }
    }

    // E3 & E4-a: Direct Straight-Line Write & Morph into Destination Course Block (0.34 -> 0.92)
    if (c3LocalP <= 0.92) {
      const u = (c3LocalP - 0.34) / (0.92 - 0.34)
      // Direct straight-line trajectory (zero Bézier arc, zero rotation, zero overshoot)
      const pT = 0.28 * u + 0.72 * easeInOutCubic(u)
      const morphDimT = easeInOutCubic(clamp((u - 0.34) / 0.58, 0, 1))
      const colorT = easeInOutQuad(clamp((u - 0.32) / 0.56, 0, 1))

      return {
        courseId: course.id,
        stage: 'stage-f-commit-destination',
        localP: c3LocalP,
        visible: true,
        zIndex: 55 + course.order,
        x: lerp(compactX, destinationRect.x, pT),
        y: lerp(compactY, destinationRect.y, pT),
        width: lerp(compactW, destinationRect.width, morphDimT),
        height: lerp(compactH, destinationRect.height, morphDimT),
        scale: 1,
        borderRadius: lerp(10, targetRadius, morphDimT),
        backgroundColor: interpolateHexColor('#FFFFFF', appBgHex, colorT),
        borderAlpha: lerp(0.115, 0, colorT),
        shadowStrength: lerp(0.38, 0.04, easeInOutQuad(clamp((u - 0.25) / 0.75, 0, 1))),
        overlayOpacity: 1,
        leftBarOpacity: lerp(0.92, 0, clamp((u - 0.32) / 0.26, 0, 1)),
        leftBarToDotProgress: 1,
        sourceTextOpacity: 0,
        stripTextOpacity: 0,
        isNormalizedStrip: false,
        processLayerOpacity: 0,
        processLabelOpacity: 0,
        processAlignT: 1,
        previewTextOpacity: 0,
        compactRecordTextOpacity: 1 - clamp((u - 0.38) / 0.18, 0, 1),
        destinationTextOpacity: clamp((u - 0.50) / 0.26, 0, 1),
        staticSourceOpacity: 0,
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 1,
        staticPreviewOpacity: 0.28,
        staticDestinationOpacity: 0,
      }
    }

    // E4-b: Flush Settle & Seamless Handoff to Static Destination Block (0.92 -> 1.00)
    const handoffT = clamp((c3LocalP - 0.92) / 0.08, 0, 1)
    return {
      courseId: course.id,
      stage: 'stage-f-commit-destination',
      localP: c3LocalP,
      visible: true,
      zIndex: 35 + course.order,
      x: destinationRect.x,
      y: destinationRect.y,
      width: destinationRect.width,
      height: destinationRect.height,
      scale: 1,
      borderRadius: targetRadius,
      backgroundColor: interpolateHexColor(appBgHex, appBgHex, 1),
      borderAlpha: 0,
      shadowStrength: lerp(0.04, 0, handoffT),
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
      staticCorridorStripOpacity: 1,
      staticSecondaryStripOpacity: 0.32,
      staticCorridor2RowOpacity: 1,
      staticPreviewOpacity: 0.28,
      staticDestinationOpacity: handoffT,
    }
  }

  // ===========================================================================
  // PHASE C: Corridor 2 (Process -> Preview Row) & Preview Reading Space
  // ===========================================================================
  if (corridor2P > 0.0001) {
    const rawC2Local =
      (corridor2P - course.corridor2StartP) /
      (course.corridor2EndP - course.corridor2StartP)
    const c2LocalP = clamp(rawC2Local, 0, 1)

    // 1. After Corridor 2 morph finishes: course is settled in Preview
    if (c2LocalP >= 0.9999) {
      return {
        courseId: course.id,
        stage: 'settled-preview',
        localP: 1,
        visible: false,
        zIndex: 25 + course.order,
        x: previewRect.x,
        y: previewRect.y,
        width: previewRect.width,
        height: previewRect.height,
        scale: 1,
        borderRadius: 8,
        backgroundColor: 'rgb(255, 255, 255)',
        borderAlpha: 0.075,
        shadowStrength: 0,
        overlayOpacity: 0,
        leftBarOpacity: 0.9,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 1,
        staticPreviewOpacity: 1,
        staticDestinationOpacity: 0,
      }
    }

    // 2. Before this course's Corridor 2 turn starts: rests in Process state
    if (c2LocalP <= 0.0001) {
      return {
        courseId: course.id,
        stage: 'stage-c-process',
        localP: 0,
        visible: false,
        zIndex: 25 + course.order,
        x: secondaryStripRect.x,
        y: secondaryStripRect.y,
        width: secondaryStripRect.width,
        height: secondaryStripRect.height,
        scale: 1,
        borderRadius: 6,
        backgroundColor: 'rgb(250, 250, 252)',
        borderAlpha: 0.06,
        shadowStrength: 0,
        overlayOpacity: 0,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 1,
        staticCorridor2RowOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    // 3A. Featured Course (Node.js应用开发, corridor2Index === 0):
    // Expanded 5-Row Field Panel -> Compressing Rows & Fading Labels -> Preview Row (Sections 4, 5, 10)
    if (course.id === FEATURED_PROCESS_COURSE.id) {
      const targetRect = corridor2RowRect
      const detachX = processBoxRect.x
      const detachY = processBoxRect.y + 8
      const detachH = lerp(processBoxRect.height, targetRect.height, 0.14)

      // Sub-stage C1-a (0.00 -> 0.14): Detach from Process 5-Row Field Box & begin label fade
      if (c2LocalP <= 0.14) {
        const u = c2LocalP / 0.14
        const e = easeOutQuad(u)
        return {
          courseId: course.id,
          stage: 'stage-d-preview',
          localP: c2LocalP,
          visible: true,
          zIndex: 70 + course.order,
          x: lerp(processBoxRect.x, detachX, e),
          y: lerp(processBoxRect.y, detachY, e),
          width: processBoxRect.width,
          height: lerp(processBoxRect.height, detachH, e),
          scale: 1,
          borderRadius: 12,
          backgroundColor: 'rgb(255, 255, 255)',
          borderAlpha: 0.095,
          shadowStrength: lerp(0.35, 0.48, e),
          overlayOpacity: 1,
          leftBarOpacity: 1,
          leftBarToDotProgress: 0,
          sourceTextOpacity: 0,
          stripTextOpacity: 0,
          isNormalizedStrip: true,
          processLayerOpacity: 1,
          processLabelOpacity: 1 - 0.45 * e,
          processAlignT: 1,
          previewTextOpacity: 0,
          compactRecordTextOpacity: 0,
          destinationTextOpacity: 0,
          staticSourceOpacity: 0,
          staticCorridorStripOpacity: 1,
          staticSecondaryStripOpacity: 1,
          staticCorridor2RowOpacity: 0,
          staticPreviewOpacity: 0,
          staticDestinationOpacity: 0,
        }
      }

      // Sub-stage C1-b (0.14 -> 0.88): Continuous Compaction (5 Rows -> Preview Row)
      if (c2LocalP <= 0.88) {
        const u = (c2LocalP - 0.14) / (0.88 - 0.14)
        const ePos = 0.25 * u + 0.75 * easeInOutCubic(u)
        const eHeight = easeInOutCubic(u)
        const dotT = easeInOutQuad(clamp((u - 0.12) / 0.68, 0, 1))

        return {
          courseId: course.id,
          stage: 'stage-d-preview',
          localP: c2LocalP,
          visible: true,
          zIndex: 70 + course.order,
          x: lerp(detachX, targetRect.x, ePos),
          y: lerp(detachY, targetRect.y, ePos),
          width: lerp(processBoxRect.width, targetRect.width, ePos),
          height: lerp(detachH, targetRect.height, eHeight),
          scale: 1,
          borderRadius: lerp(12, 9, ePos),
          backgroundColor: 'rgb(255, 255, 255)',
          borderAlpha: lerp(0.095, 0.08, ePos),
          shadowStrength: lerp(0.48, 0.26, ePos),
          overlayOpacity: 1,
          leftBarOpacity: lerp(1, 0.9, dotT),
          leftBarToDotProgress: dotT,
          sourceTextOpacity: 0,
          stripTextOpacity: 0,
          isNormalizedStrip: true,
          processLayerOpacity: 1 - clamp((u - 0.14) / 0.22, 0, 1),
          processLabelOpacity: 0.65 * (1 - clamp(u / 0.26, 0, 1)),
          processAlignT: 1,
          previewTextOpacity: clamp((u - 0.28) / 0.22, 0, 1),
          compactRecordTextOpacity: 0,
          destinationTextOpacity: 0,
          staticSourceOpacity: 0,
          staticCorridorStripOpacity: 1,
          staticSecondaryStripOpacity: 1,
          staticCorridor2RowOpacity: 0,
          staticPreviewOpacity: 0,
          staticDestinationOpacity: 0,
        }
      }

      // Sub-stage C1-c (0.88 -> 1.00): Flush Settle into Preview Row Slot
      const handoffT = clamp((c2LocalP - 0.88) / 0.12, 0, 1)
      return {
        courseId: course.id,
        stage: 'stage-d-preview',
        localP: c2LocalP,
        visible: true,
        zIndex: 55 + course.order,
        x: targetRect.x,
        y: targetRect.y,
        width: targetRect.width,
        height: targetRect.height,
        scale: 1,
        borderRadius: 9,
        backgroundColor: 'rgb(255, 255, 255)',
        borderAlpha: 0.08,
        shadowStrength: lerp(0.26, 0, handoffT),
        overlayOpacity: 1 - handoffT,
        leftBarOpacity: 0.9,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 1,
        staticCorridor2RowOpacity: handoffT,
        staticPreviewOpacity: handoffT,
        staticDestinationOpacity: 0,
      }
    }

    // 3B. Remaining 8 Courses (corridor2Index = 1..8):
    // Processed Data Strip -> Preview Row directly (Section 6: never expand 5-row fields)
    // Courses 6, 7 & 8 land directly into their final rows inside ImportPreviewStage as Preview rises into viewport
    const landsDirectlyInPreviewCard = course.corridor2Index >= 6
    const targetRect = landsDirectlyInPreviewCard ? previewRect : corridor2RowRect
    const vh = geometry.viewportHeight || 900
    const travelY = Math.min(96, Math.max(76, vh * 0.095))

    const isDirectFromSecondaryTray = course.corridor2Index === 1
    const startX = isDirectFromSecondaryTray ? secondaryStripRect.x : targetRect.x
    const startY = isDirectFromSecondaryTray
      ? secondaryStripRect.y
      : targetRect.y - travelY
    const startW = isDirectFromSecondaryTray
      ? secondaryStripRect.width
      : targetRect.width
    const startH = isDirectFromSecondaryTray
      ? Math.max(32, secondaryStripRect.height)
      : 36

    const staticSecondaryStripOpacity = 1 - clamp(c2LocalP / 0.14, 0, 1) * 0.68

    // Sub-stage C2-a (0.00 -> 0.12): Light Detach as Processed Data Strip
    if (c2LocalP <= 0.12) {
      const u = c2LocalP / 0.12
      const e = easeOutQuad(u)
      return {
        courseId: course.id,
        stage: 'stage-d-preview',
        localP: c2LocalP,
        visible: true,
        zIndex: 55 + course.order,
        x: startX,
        y: lerp(startY, startY + 8, e),
        width: startW,
        height: startH,
        scale: lerp(1, 1.01, e),
        borderRadius: 8,
        backgroundColor: 'rgb(250, 250, 252)',
        borderAlpha: 0.085,
        shadowStrength: 0.28 * e,
        overlayOpacity: isDirectFromSecondaryTray ? 1 : clamp(u / 0.45, 0, 1),
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity,
        staticCorridor2RowOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    // Sub-stage C2-b (0.12 -> 0.88): Continuous Morph from Processed Data Strip -> Preview Row
    if (c2LocalP <= 0.88) {
      const u = (c2LocalP - 0.12) / (0.88 - 0.12)
      const ePos = 0.25 * u + 0.75 * easeInOutCubic(u)
      const dotT = easeInOutQuad(clamp((u - 0.14) / 0.56, 0, 1))

      return {
        courseId: course.id,
        stage: 'stage-d-preview',
        localP: c2LocalP,
        visible: true,
        zIndex: 55 + course.order,
        x: lerp(startX, targetRect.x, ePos),
        y: lerp(startY + 8, targetRect.y, ePos),
        width: lerp(startW, targetRect.width, ePos),
        height: lerp(startH, targetRect.height, ePos),
        scale: lerp(1.01, 1.0, ePos),
        borderRadius: lerp(8, 9, ePos),
        backgroundColor: interpolateHexColor('#FAFAFC', '#FFFFFF', ePos),
        borderAlpha: lerp(0.085, 0.08, ePos),
        shadowStrength: lerp(0.28, 0.24, ePos),
        overlayOpacity: 1,
        leftBarOpacity: lerp(1, 0.9, dotT),
        leftBarToDotProgress: dotT,
        sourceTextOpacity: 0,
        stripTextOpacity: 1 - clamp(u / 0.26, 0, 1),
        isNormalizedStrip: true,
        processLayerOpacity: 0,
        processLabelOpacity: 0,
        processAlignT: 1,
        previewTextOpacity: clamp((u - 0.22) / 0.34, 0, 1),
        compactRecordTextOpacity: 0,
        destinationTextOpacity: 0,
        staticSourceOpacity: 0,
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 0.32,
        staticCorridor2RowOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    // Sub-stage C2-c (0.88 -> 1.00): Flush Settle into Preview Row
    const handoffT = clamp((c2LocalP - 0.88) / 0.12, 0, 1)
    return {
      courseId: course.id,
      stage: 'stage-d-preview',
      localP: c2LocalP,
      visible: true,
      zIndex: 45 + course.order,
      x: targetRect.x,
      y: targetRect.y,
      width: targetRect.width,
      height: targetRect.height,
      scale: 1,
      borderRadius: 9,
      backgroundColor: 'rgb(255, 255, 255)',
      borderAlpha: 0.08,
      shadowStrength: lerp(0.24, 0, handoffT),
      overlayOpacity: 1 - handoffT,
      leftBarOpacity: 0.9,
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
      staticCorridorStripOpacity: 1,
      staticSecondaryStripOpacity: 0.32,
      staticCorridor2RowOpacity: landsDirectlyInPreviewCard ? 0 : handoffT,
      staticPreviewOpacity: handoffT,
      staticDestinationOpacity: 0,
    }
  }

  // ===========================================================================
  // PHASE B: Process Zone Expansion for Fixed Featured Course (Node.js应用开发)
  // ===========================================================================
  if (course.id === FEATURED_PROCESS_COURSE.id && processP > 0.0001) {
    if (processP >= 0.9999) {
      return {
        courseId: course.id,
        stage: 'stage-c-process',
        localP: 1,
        visible: false,
        zIndex: 60 + course.order,
        x: processBoxRect.x,
        y: processBoxRect.y,
        width: processBoxRect.width,
        height: processBoxRect.height,
        scale: 1,
        borderRadius: 12,
        backgroundColor: 'rgb(255, 255, 255)',
        borderAlpha: 0.085,
        shadowStrength: 0,
        overlayOpacity: 0,
        leftBarOpacity: 1,
        leftBarToDotProgress: 0,
        sourceTextOpacity: 0,
        stripTextOpacity: 0,
        isNormalizedStrip: false,
        processLayerOpacity: 1,
        processLabelOpacity: 1,
        processAlignT: 1,
        previewTextOpacity: 0,
        compactRecordTextOpacity: 0,
        destinationTextOpacity: 0,
        staticSourceOpacity: 0,
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 1,
        staticCorridor2RowOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    // Sub-stage B1 (0.00 -> 0.56): Data Strip -> 5-Row Field Expansion
    if (processP <= 0.56) {
      const u = clamp(processP / 0.56, 0, 1)
      const e = easeInOutCubic(u)

      return {
        courseId: course.id,
        stage: 'stage-c-process',
        localP: processP,
        visible: true,
        zIndex: 65 + course.order,
        x: lerp(processEntryRect.x, processBoxRect.x, e),
        y: lerp(processEntryRect.y, processBoxRect.y, e),
        width: lerp(processEntryRect.width, processBoxRect.width, e),
        height: lerp(processEntryRect.height, processBoxRect.height, e),
        scale: 1,
        borderRadius: lerp(8, 12, e),
        backgroundColor: interpolateHexColor('#FAFAFC', '#FFFFFF', e),
        borderAlpha: lerp(0.085, 0.095, e),
        shadowStrength: lerp(0.28, 0.45, e),
        overlayOpacity: 1,
        leftBarOpacity: 1,
        leftBarToDotProgress: 0,
        sourceTextOpacity: 0,
        stripTextOpacity: 1 - clamp(u / 0.45, 0, 1),
        isNormalizedStrip: false,
        processLayerOpacity: clamp((u - 0.16) / 0.62, 0, 1),
        processLabelOpacity: clamp((u - 0.28) / 0.62, 0, 1),
        processAlignT: easeOutQuad(clamp((u - 0.18) / 0.82, 0, 1)) * 0.72,
        previewTextOpacity: 0,
        compactRecordTextOpacity: 0,
        destinationTextOpacity: 0,
        staticSourceOpacity: 0,
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 1,
        staticCorridor2RowOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    // Sub-stage B2 (0.56 -> 0.88): 5-Row Field Alignment Lock
    if (processP <= 0.88) {
      const u = (processP - 0.56) / (0.88 - 0.56)
      const alignFinish = 0.72 + 0.28 * easeOutCubic(clamp(u / 0.65, 0, 1))

      return {
        courseId: course.id,
        stage: 'stage-c-process',
        localP: processP,
        visible: true,
        zIndex: 65 + course.order,
        x: processBoxRect.x,
        y: processBoxRect.y,
        width: processBoxRect.width,
        height: processBoxRect.height,
        scale: 1,
        borderRadius: 12,
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
        staticCorridorStripOpacity: 1,
        staticSecondaryStripOpacity: 1,
        staticCorridor2RowOpacity: 0,
        staticPreviewOpacity: 0,
        staticDestinationOpacity: 0,
      }
    }

    // Sub-stage B3 (0.88 -> 1.00): Seamless Handoff to Static 5-Row Field Table
    const handoffT = clamp((processP - 0.88) / 0.12, 0, 1)
    return {
      courseId: course.id,
      stage: 'stage-c-process',
      localP: processP,
      visible: true,
      zIndex: 65 + course.order,
      x: processBoxRect.x,
      y: processBoxRect.y,
      width: processBoxRect.width,
      height: processBoxRect.height,
      scale: 1,
      borderRadius: 12,
      backgroundColor: 'rgb(255, 255, 255)',
      borderAlpha: lerp(0.095, 0.06, handoffT),
      shadowStrength: lerp(0.45, 0, handoffT),
      overlayOpacity: 1 - handoffT,
      leftBarOpacity: 1,
      leftBarToDotProgress: 0,
      sourceTextOpacity: 0,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 1,
      processLabelOpacity: 1,
      processAlignT: 1,
      previewTextOpacity: 0,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticCorridorStripOpacity: 1,
      staticSecondaryStripOpacity: 1,
      staticCorridor2RowOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // ===========================================================================
  // PHASE A: Corridor 1 Extraction & Morph (Source Course Block -> Data Strip)
  // ===========================================================================
  const rawLocal = (corridorP - course.startP) / (course.endP - course.startP)
  const localP = clamp(rawLocal, 0, 1)

  // 1. Before extraction begins: course rests in SourceScheduleStage
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
      staticCorridorStripOpacity: 0,
      staticSecondaryStripOpacity: 1,
      staticCorridor2RowOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // 2. After Corridor 1 morph finishes: static Corridor Data Strip owns display
  if (localP >= 0.9999) {
    return {
      courseId: course.id,
      stage: 'stage-b-stream',
      localP: 1,
      visible: false,
      zIndex: 20 + course.order,
      x: corridorStripRect.x,
      y: corridorStripRect.y,
      width: corridorStripRect.width,
      height: corridorStripRect.height,
      scale: 1,
      borderRadius: 8,
      backgroundColor: 'rgb(250, 250, 252)',
      borderAlpha: 0.085,
      shadowStrength: 0,
      overlayOpacity: 0,
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
      staticCorridorStripOpacity: 1,
      staticSecondaryStripOpacity: 1,
      staticCorridor2RowOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  const vh = geometry.viewportHeight || 900
  const travelY = Math.min(104, Math.max(82, vh * 0.105))
  const startX = sourceRect.x
  const startY =
    _index === 0 ? sourceRect.y : Math.max(sourceRect.y, corridorStripRect.y - travelY)
  const isDirectFromSource = _index === 0 || Math.abs(startY - sourceRect.y) < 16

  const staticSourceOpacity = 1 - clamp(localP / 0.08, 0, 1)
  const detachX = startX + (geometry.isMobile ? 0 : 4)
  const detachY = startY + 10

  // Sub-stage A1 (0.00 -> 0.12): Detach from Source Block
  if (localP <= 0.12) {
    const u = localP / 0.12
    const e = easeOutQuad(u)
    return {
      courseId: course.id,
      stage: 'stage-a-extract',
      localP,
      visible: true,
      zIndex: 40 + course.order,
      x: lerp(startX, detachX, e),
      y: lerp(startY, detachY, e),
      width: sourceRect.width,
      height: sourceRect.height,
      scale: lerp(1, 1.015, e),
      borderRadius: lerp(5, 6, e),
      backgroundColor: course.sourceColor,
      borderAlpha: 0,
      shadowStrength: 0.52 * e,
      overlayOpacity: isDirectFromSource ? 1 : clamp(u / 0.45, 0, 1),
      leftBarOpacity: 0,
      leftBarToDotProgress: 0,
      sourceTextOpacity: 1 - 0.08 * e,
      stripTextOpacity: 0,
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 0,
      previewTextOpacity: 0,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity,
      staticCorridorStripOpacity: 0,
      staticSecondaryStripOpacity: 1,
      staticCorridor2RowOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // Sub-stage A2 (0.12 -> 0.90): Continuous Morph from Source Course Block -> Data Strip
  if (localP <= 0.90) {
    const u = (localP - 0.12) / (0.90 - 0.12)
    const ePos = 0.25 * u + 0.75 * easeInOutCubic(u)
    const eHeight = easeOutCubic(u)
    const colorT = easeInOutQuad(clamp((u - 0.08) / 0.80, 0, 1))

    return {
      courseId: course.id,
      stage: 'stage-a-extract',
      localP,
      visible: true,
      zIndex: 40 + course.order,
      x: lerp(detachX, corridorStripRect.x, ePos),
      y: lerp(detachY, corridorStripRect.y, ePos),
      width: lerp(sourceRect.width, corridorStripRect.width, ePos),
      height: lerp(sourceRect.height, corridorStripRect.height, eHeight),
      scale: lerp(1.015, 1.0, ePos),
      borderRadius: lerp(6, 8, ePos),
      backgroundColor: interpolateHexColor(course.sourceColor, '#FAFAFC', colorT),
      borderAlpha: lerp(0, 0.085, colorT),
      shadowStrength: lerp(0.52, 0.28, ePos),
      overlayOpacity: 1,
      leftBarOpacity: clamp((u - 0.14) / 0.45, 0, 1),
      leftBarToDotProgress: 0,
      sourceTextOpacity: 1 - clamp(u / 0.48, 0, 1),
      stripTextOpacity: clamp((u - 0.30) / 0.52, 0, 1),
      isNormalizedStrip: false,
      processLayerOpacity: 0,
      processLabelOpacity: 0,
      processAlignT: 0,
      previewTextOpacity: 0,
      compactRecordTextOpacity: 0,
      destinationTextOpacity: 0,
      staticSourceOpacity: 0,
      staticCorridorStripOpacity: 0,
      staticSecondaryStripOpacity: 1,
      staticCorridor2RowOpacity: 0,
      staticPreviewOpacity: 0,
      staticDestinationOpacity: 0,
    }
  }

  // Sub-stage A3 (0.90 -> 1.00): Flush Settle into Corridor Data Strip Slot
  const handoffT = clamp((localP - 0.90) / 0.10, 0, 1)
  return {
    courseId: course.id,
    stage: 'stage-b-stream',
    localP,
    visible: true,
    zIndex: 30 + course.order,
    x: corridorStripRect.x,
    y: corridorStripRect.y,
    width: corridorStripRect.width,
    height: corridorStripRect.height,
    scale: 1,
    borderRadius: 8,
    backgroundColor: 'rgb(250, 250, 252)',
    borderAlpha: 0.085,
    shadowStrength: lerp(0.28, 0, handoffT),
    overlayOpacity: 1 - handoffT,
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
    staticCorridorStripOpacity: handoffT,
    staticSecondaryStripOpacity: 1,
    staticCorridor2RowOpacity: 0,
    staticPreviewOpacity: 0,
    staticDestinationOpacity: 0,
  }
}

/**
 * Unified Phase 05 Course State Coordinator for globalP in [0, 1].
 */
export function computeFullPhase05CourseState(
  globalP: number,
  course: SchoolImportCourse,
  index: number,
  geometry: StageGeometryCache
): CourseMorphState {
  return computeLongPageRound1CourseState(globalP, course, index, geometry)
}

/**
 * Macro Stage State for Phase 05 Long Page Prototype Round 3:
 * Complete Spatial Narrative Long Page:
 * Source (01) -> Process (02) -> Preview (03) -> Destination (04) + Final Reading Space.
 */
export function computePhase05MacroState(
  globalP: number,
  courses: SchoolImportCourse[],
  viewportHeight = 900,
  isMobile = false
): Phase05MacroState {
  const p = clamp(globalP, 0, 1)
  const corridorP = clamp(
    (p - PHASE05_MOTION_CONFIG.corridorStartP) /
      (PHASE05_MOTION_CONFIG.corridorEndP - PHASE05_MOTION_CONFIG.corridorStartP),
    0,
    1
  )
  const processP = clamp(
    (p - PHASE05_MOTION_CONFIG.processStartP) /
      (PHASE05_MOTION_CONFIG.processEndP - PHASE05_MOTION_CONFIG.processStartP),
    0,
    1
  )
  const corridor2P = clamp(
    (p - PHASE05_MOTION_CONFIG.corridor2StartP) /
      (PHASE05_MOTION_CONFIG.corridor2EndP - PHASE05_MOTION_CONFIG.corridor2StartP),
    0,
    1
  )
  const previewReadingP = clamp(
    (p - PHASE05_MOTION_CONFIG.previewReadingStartP) /
      (PHASE05_MOTION_CONFIG.previewReadingEndP -
        PHASE05_MOTION_CONFIG.previewReadingStartP),
    0,
    1
  )
  const corridor3P = clamp(
    (p - PHASE05_MOTION_CONFIG.corridor3StartP) /
      (PHASE05_MOTION_CONFIG.corridor3EndP - PHASE05_MOTION_CONFIG.corridor3StartP),
    0,
    1
  )
  const finalReadingP = clamp(
    (p - PHASE05_MOTION_CONFIG.finalReadingStartP) /
      (PHASE05_MOTION_CONFIG.finalReadingEndP -
        PHASE05_MOTION_CONFIG.finalReadingStartP),
    0,
    1
  )

  // Count active main-motion (localP in [0.25, 0.75]) and secondary-motion courses in Corridor 1
  let activeMainCourseCount = 0
  let activeSecondaryCourseCount = 0
  if (corridorP > 0 && corridorP < 1) {
    for (const c of courses) {
      const lp = (corridorP - c.startP) / (c.endP - c.startP)
      if (lp > 0.001 && lp < 0.999) {
        if (lp >= 0.25 && lp <= 0.75) {
          activeMainCourseCount++
        } else {
          activeSecondaryCourseCount++
        }
      }
    }
  }

  // Count active main-motion (localP in [0.25, 0.75]) and secondary-motion courses in Corridor 2
  let corridor2ActiveMainCourseCount = 0
  let corridor2ActiveSecondaryCourseCount = 0
  let settledPreviewCount = 0
  if (corridor2P > 0) {
    for (const c of courses) {
      const lp = (corridor2P - c.corridor2StartP) / (c.corridor2EndP - c.corridor2StartP)
      if (lp >= 0.96) {
        settledPreviewCount++
      }
      if (corridor2P < 1 && lp > 0.001 && lp < 0.999) {
        if (lp >= 0.25 && lp <= 0.75) {
          corridor2ActiveMainCourseCount++
        } else {
          corridor2ActiveSecondaryCourseCount++
        }
      }
    }
  }

  // Count active main-motion (localP in [0.25, 0.75]) and secondary-motion courses in Corridor 3
  let corridor3ActiveMainCourseCount = 0
  let corridor3ActiveSecondaryCourseCount = 0
  let settledDestinationCount = 0
  if (corridor3P > 0) {
    for (const c of courses) {
      const lp = (corridor3P - c.corridor3StartP) / (c.corridor3EndP - c.corridor3StartP)
      if (lp >= 0.96) {
        settledDestinationCount++
      }
      if (corridor3P < 1 && lp > 0.001 && lp < 0.999) {
        if (lp >= 0.25 && lp <= 0.75) {
          corridor3ActiveMainCourseCount++
        } else {
          corridor3ActiveSecondaryCourseCount++
        }
      }
    }
  }

  // Active step index across 01 -> 02 -> 03 -> 04
  let activeStepIndex: 0 | 1 | 2 | 3 = 0
  if (corridor3P >= 0.52) {
    activeStepIndex = 3
  } else if (corridor2P >= 0.58) {
    activeStepIndex = 2
  } else if (corridorP >= 0.65) {
    activeStepIndex = 1
  }

  // Continuous StageRail weights across 01 -> 02 -> 03 -> 04 (Sections 21 & 22)
  const step01DeWeightT = easeInOutQuad(clamp((corridorP - 0.15) / 0.62, 0, 1))
  const step01Active = 1 - step01DeWeightT
  const step01Done = step01DeWeightT
  const step01SegmentFill = clamp(corridorP / 0.85, 0, 1)

  const step02StrengthenT = easeInOutQuad(clamp((corridorP - 0.32) / 0.56, 0, 1))
  const step02DeWeightT = easeInOutQuad(clamp((corridor2P - 0.14) / 0.62, 0, 1))
  const step02Active = step02StrengthenT * (1 - step02DeWeightT)
  const step02Done = step02DeWeightT
  const step02SegmentFill = clamp(
    processP * 0.22 + clamp(corridor2P / 0.88, 0, 1) * 0.78,
    0,
    1
  )

  const step03StrengthenT = easeInOutQuad(clamp((corridor2P - 0.28) / 0.56, 0, 1))
  const step03DeWeightT = easeInOutQuad(clamp((corridor3P - 0.14) / 0.62, 0, 1))
  const step03Active = step03StrengthenT * (1 - step03DeWeightT)
  const step03Done = step03DeWeightT
  const step03SegmentFill = clamp(
    previewReadingP * 0.22 + clamp(corridor3P / 0.88, 0, 1) * 0.78,
    0,
    1
  )

  const step04StrengthenT = easeInOutQuad(clamp((corridor3P - 0.26) / 0.56, 0, 1))
  const step04Active = step04StrengthenT
  const step04Done = clamp(finalReadingP / 0.65, 0, 1) * 0.35
  const step04SegmentFill = clamp(
    clamp((corridor3P - 0.35) / 0.65, 0, 1) * 0.75 + finalReadingP * 0.25,
    0,
    1
  )

  // Auxiliary transition semantic hints
  const hint1FadeIn = clamp((corridorP - 0.03) / 0.12, 0, 1)
  const hint1FadeOut = 1 - clamp((corridorP - 0.72) / 0.16, 0, 1)
  const corridorTransitionHintOpacity = easeInOutQuad(hint1FadeIn * hint1FadeOut)
  const corridorTransitionHintY = lerp(3, 0, hint1FadeIn)

  const hint2FadeIn = clamp((corridor2P - 0.04) / 0.14, 0, 1)
  const hint2FadeOut = 1 - clamp((corridor2P - 0.74) / 0.16, 0, 1)
  const corridor2TransitionHintOpacity = easeInOutQuad(hint2FadeIn * hint2FadeOut)
  const corridor2TransitionHintY = lerp(3, 0, hint2FadeIn)

  const hint3FadeIn = clamp((corridor3P - 0.04) / 0.14, 0, 1)
  const hint3FadeOut = 1 - clamp((corridor3P - 0.76) / 0.16, 0, 1)
  const corridor3TransitionHintOpacity = easeInOutQuad(hint3FadeIn * hint3FadeOut)
  const corridor3TransitionHintY = lerp(3, 0, hint3FadeIn)

  const buildStepStyle = (
    idx: number,
    activeWeight: number,
    doneWeight: number,
    segmentFill: number
  ): StageRailStepState => {
    const railWidthPx = lerp(lerp(1.0, 2.0, doneWeight), 3.5, activeWeight)
    const doneRailHex = interpolateHexColor(
      '#D4D4D8',
      '#52525B',
      clamp(doneWeight + segmentFill * 0.55, 0, 1)
    )
    const railColor = interpolateHexColor(doneRailHex, '#111111', activeWeight)

    const nodeSizePx = lerp(lerp(6.0, 7.5, doneWeight), 10.0, activeWeight)
    const doneNodeHex = interpolateHexColor('#D4D4D8', '#52525B', doneWeight)
    const nodeColor = interpolateHexColor(doneNodeHex, '#111111', activeWeight)

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
  }

  const railSteps: StageRailStepState[] = [
    buildStepStyle(0, step01Active, step01Done, step01SegmentFill),
    buildStepStyle(1, step02Active, step02Done, step02SegmentFill),
    buildStepStyle(2, step03Active, step03Done, step03SegmentFill),
    buildStepStyle(3, step04Active, step04Done, step04SegmentFill),
  ]

  const railProgressPct = clamp(
    (step01SegmentFill * 0.25 +
      step02SegmentFill * 0.25 +
      step03SegmentFill * 0.25 +
      step04SegmentFill * 0.25) *
      100,
    4,
    100
  )

  // Process Zone static handoff opacities for Node.js应用开发
  const staticProcessEntryOpacity =
    processP <= 0.0001 ? 1 : 1 - clamp(processP / 0.08, 0, 1)
  let staticProcessFieldsOpacity = 0.16
  if (corridor2P > 0.0001) {
    const c2FeaturedLocalP = clamp(
      (corridor2P - FEATURED_PROCESS_COURSE.corridor2StartP) /
        (FEATURED_PROCESS_COURSE.corridor2EndP - FEATURED_PROCESS_COURSE.corridor2StartP),
      0,
      1
    )
    staticProcessFieldsOpacity = 1 - clamp(c2FeaturedLocalP / 0.08, 0, 1)
  } else if (processP > 0.0001 && processP < 0.88) {
    staticProcessFieldsOpacity = 0.04
  } else if (processP >= 0.88) {
    const handoffT = clamp((processP - 0.88) / 0.12, 0, 1)
    staticProcessFieldsOpacity = lerp(0.08, 1.0, handoffT)
  }

  // Visual weight hierarchy across Corridor 2 & Corridor 3 (Section 6 & Section 15)
  const corridor1ContainerOpacity = 1 - clamp((corridor2P - 0.05) / 0.35, 0, 1) * 0.78
  const processStageOpacity = 1 - easeInOutQuad(clamp((corridor2P - 0.25) / 0.55, 0, 1)) * 0.72
  const corridor2ContainerOpacity = 1 - easeInOutQuad(clamp((corridor2P - 0.82) / 0.16, 0, 1))
  const corridor3ContainerOpacity = 1 - easeInOutQuad(clamp((corridor3P - 0.88) / 0.12, 0, 1))

  // Preview visual weight:
  // - 1.00 during Preview Reading Space and start of Corridor 3
  // - De-weights smoothly across Corridor 3 (0.05 -> 0.88) from 1.00 -> 0.30 (historical context)
  // - Fades out (0.88 -> 0.99) to 0.00 as the final course settles so Destination is the sole protagonist
  let previewStageOpacity = 1
  if (corridor3P > 0.88) {
    previewStageOpacity = lerp(0.30, 0, easeInOutQuad(clamp((corridor3P - 0.88) / 0.11, 0, 1)))
  } else if (corridor3P > 0.05) {
    previewStageOpacity = lerp(1.0, 0.30, easeInOutQuad(clamp((corridor3P - 0.05) / 0.83, 0, 1)))
  }

  // Destination visual weight:
  // - 0.00 during Preview Stable (previewReadingP <= 0.40)
  // - Rises to 0.82 during the lead-in (previewReadingP: 0.40 -> 1.00) before Course 0 moves
  // - Strengthens to 1.00 across the first half of Corridor 3 (corridor3P: 0.00 -> 0.55)
  let destinationStageOpacity = 0
  if (corridor3P > 0.0001) {
    destinationStageOpacity = lerp(0.82, 1.0, easeOutQuad(clamp(corridor3P / 0.55, 0, 1)))
  } else if (previewReadingP > 0.40) {
    destinationStageOpacity = lerp(
      0,
      0.82,
      easeOutQuad(clamp((previewReadingP - 0.40) / 0.60, 0, 1))
    )
  }

  // Spatial carrier offsets for simultaneous visibility in Corridor 3
  const carriers = computeCorridor3CarrierOffsets(p, viewportHeight, isMobile)

  // Completion status copy (Section 18): fades in cleanly as the 9th course settles (corridor3P: 0.88 -> 1.00)
  const completionT = easeOutCubic(clamp((corridor3P - 0.88) / 0.12, 0, 1))
  const completionOpacity = completionT
  const completionY = lerp(6, 0, completionT)

  return {
    globalP: p,
    corridorP,
    processP,
    corridor2P,
    previewReadingP,
    corridor3P,
    finalReadingP,
    sourceToPreviewP: corridorP,
    previewToDestinationP: corridor3P,
    activeStepIndex,
    railProgressPct,
    railSteps,
    corridorTransitionHintOpacity,
    corridorTransitionHintY,
    corridor2TransitionHintOpacity,
    corridor2TransitionHintY,
    corridor3TransitionHintOpacity,
    corridor3TransitionHintY,
    activeMainCourseCount,
    activeSecondaryCourseCount,
    corridor2ActiveMainCourseCount,
    corridor2ActiveSecondaryCourseCount,
    corridor3ActiveMainCourseCount,
    corridor3ActiveSecondaryCourseCount,
    settledPreviewCount,
    staticProcessEntryOpacity,
    staticProcessFieldsOpacity,
    corridor1ContainerOpacity,
    corridor2ContainerOpacity,
    corridor3ContainerOpacity,
    previewCarrierXPx: carriers.previewCarrierXPx,
    previewCarrierYPx: carriers.previewCarrierYPx,
    destinationCarrierXPx: carriers.destinationCarrierXPx,
    destinationCarrierYPx: carriers.destinationCarrierYPx,
    sourceStageOpacity: 1,
    processStageOpacity,
    previewStageOpacity,
    destinationStageOpacity,
    sourceCenterOffsetFactor: 0,
    previewCenterOffsetFactor: 0,
    destinationCenterOffsetFactor: 0,
    mobileSourceOpacity: 1,
    mobileProcessOpacity: 1,
    mobilePreviewOpacity: previewStageOpacity,
    mobileDestinationOpacity: destinationStageOpacity,
    upstreamOpacity: previewStageOpacity,
    upstreamScale: 1,
    previewContainerOpacity: previewStageOpacity,
    destinationContainerOpacity: destinationStageOpacity,
    completionOpacity,
    completionY,
    settledDestinationCount,
  }
}


