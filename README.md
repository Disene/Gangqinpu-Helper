# 虫虫钢琴琴谱助手

一个功能完善的 [虫虫钢琴](https://www.gangqinpu.com/) 油猴脚本，整合多份优秀脚本的优点，提供免登录纯净预览、打印、MP3 下载、MIDI/CCMZ 解析、简谱/五线谱切换等功能。

## 功能

- **纯净预览**：打开无遮罩、无水印的干净谱面窗口
- **免登录打印**：直接调用浏览器打印（优先 iframe 原生打印）
- **MP3 强制下载**：绕过限制，Blob 方式下载音频
- **MIDI / CCMZ 解析**：支持 Web 转换、第三方流式解析、本地程序
- **简谱 / 五线谱一键切换**
- **H5 移动端支持**：自动注入可滚动 iframe
- **图片谱 PDF 合成**：针对无 AI 谱面的兜底方案
- **水印 / 遮罩清除**：自动隐藏防盗遮罩、购买提示、页脚水印
- **胶囊悬浮菜单**：右下角简洁控制台，不遮挡谱面

## 安装

1. 安装浏览器扩展：[Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 点击下方安装链接，或复制脚本内容手动添加

**Greasy Fork 安装**（推荐）：

[> 虫虫钢琴增强助手](https://greasyfork.org/zh-CN/scripts/599038-%E8%99%AB%E8%99%AB%E9%92%A2%E7%90%B4%E5%A2%9E%E5%BC%BA%E5%8A%A9%E6%89%8B)

**GitHub 直接安装**：

[点击安装](https://raw.githubusercontent.com/Disene/gangqinpu-helper/main/gangqinpu-helper.user.js)

## 使用说明

打开任意曲谱详情页（`/jianpu/` 或 `/cchtml/`）后，页面右下角会出现圆形「🎼」按钮。

- 鼠标悬停或点击可展开菜单
- **纯净预览**：新窗口打开干净谱面
- **免登录打印**：直接触发打印对话框
- **MP3下载**：强制下载当前曲谱音频
- **MIDI解析**：弹出 CCMZ 链接与转换选项
- **简/五线**：在简谱与五线谱之间切换

官方页面的「下载」「打印」「分享」等按钮也会被劫持为对应增强功能。

## 截图
<img width="91" height="91" alt="image" src="https://github.com/user-attachments/assets/f71f4b86-cacc-4795-8b1b-73466d19da0c" />
<img width="200" height="47" alt="image" src="https://github.com/user-attachments/assets/7d87512b-e82b-451b-b37a-8e14da939d88" />
<img width="200" height="163" alt="image" src="https://github.com/user-attachments/assets/62141b88-8f65-444d-85c6-272bf4596b76" />


## 致谢与参考

本脚本在开发过程中参考并整合了以下优秀作品，特此感谢：

| 来源 | 作者 / 链接 | 主要借鉴内容 |
|------|-------------|--------------|
| [虫虫钢琴铺面查看脚本](https://greasyfork.org/zh-CN/scripts/457019) | TesterNaN | 核心破解逻辑、H5 注入、MIDI 弹窗、水印清除 |
| [虫虫钢琴免VIP扒谱](https://greasyfork.org/zh-CN/scripts/468400) | - | 遮罩与 VIP 限制绕过思路 |
| [虫虫钢琴一键下载PDF](https://greasyfork.org/zh-CN/scripts/557324) | - | 图片谱 PDF 合成思路 |
| [蛐蛐hook](https://greasyfork.org/scripts/443788) | 涛之雨 | sheetplayer 页面 referrer 与水印处理 |
| [吾爱破解论坛帖子](https://www.52pojie.cn/thread-1470976-1-1.html) | - | 相关技术讨论与思路 |

如有遗漏或不当之处，欢迎联系修改。

## 开源协议

本项目采用 [GNU General Public License v3.0 or later](LICENSE)（GPL-3.0-or-later）开源。

这意味着：

- 你可以自由使用、修改、分发本脚本
- 如果修改后继续分发，必须继续使用 GPL-3.0（或兼容协议）并开源
- 必须保留原作者版权声明和本许可证

完整协议文本见 [LICENSE](LICENSE) 文件。

## 免责声明

本脚本仅供学习与个人研究使用，请勿用于商业用途或侵犯版权。使用本脚本所产生的一切后果由使用者自行承担。请支持正版，尊重曲谱作者与平台的劳动成果。

## 贡献

欢迎提交 Issue 或 Pull Request。
