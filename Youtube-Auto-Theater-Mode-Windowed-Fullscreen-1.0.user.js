// ==UserScript==
// @name         Youtube - Auto Theater Mode Windowed Fullscreen
// @namespace    http://tampermonkey.net/
// @version      1.0 // <--- 每次更新都要手动增加这个版本号
// @description  Youtube - Auto Enter Theater Mode and Windowed Fullscreen. YT自动进入影院模式并窗口化全屏.
// @author       GT
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @license      MIT
https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/dist/bilibili-evolved.user.js
// @downloadURL  https://raw.githubusercontent.com/GT-not-GD/youtube-windowed-fullscreen-script/main/Youtube%20-%20Auto%20Theater%20Mode%20Windowed%20Fullscreen%20-1.0.user.js // 
// @updateURL    https://raw.githubusercontent.com/GT-not-GD/youtube-windowed-fullscreen-script/main/Youtube%20-%20Auto%20Theater%20Mode%20Windowed%20Fullscreen%20-1.0.user.js // 
// ==/UserScript==

// ... 脚本代码 ...

(function() {
    'use strict';

    // 存储找到的关键元素
    let ytdWatchFlexy = null;
    let mastheadContainer = null;
    let fullBleedContainer = null;

    // MutationObserver 实例，用于观察元素的添加和属性变化
    let attributeObserver = null;
    let bodyObserver = null;

    // --- 工具函数：防抖 (Debounce) ---
    // 用于限制窗口 resize 事件的触发频率
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // --- 核心函数：应用影院模式样式 (使之成为窗口化全屏) ---
    const applyTheaterStyles = () => {
        // 在每次执行时尝试重新获取元素，以应对 YouTube SPA 页面元素的动态替换
        ytdWatchFlexy = document.getElementsByTagName("ytd-watch-flexy")[0];
        fullBleedContainer = document.getElementById("full-bleed-container");
        mastheadContainer = document.getElementById("masthead-container");

        // 检查所有必需的元素是否都已加载
        if (!ytdWatchFlexy || !fullBleedContainer || !mastheadContainer) {
            // console.log("YT Theater script: Elements not found yet for styling."); // 用于调试
            return; // 如果元素未找到，则退出
        }

        try {
            // 判断是否处于默认布局 (通过检查 default-layout 属性)
            const defaultLayout = ytdWatchFlexy.hasAttribute("default-layout");

            // 如果处于默认布局，则不应用窗口化全屏的样式
             if (defaultLayout) {
                 // console.log("YT Theater script: Default layout detected, skipping style application.");
                 // 可选：如果之前应用了样式，这里可以移除，以恢复YouTube默认的非影院模式样式
                 // fullBleedContainer.style.removeProperty("min-height");
                 // fullBleedContainer.style.removeProperty("position");
                 return;
             }

            // 获取顶部导航栏的高度
            let mastheadContainerHeight = parseFloat(window.getComputedStyle(mastheadContainer).getPropertyValue("height"));

            if (isNaN(mastheadContainerHeight) || mastheadContainerHeight === 0) {
                 // console.log("YT Theater script: Masthead height not valid or is zero."); // 用于调试
                 // 如果获取高度失败，可以尝试一个默认值或等待下次触发
                 // 这里选择退出，等待下次触发或元素加载
                 return;
            }

            // 计算视频区域应占的高度
            const height = window.innerHeight - mastheadContainerHeight;

            // 应用样式到视频容器
            // 使用 !important 可能会增加覆盖其他样式成功的几率
            fullBleedContainer.style.setProperty("min-height", height + "px", "important");
            // 在非默认布局下通常使用 relative 或 absolute，relative 较常见且不脱离文档流
            fullBleedContainer.style.setProperty("position", "relative");

            // console.log(`YT Theater script: Applied styles: min-height=${height}px, position=relative`); // 用于调试

        } catch (error) {
            console.error("YT Theater script: Error applying styles:", error);
        }
    };

    // --- 检查并尝试进入影院模式 ---
    // attemptsLeft: 剩余尝试次数
    // delay: 每次重试之间的延迟毫秒数
    const checkAndEnterTheaterMode = (attemptsLeft, delay) => {
        if (attemptsLeft <= 0) {
            // console.log("YT Theater script: Max attempts to find theater button reached."); // Debug
            return; // 尝试次数用尽，停止
        }

        ytdWatchFlexy = document.getElementsByTagName("ytd-watch-flexy")[0]; // 尝试重新获取元素

        // 如果核心元素 ytd-watch-flexy 都没找到，说明页面结构还没准备好，延迟后重试整个过程
        if (!ytdWatchFlexy) {
             // console.log("YT Theater script: ytd-watch-flexy not found on attempt", attemptsLeft, ". Retrying..."); // Debug
             setTimeout(() => checkAndEnterTheaterMode(attemptsLeft - 1, delay), delay);
             return;
        }


        // 检查是否当前处于默认布局
        const defaultLayout = ytdWatchFlexy.hasAttribute("default-layout");

        // 如果已经不是默认布局（可能是影院或全屏），则无需点击，成功退出
        if (!defaultLayout) {
            // console.log("YT Theater script: Already not in default layout. Stopping theater button check."); // Debug
            // 触发一次样式应用，以防万一（尽管 attributeObserver 应该会处理）
            // applyTheaterStyles(); // 可选，attributeObserver 会处理
            return;
        }

        // 如果是默认布局，尝试查找影院模式按钮
        try {
            // 使用更可靠的选择器: 查找播放器右侧控制区域内，具有 ytp-size-button 类且 aria-keyshortcuts="t" 的按钮
            const theaterButton = ytdWatchFlexy.querySelector('.ytp-right-controls button.ytp-size-button[aria-keyshortcuts="t"]');

            if (theaterButton) {
                // console.log("YT Theater script: Found theater mode button on attempt", attemptsLeft, ", attempting to click."); // Debug
                theaterButton.click();
                // console.log("YT Theater script: Clicked theater mode button."); // Debug
                // 成功点击，脚本后续会由 attributeObserver 接管
            } else {
                // 如果按钮未找到，延迟后重试
                // console.log("YT Theater script: Theater mode button not found on attempt", attemptsLeft, ". Retrying in", delay, "ms..."); // Debug
                setTimeout(() => checkAndEnterTheaterMode(attemptsLeft - 1, delay), delay);
            }
        } catch (error) {
            // 如果查找或点击过程中发生错误，延迟后重试
            console.error("YT Theater script: Error during theater button check on attempt", attemptsLeft, ":", error);
            setTimeout(() => checkAndEnterTheaterMode(attemptsLeft - 1, delay), delay);
        }
    };


    // 创建一个防抖版本的样式应用函数，用于 resize 事件
    const debouncedApplyStyles = debounce(applyTheaterStyles, 100); // 100ms 防抖延迟

    // --- 监听器和观察者设置 ---

    // MutationObserver 用于监听 ytd-watch-flexy 元素的属性变化
    // 主要用于检测 default-layout 属性的变化 (即布局模式切换)
    const setupAttributeObserver = () => {
        if (!ytdWatchFlexy) {
             // console.log("YT Theater script: ytd-watch-flexy not found for attribute observer setup."); // Debug
             return; // 确保 ytdWatchFlexy 元素已找到
        }

        // 如果观察者已存在，先断开连接以避免重复
        if (attributeObserver) attributeObserver.disconnect();

        attributeObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // 只关心 attributes 类型的变化，并且只关心 default-layout 属性
                if (mutation.type === 'attributes' && mutation.attributeName === 'default-layout') {
                    // console.log(`YT Theater script: default-layout attribute changed. New value: ${ytdWatchFlexy.hasAttribute('default-layout')}`); // 用于调试

                    // 无论 default-layout 属性是添加还是移除，都尝试应用样式
                    // applyTheaterStyles 内部会检查 default-layout 来决定是否应用窗口化全屏样式
                    applyTheaterStyles();

                    // 如果属性被添加 (切换回默认布局或加载时是默认布局)，尝试进入影院模式
                    if (ytdWatchFlexy.hasAttribute('default-layout')) {
                        // 此时页面结构相对稳定，给少量重试机会
                        // 尝试 10 次，每次延迟 100ms，总计约 1秒等待
                        setTimeout(() => checkAndEnterTheaterMode(10, 100), 50); // 初始延迟 50ms 再开始重试
                    }
                }
            });
        });

        // 开始观察 ytdWatchFlexy 元素的属性变化
        attributeObserver.observe(ytdWatchFlexy, {
            attributes: true, // 观察属性变化
            attributeFilter: ['default-layout'] // 只关心 default-layout 属性
        });

        // console.log("YT Theater script: Attribute observer set up on ytd-watch-flexy."); // 用于调试
    };

    // MutationObserver 用于监听 body 的子元素变化，以便在 ytd-watch-flexy 加载后进行初始化
    // 这是因为 ytd-watch-flexy 元素可能不是在 DOMContentLoaded 时就存在的，且 YouTube 是 SPA
    const setupBodyObserver = () => {
        // 如果 bodyObserver 已经存在，先断开，避免重复设置
         if (bodyObserver) bodyObserver.disconnect();

        bodyObserver = new MutationObserver((mutations, observer) => {
            ytdWatchFlexy = document.getElementsByTagName("ytd-watch-flexy")[0];
            mastheadContainer = document.getElementById("masthead-container");
            fullBleedContainer = document.getElementById("full-bleed-container");

            // 当找到所有必需的关键元素时，停止观察 body 并进行初始化设置
            // 注意：这里只是找到了核心容器，不代表播放器内部已完全加载
            if (ytdWatchFlexy && mastheadContainer && fullBleedContainer) {
                observer.disconnect(); // 停止观察 body

                // console.log("YT Theater script: Initial key elements found. Setting up..."); // 用于调试

                // 尝试自动进入影院模式
                // 提供足够的尝试次数和延迟，等待播放器和按钮加载
                // 尝试 30 次，每次延迟 150ms，总计约 4.5秒等待
                checkAndEnterTheaterMode(30, 150);

                // 初始应用样式 (确保在进入影院模式后立即应用窗口化全屏样式)
                // 即使当前不是影院模式，也运行一次。applyTheaterStyles 内部会检查 default-layout。
                 applyTheaterStyles();

                // 监听窗口大小改变事件，并使用防抖处理
                window.addEventListener('resize', debouncedApplyStyles);

                // 设置属性观察者来监听布局模式变化
                setupAttributeObserver();

                // console.log("YT Theater script: Initialized and listeners/observers set up."); // 用于调试

            }
        });

        // 开始观察 body 元素的子元素变化及其子树
        bodyObserver.observe(document.body, {
            childList: true, // 观察子元素的添加或移除
            subtree: true    // 观察所有后代元素的子元素变化
        });

        // console.log("YT Theater script: Body observer set up."); // 用于调试
    };

    // --- 脚本开始执行 ---
    // 初始化设置 MutationObserver 来等待关键元素的加载
    // 这是脚本执行的入口点
    setupBodyObserver();

    // 对于 YouTube SPA 导航，当 URL 改变但页面不完全刷新时，bodyObserver 不会重新触发。
    // 但是，ytd-watch-flexy 元素通常会保留，其 default-layout 属性可能会变化，
    // 或者其内部结构会变化导致 player 重新加载。
    // setupAttributeObserver 监听 default-layout 变化，当其被添加时（回到默认布局），
    // 会触发 checkAndEnterTheaterMode 的重试链，从而尝试重新进入影院模式。
    // 这应该能处理大部分 SPA 导航的情况。

})(); // 使用立即执行函数表达式 (IIFE) 包裹代码，防止变量污染全局作用域