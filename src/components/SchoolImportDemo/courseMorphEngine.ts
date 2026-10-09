import { INPLACE_PROTOTYPE_CONFIG, type SchoolImportCourse } from './schoolImportData'

export type TextSimplifyVariant = 'A' | 'B'

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function remap(val: number, inMin: number, inMax: number): number {
  if (inMax <= inMin) return val >= inMax ? 1 : 0
  return clamp((val - inMin) / (inMax - inMin), 0, 1)
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function easeOutCubic(t: number): number {
  const x = clamp(t, 0, 1)
  return 1 - Math.pow(1 - x, 3)
}

function parseColorToRgb(color: string): [number, number, number] {
  const trimmed = color.trim()
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

export function interpolateHexColor(colorA: string, colorB: string, t: number): string {
  const clamped = clamp(t, 0, 1)
  const [r1, g1, b1] = parseColorToRgb(colorA)
  const [r2, g2, b2] = parseColorToRgb(colorB)
  const r = Math.round(lerp(r1, r2, clamped))
  const g = Math.round(lerp(g1, g2, clamped))
  const b = Math.round(lerp(b1, b2, clamped))
  const toHex = (n: number) => clamp(n, 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export interface InPlaceCourseCardVisualState {
  /** Base card background under the fill layer (editorial proof white -> soft App card base) */
  cardBaseBg: string
  /** Fill layer background color (high-saturation school color -> App warm beige / lavender) */
  fillLayerColor: string
  /** Right inset % of the fill layer: 0% (full fill) -> 100% (clamped to 3px left tag) -> 0% (full App fill) */
  fillRightInsetPercent: number
  /** Minimum pixel width of the fill layer so that at full retraction it is an exact 3px color tag */
  fillMinLeftTagPx: number
  /** Left 3px tag accent opacity during the editorial proof -> App transition */
  leftTagAccentColor: string
  leftTagAccentOpacity: number
  /** Subtle editorial proof border opacity when card is in Color Tag / proof state */
  proofBorderOpacity: number
  /** Card border radius (px): 2.5px (school block) -> 12px (real App Course Card) */
  borderRadiusPx: number
  /** Course title color: #FFFFFF -> #18181B -> #5E3704 / #2B1B54 */
  titleColor: string
  /** Location / metadata color: #FFFFFF -> #52525B -> #6D440E / #3D2C6E */
  locationColor: string
  /** Title font size (px) and line height */
  titleFontSizePx: number
  locationFontSizePx: number
  /** Padding inside the card (px) */
  padTopPx: number
  padHorizontalPx: number
  /** Redundant school prefix/suffix crop state (Motion 2: 0.14–0.38) */
  redundantTextOpacity: number
  redundantMaxHeightPx: number
  redundantClipBottomPercent: number
  /** Variant B optional lightweight 1.5px strikethrough progress */
  strikeLineWidthPercent: number
  strikeLineOpacity: number
  /** Clean App location opacity (for courses like 大学体育 where @本校区运动场[本校区运动场] -> 未填写) */
  cleanLocationOpacity: number
}

export interface InPlaceSchedulePrototypeState {
  globalP: number
  variant: TextSimplifyVariant

  /** Sub-window normalized progresses */
  colorToTagP: number
  textSimplifyP: number
  rowMergeP: number
  gridToCardP: number
  tagToAppColorP: number
  chromeDissolveP: number
  appUiCompleteP: number
  finalStableP: number

  /** Frame & Canvas */
  frameBgColor: string
  frameSubtleSettleScale: number
  topStageLabelSchoolOpacity: number
  topStageLabelAppOpacity: number
  outsideCompleteMarkerOpacity: number
  outsideCompleteMarkerTranslateY: number

  /** Top Chrome (WeCom Host Bar + School Blue Bar + Unified Header Band) */
  wecomBarHeightPx: number
  wecomBarOpacity: number
  wecomBarTranslateY: number
  schoolBlueBarHeightPx: number
  schoolBlueBarOpacity: number
  headerBandHeightPx: number
  headerBandBgColor: string
  schoolSemesterTextOpacity: number
  schoolSemesterTranslateY: number

  /** Shared "第7周" -> "第 7 周" FLIP / Geometry Morph */
  weekTitleLeftPx: number
  weekTitleTopPx: number
  weekTitleFontSizePx: number
  weekTitleFontWeight: number
  weekTitleColor: string
  weekTitleDigitGapPx: number
  weekDropdownCaretOpacity: number

  /** Real App Header Companion Elements (Subtitle, Edit/Import Pills, Week Nav Row) */
  appHeaderMetaOpacity: number
  appHeaderMetaTranslateY: number
  appWeekNavRowOpacity: number
  appWeekNavRowTranslateY: number

  /** Weekday Header Row (10月 + 周一 12日..周五 16日 -> 周一 12..周五 16) */
  weekdayRowBgColor: string
  monthCellTextOpacity: number
  weekdayDaySuffixOpacity: number
  weekdayDaySuffixMaxWidthPx: number
  weekdayMondaySchoolHighlightOpacity: number
  weekdayDateFontSizePx: number
  weekdayNameColor: string
  weekdayDateColor: string

  /** Schedule Grid Body (8 Period Rows -> 4 Time Rows, Grid Lines -> Card Spacing) */
  gridBodyHeightPx: number
  gridOuterPadHorizontalPx: number
  gridOuterPadVerticalPx: number
  slotInsetPx: number
  tableGridLineOpacity: number
  periodSubDividerOpacity: number
  emptySlotBgOpacity: number
  emptySlotRadiusPx: number

  /** Left Axis (Periods 1..8 converging into 08:00, 10:00, 14:00, 16:00) */
  oddPeriodTranslateYPx: number
  evenPeriodTranslateYPx: number
  schoolPeriodLabelOpacity: number
  appTimeLabelOpacity: number
  appTimeLabelScale: number
  appTimeLabelTranslateYPx: number

  /** Bottom Region (School Summary Bar -> Real App Bottom Navigation Pill) */
  bottomRegionHeightPx: number
  schoolSummaryBarOpacity: number
  schoolSummaryBarTranslateY: number
  appBottomNavOpacity: number
  appBottomNavTranslateY: number

  /** Per-course visual state (computed with zero stagger: all 9 courses transform in unison) */
  getCourseCardState: (course: SchoolImportCourse) => InPlaceCourseCardVisualState
}

/**
 * Pure, deterministic state calculator for the Phase 05 "Re-set in place" prototype.
 * Driven by a single normalized scroll progress `rawP ∈ [0, 1]`.
 * Strictly reversible, zero per-course stagger, zero rotation, zero overshoot.
 */
export function computeInPlacePrototypeState(
  rawP: number,
  variant: TextSimplifyVariant = 'A'
): InPlaceSchedulePrototypeState {
  const globalP = clamp(rawP, 0, 1)
  const w = INPLACE_PROTOTYPE_CONFIG.windows

  // 1. Sub-window progresses (all smooth, monotonic, reversible)
  const colorToTagP = easeInOutCubic(remap(globalP, w.colorToTagStart, w.colorToTagEnd))
  const textSimplifyRawP = remap(globalP, w.textSimplifyStart, w.textSimplifyEnd)
  const textSimplifyP = easeInOutCubic(textSimplifyRawP)
  const rowMergeP = easeInOutCubic(remap(globalP, w.rowMergeStart, w.rowMergeEnd))
  const gridToCardP = easeInOutCubic(remap(globalP, w.gridToCardStart, w.gridToCardEnd))
  const tagToAppColorP = easeInOutCubic(remap(globalP, w.tagToAppColorStart, w.tagToAppColorEnd))
  const chromeDissolveP = easeInOutCubic(remap(globalP, w.chromeDissolveStart, w.chromeDissolveEnd))
  const appUiCompleteP = easeInOutCubic(remap(globalP, w.appUiCompleteStart, w.appUiCompleteEnd))
  const finalStableP = easeOutCubic(remap(globalP, w.finalStableStart, 1.0))

  // 2. Frame & Canvas background (#FFFFFF school table -> #F6F6F6 real App Week View)
  const frameBgColor = interpolateHexColor('#FFFFFF', '#F6F6F6', gridToCardP)
  // Very subtle whole-frame settle completing at 0.94, completely still in 0.94–1.00
  const settleBell =
    globalP >= 0.82 && globalP <= 0.94
      ? Math.sin(remap(globalP, 0.82, 0.94) * Math.PI) * 0.003
      : 0
  const frameSubtleSettleScale = 1 - settleBell

  const topStageLabelSchoolOpacity = 1 - easeInOutCubic(remap(globalP, 0.64, 0.82))
  const topStageLabelAppOpacity = easeInOutCubic(remap(globalP, 0.72, 0.88))

  const outsideCompleteMarkerP = easeOutCubic(remap(globalP, 0.88, 0.95))
  const outsideCompleteMarkerOpacity = outsideCompleteMarkerP
  const outsideCompleteMarkerTranslateY = lerp(6, 0, outsideCompleteMarkerP)

  // 3. Top Chrome Dissolve (0.66–0.86)
  // WeCom black host bar clips/collapses upward first (0.66–0.80)
  const wecomCollapseP = easeInOutCubic(remap(globalP, 0.66, 0.80))
  const wecomBarHeightPx = lerp(34, 0, wecomCollapseP)
  const wecomBarOpacity = 1 - easeInOutCubic(remap(globalP, 0.66, 0.78))
  const wecomBarTranslateY = lerp(0, -10, wecomCollapseP)

  // Blue "我的课表" bar compresses in height (0.68–0.84)
  const blueBarCollapseP = easeInOutCubic(remap(globalP, 0.68, 0.84))
  const schoolBlueBarHeightPx = lerp(34, 0, blueBarCollapseP)
  const schoolBlueBarOpacity = 1 - easeInOutCubic(remap(globalP, 0.68, 0.82))

  // Unified Header Band expands from 28px (School semester row) to 88px (App Header + Week Nav)
  const headerBandHeightPx = lerp(28, 88, chromeDissolveP)
  const headerBandBgColor = interpolateHexColor('#F8FAFC', '#F6F6F6', chromeDissolveP)
  const schoolSemesterTextOpacity = 1 - easeInOutCubic(remap(globalP, 0.66, 0.76))
  const schoolSemesterTranslateY = lerp(0, -8, easeInOutCubic(remap(globalP, 0.66, 0.76)))

  // Shared "第7周" -> "第 7 周" FLIP / Geometry Morph (0.66–0.86)
  const weekTitleLeftPx = lerp(304, 16, chromeDissolveP)
  const weekTitleTopPx = lerp(6, 10, chromeDissolveP)
  const weekTitleFontSizePx = lerp(11.5, 23, chromeDissolveP)
  const weekTitleFontWeight = Math.round(lerp(600, 700, chromeDissolveP))
  const weekTitleColor = interpolateHexColor('#1989FA', '#171717', chromeDissolveP)
  const weekTitleDigitGapPx = lerp(0.5, 4.5, chromeDissolveP)
  const weekDropdownCaretOpacity = 1 - easeInOutCubic(remap(globalP, 0.66, 0.74))

  // App Header Companion Elements (10月12日 - 10月16日, 编辑/导入 pills, < > 回到本周 复制到下周)
  const appHeaderMetaP = easeOutCubic(remap(globalP, 0.74, 0.88))
  const appHeaderMetaOpacity = appHeaderMetaP
  const appHeaderMetaTranslateY = lerp(6, 0, appHeaderMetaP)

  const appWeekNavP = easeOutCubic(remap(globalP, 0.76, 0.90))
  const appWeekNavRowOpacity = appWeekNavP
  const appWeekNavRowTranslateY = lerp(6, 0, appWeekNavP)

  // 4. Weekday Header Row (周一 12日 -> 周一 12)
  const weekdayRowBgColor = interpolateHexColor('#F8FAFC', '#F6F6F6', gridToCardP)
  const monthCellTextOpacity = 1 - easeInOutCubic(remap(globalP, 0.34, 0.50))
  const weekdayDaySuffixOpacity = 1 - easeInOutCubic(remap(globalP, 0.30, 0.40))
  const weekdayDaySuffixMaxWidthPx = lerp(11, 0, easeInOutCubic(remap(globalP, 0.32, 0.44)))
  const weekdayMondaySchoolHighlightOpacity = 1 - gridToCardP
  const weekdayDateFontSizePx = lerp(10.5, 13, rowMergeP)
  const weekdayNameColor = interpolateHexColor('#334155', '#737373', gridToCardP)
  const weekdayDateColor = interpolateHexColor('#64748B', '#171717', gridToCardP)

  // 5. Schedule Grid Body (8 Period Rows -> 4 Time Rows, Grid Lines -> Spacing)
  // Total frame height stays 700px throughout:
  // At p=0: 34 + 34 + 28 + 36 + 536 + 32 = 700
  // At p=1: 0  + 0  + 88 + 36 + 510 + 66 = 700
  const bottomExpandP = easeInOutCubic(remap(globalP, 0.76, 0.92))
  const bottomRegionHeightPx = lerp(32, 66, bottomExpandP)
  const topRegionTotalPx = wecomBarHeightPx + schoolBlueBarHeightPx + headerBandHeightPx + 36
  const gridBodyHeightPx = Math.max(480, 700 - topRegionTotalPx - bottomRegionHeightPx)

  const gridOuterPadHorizontalPx = lerp(0, 8, gridToCardP)
  const gridOuterPadVerticalPx = lerp(0, 4, gridToCardP)
  const slotInsetPx = lerp(0.5, 3.2, gridToCardP)
  const tableGridLineOpacity = 1 - easeInOutCubic(remap(globalP, 0.40, 0.62))
  const periodSubDividerOpacity = 1 - easeInOutCubic(remap(globalP, 0.30, 0.46))
  const emptySlotBgOpacity = easeInOutCubic(remap(globalP, 0.44, 0.64))
  const emptySlotRadiusPx = lerp(2, 12, gridToCardP)

  // 6. Left Axis: 8 Periods (1+2, 3+4, 5+6, 7+8) merging into 4 App Time Labels (08:00, 10:00, 14:00, 16:00)
  const periodConvergeP = easeInOutCubic(remap(globalP, 0.30, 0.48))
  const oddPeriodTranslateYPx = lerp(0, 20, periodConvergeP)
  const evenPeriodTranslateYPx = lerp(0, -20, periodConvergeP)
  const schoolPeriodLabelOpacity = 1 - easeInOutCubic(remap(globalP, 0.33, 0.46))
  const appTimeRevealP = easeOutCubic(remap(globalP, 0.40, 0.55))
  const appTimeLabelOpacity = appTimeRevealP
  const appTimeLabelScale = lerp(0.92, 1.0, appTimeRevealP)
  // Starts near the middle convergence point (+16px) and settles up to the App time row header position (0px)
  const appTimeLabelTranslateYPx = lerp(16, 0, appTimeRevealP)

  // 7. Bottom Region (School Summary Bar -> Real App Bottom Navigation Pill)
  const schoolSummaryBarOpacity = 1 - easeInOutCubic(remap(globalP, 0.72, 0.84))
  const schoolSummaryBarTranslateY = lerp(0, 8, easeInOutCubic(remap(globalP, 0.72, 0.84)))
  const appBottomNavOpacity = appUiCompleteP
  const appBottomNavTranslateY = lerp(10, 0, appUiCompleteP)

  // 8. Per-course card visual state (zero stagger: all 9 courses transform simultaneously)
  const getCourseCardState = (course: SchoolImportCourse): InPlaceCourseCardVisualState => {
    const isWarm = course.appTheme === 'warm'
    const appFillHex = isWarm ? '#F3ECE1' : '#E9E7F7'
    const appAccentTagHex = isWarm ? '#D99B52' : '#8A76E5'
    const appTitleHex = isWarm ? '#5E3704' : '#2B1B54'
    const appLocationHex = isWarm ? '#6D440E' : '#3D2C6E'

    // Base card surface remains clean editorial proof paper (#FAFAFA) while the fill layer sweeps back across
    const cardBaseBg = interpolateHexColor(
      '#FAFAFA',
      appFillHex,
      easeInOutCubic(remap(globalP, 0.66, 0.74))
    )

    // Fill layer right-inset:
    // - p in [0.06, 0.24]: retracts from 0% right-inset (full width) to 100% (clamped to 3px left tag)
    // - p in [0.52, 0.72]: expands from 3px left tag back to 0% right-inset (full width)
    const fillRightInsetPercent = colorToTagP * (1 - tagToAppColorP) * 100
    const fillMinLeftTagPx = 3

    // Fill layer color:
    // Starts as course.sourceColor during retraction & tag state, then transitions to appFillHex as it expands back
    const tagColorShiftP = easeInOutCubic(remap(globalP, 0.46, 0.62))
    const fillLayerColor = interpolateHexColor(course.sourceColor, appFillHex, tagColorShiftP)

    // Left 3px tag accent bar (keeps the 3px editorial tag crisp while the softer beige/lavender sweeps across, then blends out)
    const leftTagAccentColor = interpolateHexColor(course.sourceColor, appAccentTagHex, tagColorShiftP)
    const leftTagAccentOpacity =
      colorToTagP * (1 - easeInOutCubic(remap(globalP, 0.64, 0.74)))

    // Editorial proof border (subtle hairline visible while in Color Tag / proof state, fades out as App card fill completes)
    const proofBorderOpacity =
      colorToTagP * (1 - easeInOutCubic(remap(globalP, 0.58, 0.72)))

    // Border radius: 2.5px -> 12px during Grid -> Card (0.40–0.64)
    const borderRadiusPx = lerp(2.5, 12, gridToCardP)

    // Text colors:
    // Phase 1 (0.06–0.22): #FFFFFF -> #18181B (title) and #FFFFFF -> #52525B (location)
    // Phase 2 (0.52–0.72): #18181B -> appTitleHex and #52525B -> appLocationHex
    const textDarkenP = easeInOutCubic(remap(globalP, 0.08, 0.22))
    const editorialTitleHex = interpolateHexColor('#FFFFFF', '#18181B', textDarkenP)
    const titleColor = interpolateHexColor(editorialTitleHex, appTitleHex, tagToAppColorP)

    const editorialLocationHex = interpolateHexColor('#FFFFFF', '#52525B', textDarkenP)
    const locationColor = interpolateHexColor(editorialLocationHex, appLocationHex, tagToAppColorP)

    // Typography sizing & padding re-layout
    const titleFontSizePx = lerp(9.5, 10.5, rowMergeP)
    const locationFontSizePx = lerp(8.5, 9.2, rowMergeP)
    const padTopPx = lerp(3.5, 6.5, gridToCardP)
    const padHorizontalPx = lerp(4, 7, gridToCardP)

    // Motion 2: Text simplification (0.14–0.38)
    let redundantCropP = textSimplifyP
    let strikeLineWidthPercent = 0
    let strikeLineOpacity = 0

    if (variant === 'B') {
      // Variant B: lightweight 1.5px strikethrough draws across first (0.14–0.25), then redundant text crops out (0.23–0.38)
      const strikeDrawP = easeOutCubic(remap(globalP, 0.14, 0.25))
      redundantCropP = easeInOutCubic(remap(globalP, 0.23, 0.38))
      strikeLineWidthPercent = strikeDrawP * 100
      strikeLineOpacity = strikeDrawP * (1 - redundantCropP) * 0.85
    }

    const redundantTextOpacity = 1 - redundantCropP
    const redundantMaxHeightPx = lerp(28, 0, redundantCropP)
    const redundantClipBottomPercent = redundantCropP * 100

    // For 大学体育（三） where school text is "@本校区运动场[本校区运动场]" and App text is "未填写"
    const cleanLocationOpacity =
      course.appLocation === '未填写'
        ? easeInOutCubic(remap(globalP, 0.22, 0.38))
        : 1

    return {
      cardBaseBg,
      fillLayerColor,
      fillRightInsetPercent,
      fillMinLeftTagPx,
      leftTagAccentColor,
      leftTagAccentOpacity,
      proofBorderOpacity,
      borderRadiusPx,
      titleColor,
      locationColor,
      titleFontSizePx,
      locationFontSizePx,
      padTopPx,
      padHorizontalPx,
      redundantTextOpacity,
      redundantMaxHeightPx,
      redundantClipBottomPercent,
      strikeLineWidthPercent,
      strikeLineOpacity,
      cleanLocationOpacity,
    }
  }

  return {
    globalP,
    variant,
    colorToTagP,
    textSimplifyP,
    rowMergeP,
    gridToCardP,
    tagToAppColorP,
    chromeDissolveP,
    appUiCompleteP,
    finalStableP,
    frameBgColor,
    frameSubtleSettleScale,
    topStageLabelSchoolOpacity,
    topStageLabelAppOpacity,
    outsideCompleteMarkerOpacity,
    outsideCompleteMarkerTranslateY,
    wecomBarHeightPx,
    wecomBarOpacity,
    wecomBarTranslateY,
    schoolBlueBarHeightPx,
    schoolBlueBarOpacity,
    headerBandHeightPx,
    headerBandBgColor,
    schoolSemesterTextOpacity,
    schoolSemesterTranslateY,
    weekTitleLeftPx,
    weekTitleTopPx,
    weekTitleFontSizePx,
    weekTitleFontWeight,
    weekTitleColor,
    weekTitleDigitGapPx,
    weekDropdownCaretOpacity,
    appHeaderMetaOpacity,
    appHeaderMetaTranslateY,
    appWeekNavRowOpacity,
    appWeekNavRowTranslateY,
    weekdayRowBgColor,
    monthCellTextOpacity,
    weekdayDaySuffixOpacity,
    weekdayDaySuffixMaxWidthPx,
    weekdayMondaySchoolHighlightOpacity,
    weekdayDateFontSizePx,
    weekdayNameColor,
    weekdayDateColor,
    gridBodyHeightPx,
    gridOuterPadHorizontalPx,
    gridOuterPadVerticalPx,
    slotInsetPx,
    tableGridLineOpacity,
    periodSubDividerOpacity,
    emptySlotBgOpacity,
    emptySlotRadiusPx,
    oddPeriodTranslateYPx,
    evenPeriodTranslateYPx,
    schoolPeriodLabelOpacity,
    appTimeLabelOpacity,
    appTimeLabelScale,
    appTimeLabelTranslateYPx,
    bottomRegionHeightPx,
    schoolSummaryBarOpacity,
    schoolSummaryBarTranslateY,
    appBottomNavOpacity,
    appBottomNavTranslateY,
    getCourseCardState,
  }
}
