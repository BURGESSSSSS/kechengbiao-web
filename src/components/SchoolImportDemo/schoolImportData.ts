export interface SchoolImportCourse {
  id: string
  order: number
  name: string
  displayName: string
  day: '周一' | '周二' | '周三' | '周四' | '周五'
  dayCol: 0 | 1 | 2 | 3 | 4
  startPeriod: 1 | 3 | 5 | 7
  endPeriod: 2 | 4 | 6 | 8
  appTimeRow: 0 | 1 | 2 | 3 // 0: 08:00, 1: 10:00, 2: 14:00, 3: 16:00
  sourceRawLocation: string
  shortLocation: string
  appLocation: string
  sourceColor: string
  appTheme: 'warm' | 'lavender'
  weekLabel: string
  // Phase 05B: SOURCE -> DATA STRIP -> PROCESS -> PREVIEW window (in sourceToPreviewP in [0, 1])
  startP: number
  endP: number
  // Phase 05C: PREVIEW -> COMPACT RECORD -> DESTINATION window (in previewToDestinationP in [0, 1])
  writeGroup: 1 | 2 | 3
  destStartP: number
  destEndP: number
}

export const SCHOOL_WEEKDAYS = [
  { day: '周一', dateLabel: '12日', appDate: '12', isCurrentDay: true },
  { day: '周二', dateLabel: '13日', appDate: '13', isCurrentDay: false },
  { day: '周三', dateLabel: '14日', appDate: '14', isCurrentDay: false },
  { day: '周四', dateLabel: '15日', appDate: '15', isCurrentDay: false },
  { day: '周五', dateLabel: '16日', appDate: '16', isCurrentDay: false },
] as const

export const SCHOOL_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const APP_TIME_ROWS = ['08:00', '10:00', '14:00', '16:00'] as const

export interface Phase05MotionConfig {
  courseCount: number
  sourceZoneMinVh: number
  sourceReadingHoldVh: number
  corridorCourseDurationVh: number // D = 50vh
  corridorCourseStaggerVh: number // S = 25vh
  corridor1HeightVh: number // (N - 1) * S + D = 250vh
  processZoneMinVh: number
  processExpandDurationVh: number
  processHoldVh: number
  // Normalized globalP windows in Round 1 Long Page [0, 1]
  sourceHoldEndP: number
  corridorStartP: number
  corridorEndP: number
  processStartP: number
  processEndP: number
}

const CORRIDOR_COURSE_COUNT = 9
const CORRIDOR_D_VH = 50
const CORRIDOR_S_VH = 25
const CORRIDOR_1_HEIGHT_VH =
  (CORRIDOR_COURSE_COUNT - 1) * CORRIDOR_S_VH + CORRIDOR_D_VH // 250vh
const SOURCE_HOLD_VH = 24
const PROCESS_EXPAND_VH = 48
const PROCESS_HOLD_VH = 18
const TOTAL_ACTIVE_SCROLL_VH =
  SOURCE_HOLD_VH + CORRIDOR_1_HEIGHT_VH + PROCESS_EXPAND_VH + PROCESS_HOLD_VH // 340vh

export const PHASE05_MOTION_CONFIG: Phase05MotionConfig = {
  courseCount: CORRIDOR_COURSE_COUNT,
  sourceZoneMinVh: 80,
  sourceReadingHoldVh: SOURCE_HOLD_VH,
  corridorCourseDurationVh: CORRIDOR_D_VH,
  corridorCourseStaggerVh: CORRIDOR_S_VH,
  corridor1HeightVh: CORRIDOR_1_HEIGHT_VH,
  processZoneMinVh: 92,
  processExpandDurationVh: PROCESS_EXPAND_VH,
  processHoldVh: PROCESS_HOLD_VH,
  sourceHoldEndP: Number((SOURCE_HOLD_VH / TOTAL_ACTIVE_SCROLL_VH).toFixed(4)), // ~0.0706
  corridorStartP: Number((SOURCE_HOLD_VH / TOTAL_ACTIVE_SCROLL_VH).toFixed(4)), // ~0.0706
  corridorEndP: Number(
    ((SOURCE_HOLD_VH + CORRIDOR_1_HEIGHT_VH) / TOTAL_ACTIVE_SCROLL_VH).toFixed(4)
  ), // ~0.8059
  processStartP: Number(
    ((SOURCE_HOLD_VH + CORRIDOR_1_HEIGHT_VH) / TOTAL_ACTIVE_SCROLL_VH).toFixed(4)
  ), // ~0.8059
  processEndP: Number(
    (
      (SOURCE_HOLD_VH + CORRIDOR_1_HEIGHT_VH + PROCESS_EXPAND_VH) /
      TOTAL_ACTIVE_SCROLL_VH
    ).toFixed(4)
  ), // ~0.9471
}

function corridorStartPForIndex(idx: number): number {
  return Number(
    (
      (idx * PHASE05_MOTION_CONFIG.corridorCourseStaggerVh) /
      PHASE05_MOTION_CONFIG.corridor1HeightVh
    ).toFixed(4)
  )
}

function corridorEndPForIndex(idx: number): number {
  return Number(
    (
      (idx * PHASE05_MOTION_CONFIG.corridorCourseStaggerVh +
        PHASE05_MOTION_CONFIG.corridorCourseDurationVh) /
      PHASE05_MOTION_CONFIG.corridor1HeightVh
    ).toFixed(4)
  )
}

export interface Phase05StageStepMeta {
  index: number
  code: '01' | '02' | '03' | '04'
  title: string
  subtitle: string
  startP: number
  endP: number
}

export const PHASE05_STAGE_STEPS: readonly Phase05StageStepMeta[] = [
  {
    index: 0,
    code: '01',
    title: '教务系统源课表',
    subtitle: '企业微信内打开',
    startP: 0.0,
    endP: PHASE05_MOTION_CONFIG.corridorStartP,
  },
  {
    index: 1,
    code: '02',
    title: '结构化抽取',
    subtitle: '提取课程字段',
    startP: PHASE05_MOTION_CONFIG.corridorStartP,
    endP: 1.0,
  },
  {
    index: 2,
    code: '03',
    title: '导入预览',
    subtitle: '写入前确认',
    startP: 1.0,
    endP: 1.0,
  },
  {
    index: 3,
    code: '04',
    title: '写入本地',
    subtitle: '离线保存可查',
    startP: 1.0,
    endP: 1.0,
  },
] as const

/**
 * Single Unified Course Data Model for Phase 05 (Shandong Business Institute "我的课表" -> App Local Schedule).
 *
 * Pacing note (Long Page Prototype Round 1):
 * - Corridor 1 (corridorP in [0, 1] over 250vh):
 *   D = 50vh -> duration = 50 / 250 = 0.20
 *   S = 25vh -> stagger  = 25 / 250 = 0.10
 *   At any scroll position, at most 1 course is in main motion (localP 30%–70%)
 *   and at most 1 course is in secondary motion (<30% or >70%).
 */
export const SCHOOL_IMPORT_COURSES: SchoolImportCourse[] = [
  // === Group 1｜周一 ===
  {
    id: 'course-mon-1-2',
    order: 1,
    name: '产品原型设计',
    displayName: '产品原型设计',
    day: '周一',
    dayCol: 0,
    startPeriod: 1,
    endPeriod: 2,
    appTimeRow: 0,
    sourceRawLocation: '@本校区先进制造产教融合实训基地[先进制造产教融合实训基地D202]',
    shortLocation: '实训基地 D202',
    appLocation: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    sourceColor: '#F06878',
    appTheme: 'warm',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(0), // 0.00
    endP: corridorEndPForIndex(0), // 0.20
    writeGroup: 1,
    destStartP: 0.04,
    destEndP: 0.28,
  },
  {
    id: 'course-mon-3-4',
    order: 2,
    name: '习近平新时代中国特色社会主义思想概论',
    displayName: '习近平新时代中国特色社会主义思想概论',
    day: '周一',
    dayCol: 0,
    startPeriod: 3,
    endPeriod: 4,
    appTimeRow: 1,
    sourceRawLocation: '@本校区二号教学楼[二号教学楼B204]',
    shortLocation: '二号教学楼 B204',
    appLocation: '二号教学楼B204',
    sourceColor: '#9A79D9',
    appTheme: 'lavender',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(1), // 0.10
    endP: corridorEndPForIndex(1), // 0.30
    writeGroup: 1,
    destStartP: 0.09,
    destEndP: 0.33,
  },
  {
    id: 'course-mon-5-6',
    order: 3,
    name: 'Node.js应用开发',
    displayName: 'Node.js应用开发',
    day: '周一',
    dayCol: 0,
    startPeriod: 5,
    endPeriod: 6,
    appTimeRow: 2,
    sourceRawLocation: '@本校区实训中心E区[数智基地29-实训中心E209]',
    shortLocation: '实训中心 E209',
    appLocation: '数智基地29-实训中心E209',
    sourceColor: '#2CC0CE',
    appTheme: 'lavender',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(2), // 0.20
    endP: corridorEndPForIndex(2), // 0.40
    writeGroup: 1,
    destStartP: 0.14,
    destEndP: 0.38,
  },

  // === Group 2｜周二～周四 ===
  {
    id: 'course-tue-3-4',
    order: 4,
    name: '形势与政策（三）',
    displayName: '形势与政策（三）',
    day: '周二',
    dayCol: 1,
    startPeriod: 3,
    endPeriod: 4,
    appTimeRow: 1,
    sourceRawLocation: '@本校区二号教学楼[二号教学楼A402]',
    shortLocation: '二号教学楼 A402',
    appLocation: '二号教学楼A402',
    sourceColor: '#F06E52',
    appTheme: 'warm',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(3), // 0.30
    endP: corridorEndPForIndex(3), // 0.50
    writeGroup: 2,
    destStartP: 0.34,
    destEndP: 0.58,
  },
  {
    id: 'course-wed-1-2',
    order: 5,
    name: '区块链基础原理',
    displayName: '区块链基础原理',
    day: '周三',
    dayCol: 2,
    startPeriod: 1,
    endPeriod: 2,
    appTimeRow: 0,
    sourceRawLocation: '@本校区实训中心E区[数智基地32-实训中心E303]',
    shortLocation: '实训中心 E303',
    appLocation: '数智基地32-实训中心E303',
    sourceColor: '#D98858',
    appTheme: 'warm',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(4), // 0.40
    endP: corridorEndPForIndex(4), // 0.60
    writeGroup: 2,
    destStartP: 0.39,
    destEndP: 0.63,
  },
  {
    id: 'course-wed-5-6',
    order: 6,
    name: '大学体育（三）',
    displayName: '大学体育（三）',
    day: '周三',
    dayCol: 2,
    startPeriod: 5,
    endPeriod: 6,
    appTimeRow: 2,
    sourceRawLocation: '@',
    shortLocation: '本校区运动场',
    appLocation: '未填写',
    sourceColor: '#EA88CF',
    appTheme: 'lavender',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(5), // 0.50
    endP: corridorEndPForIndex(5), // 0.70
    writeGroup: 2,
    destStartP: 0.44,
    destEndP: 0.68,
  },
  {
    id: 'course-thu-1-2',
    order: 7,
    name: '区块链基础原理',
    displayName: '区块链基础原理',
    day: '周四',
    dayCol: 3,
    startPeriod: 1,
    endPeriod: 2,
    appTimeRow: 0,
    sourceRawLocation: '@本校区实训中心E区[数智基地32-实训中心E303]',
    shortLocation: '实训中心 E303',
    appLocation: '数智基地32-实训中心E303',
    sourceColor: '#D98858',
    appTheme: 'warm',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(6), // 0.60
    endP: corridorEndPForIndex(6), // 0.80
    writeGroup: 2,
    destStartP: 0.49,
    destEndP: 0.73,
  },

  // === Group 3｜周五 ===
  {
    id: 'course-fri-3-4',
    order: 8,
    name: '产品原型设计',
    displayName: '产品原型设计',
    day: '周五',
    dayCol: 4,
    startPeriod: 3,
    endPeriod: 4,
    appTimeRow: 1,
    sourceRawLocation: '@本校区先进制造产教融合实训基地[先进制造产教融合实训基地D202]',
    shortLocation: '实训基地 D202',
    appLocation: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    sourceColor: '#F06878',
    appTheme: 'warm',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(7), // 0.70
    endP: corridorEndPForIndex(7), // 0.90
    writeGroup: 3,
    destStartP: 0.69,
    destEndP: 0.91,
  },
  {
    id: 'course-fri-7-8',
    order: 9,
    name: 'Node.js应用开发',
    displayName: 'Node.js应用开发',
    day: '周五',
    dayCol: 4,
    startPeriod: 7,
    endPeriod: 8,
    appTimeRow: 3,
    sourceRawLocation: '@本校区实训中心E区[数智基地32-实训中心E303]',
    shortLocation: '实训中心 E303',
    appLocation: '数智基地32-实训中心E303',
    sourceColor: '#2CC0CE',
    appTheme: 'lavender',
    weekLabel: '第7周',
    startP: corridorStartPForIndex(8), // 0.80
    endP: corridorEndPForIndex(8), // 1.00
    writeGroup: 3,
    destStartP: 0.74,
    destEndP: 0.96,
  },
]

export const FEATURED_PROCESS_COURSE =
  SCHOOL_IMPORT_COURSES.find((c) => c.id === 'course-mon-5-6') ?? SCHOOL_IMPORT_COURSES[2]

export const SAMPLE_DATA_STRIP_COURSES: SchoolImportCourse[] = [
  SCHOOL_IMPORT_COURSES[2], // Node.js应用开发 · 周一 · 5–6节 · 实训中心 E209
  SCHOOL_IMPORT_COURSES[0], // 产品原型设计 · 周一 · 1–2节 · 实训基地 D202
]
