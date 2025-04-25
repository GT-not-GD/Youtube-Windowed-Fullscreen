# Youtube - Auto Theater Mode Windowed Fullscreen Script

一个 Tampermonkey/Violentmonkey 用户脚本，用于自动将 YouTube 视频切换到影院模式，并调整播放器大小以实现窗口化全屏效果。

## 功能

*   自动在加载 YouTube 视频页面时尝试进入影院模式。
*   在影院模式下，自动调整视频播放区域的高度，使其填充浏览器窗口减去顶部导航栏的空间，达到窗口化全屏的效果。
*   响应浏览器窗口大小变化，动态调整视频区域大小。
*   支持 YouTube 的单页应用 (SPA) 导航，在不刷新页面的情况下切换视频也能正常工作。
*   查找影院模式按钮的方式与语言无关，兼容不同语言的 YouTube 界面。

## 安装

在安装此脚本之前，您需要先安装一个用户脚本管理器，例如：

*   **Tampermonkey** (适用于 Chrome, Edge, Firefox, Safari, Opera, Dolphin Browser, UC Browser): [https://www.tampermonkey.net/](https://www.tampermonkey.net/)
*   **Violentmonkey** (适用于 Chrome, Edge, Firefox): [https://violentmonkey.github.io/](https://violentmonkey.github.io/)

安装用户脚本管理器后，请点击以下链接来安装此脚本：

➡️ **[点击此处安装脚本](https://raw.githubusercontent.com/GT-not-GD/youtube-windowed-fullscreen-script/master/Youtube-Auto-Theater-Mode-Windowed-Fullscreen.user.js)**

点击链接后，您的用户脚本管理器会打开一个安装确认页面。请检查脚本信息，然后点击“安装”或“确认”按钮。

## 使用方法

安装脚本后，访问任何 YouTube 视频页面即可。脚本将在页面加载后自动尝试将播放器切换到影院模式，并应用窗口化全屏的样式。

## 兼容性

此脚本设计用于 `https://www.youtube.com/*`。

## 许可证

此项目根据 [MIT 许可证](https://opensource.org/licenses/MIT) 发布。

## 鸣谢

此脚本基于 Martin______X 的初始工作进行了优化和修改。