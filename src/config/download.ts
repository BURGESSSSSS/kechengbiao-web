/**
 * 下载链接配置
 * 统一管理官网所有下载入口的跳转目标
 */
export const DOWNLOAD_CONFIG = {
  // GitHub Releases 官方下载地址
  githubUrl: 'https://github.com/BURGESSSSSS/schedule-app/releases',

  // 国内高速网盘下载地址（可替换为蓝奏云、123云盘、夸克或百度网盘分享链接）
  // 示例: 'https://www.123pan.com/s/xxxx-xxxx.html' 或 'https://pan.quark.cn/s/xxxx'
  panUrl: 'https://github.com/BURGESSSSSS/schedule-app/releases', // 默认可直接使用或填入你的网盘分享链接
  
  // 网盘提取码（如无提取码可留空）
  panCode: '',
}
