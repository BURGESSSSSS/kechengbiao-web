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
    endP: 0.22,
  },
  {
    index: 1,
    code: '02',
    title: '结构化抽取',
    subtitle: '提取课程字段',
    startP: 0.22,
    endP: 0.52,
  },
  {
    index: 2,
    code: '03',
    title: '导入预览',
    subtitle: '写入前确认',
    startP: 0.52,
    endP: 0.74,
  },
  {
    index: 3,
    code: '04',
    title: '写入本地',
    subtitle: '离线保存可查',
    startP: 0.74,
    endP: 1.0,
  },
] as const

/**
 * Single Unified Course Data Model for Phase 05 (Shandong Business Institute "我的课表" -> App Local Schedule).
 * Shared across all 4 representations:
 * 1. SourceCourseBlock (5x8 school timetable grid)
 * 2. DataStrip & ProcessFieldOrganizer (extracted data strip & field alignment)
 * 3. ImportPreviewRow (structured import preview list)
 * 4. DestinationCourseBlock (5x4 native App week view)
 *
 * Pacing note (Narrative Redesign):
 * - Step 02 (sourceToPreviewP in [0, 1]): per-course duration = 0.20, stagger step = 0.095
 *   -> active overlap reduced from 3.75 courses to ~2.1 courses at a time.
 * - Step 04 (previewToDestinationP in [0, 1]): 3 weekday groups with wider spacing for clear visual tracking.
 */
export const SCHOOL_IMPORT_COURSES: SchoolImportCourse[] = [
  // === Group 1｜周一 (3 courses: 0.04 -> 0.38 in previewToDestinationP) ===
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
    startP: 0.02,
    endP: 0.22,
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
    startP: 0.115,
    endP: 0.315,
    writeGroup: 1,
    destStartP: 0.09,
    destEndP: 0.33,
  },
  {
    id: 'course-mon-5-6',
    order: 3,
    name: 'Node.js应用开发',
    displayName: 'Node.js 应用开发',
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
    startP: 0.21,
    endP: 0.41,
    writeGroup: 1,
    destStartP: 0.14,
    destEndP: 0.38,
  },

  // === Group 2｜周二～周四 (4 courses: 0.34 -> 0.73 in previewToDestinationP) ===
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
    startP: 0.305,
    endP: 0.505,
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
    startP: 0.4,
    endP: 0.6,
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
    startP: 0.495,
    endP: 0.695,
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
    startP: 0.59,
    endP: 0.79,
    writeGroup: 2,
    destStartP: 0.49,
    destEndP: 0.73,
  },

  // === Group 3｜周五 (2 courses: 0.69 -> 0.96 in previewToDestinationP) ===
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
    startP: 0.685,
    endP: 0.885,
    writeGroup: 3,
    destStartP: 0.69,
    destEndP: 0.91,
  },
  {
    id: 'course-fri-7-8',
    order: 9,
    name: 'Node.js应用开发',
    displayName: 'Node.js 应用开发',
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
    startP: 0.78,
    endP: 0.98,
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
