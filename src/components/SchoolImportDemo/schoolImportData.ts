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
  /** Redundant campus/building prefix in the school table that gets edited/cropped away */
  sourcePrefix: string
  /** Redundant bracket/period suffix in the school table that gets edited/cropped away */
  sourceSuffix: string
  shortLocation: string
  appLocation: string
  sourceColor: string
  appTheme: 'warm' | 'lavender'
  weekLabel: string
}

export const SCHOOL_WEEKDAYS = [
  { day: '周一', dateLabel: '12日', appDate: '12', dateSuffix: '日', isCurrentDay: true },
  { day: '周二', dateLabel: '13日', appDate: '13', dateSuffix: '日', isCurrentDay: false },
  { day: '周三', dateLabel: '14日', appDate: '14', dateSuffix: '日', isCurrentDay: false },
  { day: '周四', dateLabel: '15日', appDate: '15', dateSuffix: '日', isCurrentDay: false },
  { day: '周五', dateLabel: '16日', appDate: '16', dateSuffix: '日', isCurrentDay: false },
] as const

export interface TimeBandDefinition {
  bandIndex: 0 | 1 | 2 | 3
  oddPeriod: 1 | 3 | 5 | 7
  evenPeriod: 2 | 4 | 6 | 8
  periodRangeLabel: string
  appTime: '08:00' | '10:00' | '14:00' | '16:00'
  appEndTime: '09:40' | '11:40' | '15:50' | '17:40'
}

export const SCHEDULE_TIME_BANDS: TimeBandDefinition[] = [
  {
    bandIndex: 0,
    oddPeriod: 1,
    evenPeriod: 2,
    periodRangeLabel: '1-2节',
    appTime: '08:00',
    appEndTime: '09:40',
  },
  {
    bandIndex: 1,
    oddPeriod: 3,
    evenPeriod: 4,
    periodRangeLabel: '3-4节',
    appTime: '10:00',
    appEndTime: '11:40',
  },
  {
    bandIndex: 2,
    oddPeriod: 5,
    evenPeriod: 6,
    periodRangeLabel: '5-6节',
    appTime: '14:00',
    appEndTime: '15:50',
  },
  {
    bandIndex: 3,
    oddPeriod: 7,
    evenPeriod: 8,
    periodRangeLabel: '7-8节',
    appTime: '16:00',
    appEndTime: '17:40',
  },
]

export const SCHOOL_PERIOD_ROWS = [
  { period: 1, timeRange: '08:00\n08:45' },
  { period: 2, timeRange: '08:55\n09:40' },
  { period: 3, timeRange: '10:00\n10:45' },
  { period: 4, timeRange: '10:55\n11:40' },
  { period: 5, timeRange: '14:00\n14:45' },
  { period: 6, timeRange: '14:55\n15:40' },
  { period: 7, timeRange: '16:00\n16:45' },
  { period: 8, timeRange: '16:55\n17:40' },
] as const

export const APP_TIME_ROWS = ['08:00', '10:00', '14:00', '16:00'] as const

/**
 * Phase 05 Redesign Prototype｜Re-set in place (原位重排)
 * Single normalized progress p ∈ [0, 1] configuration.
 */
export const INPLACE_PROTOTYPE_CONFIG = {
  /** Frame dimensions on desktop (1698×900 / 1440×900) */
  frameWidthPx: 376,
  frameHeightPx: 700,
  frameRadiusPx: 26,

  /** Active scroll distance for CSS sticky container */
  scrollDistanceVh: 90,
  /** Total section height = 100vh viewport + 90vh scroll travel */
  sectionTotalHeightVh: 190,

  /** Global progress windows (p ∈ [0, 1]) */
  windows: {
    /** 0.00–0.08: Source stable (WeCom School Schedule clearly recognizable) */
    sourceStableEnd: 0.08,
    /** 0.06–0.24: Motion 1 — High-saturation fill retracts to 3px left color tag; white text -> dark */
    colorToTagStart: 0.06,
    colorToTagEnd: 0.24,
    /** 0.14–0.38: Motion 2 — Text simplification (mask / crop / re-layout; optional Variant B strikethrough) */
    textSimplifyStart: 0.14,
    textSimplifyEnd: 0.38,
    /** 0.30–0.55: Motion 3 — 8 period rows merge into 4 time rows (1+2->08:00, 3+4->10:00, 5+6->14:00, 7+8->16:00) */
    rowMergeStart: 0.30,
    rowMergeEnd: 0.55,
    /** 0.40–0.64: Motion 4 — Table grid lines dissolve into card spacing & App card border-radius forms */
    gridToCardStart: 0.40,
    gridToCardEnd: 0.64,
    /** 0.52–0.72: Motion 5 — 3px color tag expands back across card as App warm beige / lavender */
    tagToAppColorStart: 0.52,
    tagToAppColorEnd: 0.72,
    /** 0.66–0.86: Motion 6 — School Chrome collapses & 第7周 FLIP-morphs into App Week View Header */
    chromeDissolveStart: 0.66,
    chromeDissolveEnd: 0.86,
    /** 0.82–0.94: Real App UI completion (bottom nav pill settles in) */
    appUiCompleteStart: 0.82,
    appUiCompleteEnd: 0.94,
    /** 0.94–1.00: Stable final state + subtle outside marker "导入完成。" */
    finalStableStart: 0.94,
  },
} as const

/**
 * Unified Week 7 (第 7 周 · 10月12日 – 10月16日) 9 Courses.
 * Every course stays in its exact (dayCol, appTimeRow) slot throughout p ∈ [0, 1].
 * stagger = 0, rotation = 0, overshoot = 0.
 */
export const SCHOOL_IMPORT_COURSES: SchoolImportCourse[] = [
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
    sourcePrefix: '@本校区先进制造产教融合实训基地[',
    sourceSuffix: '] (1-2节)',
    shortLocation: '实训基地 D202',
    appLocation: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    sourceColor: '#F06878',
    appTheme: 'warm',
    weekLabel: '第7周',
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
    sourcePrefix: '@本校区二号教学楼[',
    sourceSuffix: '] (3-4节)',
    shortLocation: '二号教学楼 B204',
    appLocation: '二号教学楼B204',
    sourceColor: '#9A79D9',
    appTheme: 'lavender',
    weekLabel: '第7周',
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
    sourcePrefix: '@本校区实训中心E区[',
    sourceSuffix: '] (5-6节)',
    shortLocation: '实训中心 E209',
    appLocation: '数智基地29-实训中心E209',
    sourceColor: '#2CC0CE',
    appTheme: 'lavender',
    weekLabel: '第7周',
  },
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
    sourcePrefix: '@本校区二号教学楼[',
    sourceSuffix: '] (3-4节)',
    shortLocation: '二号教学楼 A402',
    appLocation: '二号教学楼A402',
    sourceColor: '#F06E52',
    appTheme: 'warm',
    weekLabel: '第7周',
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
    sourcePrefix: '@本校区实训中心E区[',
    sourceSuffix: '] (1-2节)',
    shortLocation: '实训中心 E303',
    appLocation: '数智基地32-实训中心E303',
    sourceColor: '#D98858',
    appTheme: 'warm',
    weekLabel: '第7周',
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
    sourceRawLocation: '@本校区运动场[本校区运动场]',
    sourcePrefix: '@本校区运动场[本校区运动场]',
    sourceSuffix: '(5-6节)',
    shortLocation: '本校区运动场',
    appLocation: '未填写',
    sourceColor: '#EA88CF',
    appTheme: 'lavender',
    weekLabel: '第7周',
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
    sourcePrefix: '@本校区实训中心E区[',
    sourceSuffix: '] (1-2节)',
    shortLocation: '实训中心 E303',
    appLocation: '数智基地32-实训中心E303',
    sourceColor: '#D98858',
    appTheme: 'warm',
    weekLabel: '第7周',
  },
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
    sourcePrefix: '@本校区先进制造产教融合实训基地[',
    sourceSuffix: '] (3-4节)',
    shortLocation: '实训基地 D202',
    appLocation: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    sourceColor: '#F06878',
    appTheme: 'warm',
    weekLabel: '第7周',
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
    sourcePrefix: '@本校区实训中心E区[',
    sourceSuffix: '] (7-8节)',
    shortLocation: '实训中心 E303',
    appLocation: '数智基地32-实训中心E303',
    sourceColor: '#2CC0CE',
    appTheme: 'lavender',
    weekLabel: '第7周',
  },
]

export const PHASE05_STAGE_STEPS = [
  { code: '01', title: '教务系统源课表', subtitle: '读取第 7 周原始课表' },
  { code: '02', title: '结构化抽取', subtitle: '解析课程、时间与地点' },
  { code: '03', title: '导入预览', subtitle: '确认 9 门课程无误' },
  { code: '04', title: '写入本地', subtitle: '生成 App 周视图' },
] as const

