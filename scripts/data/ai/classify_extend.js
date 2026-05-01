/**
 * @Author: colpu
 * @Date: 2026-04-10 14:32:12
 * @LastEditors: colpu ycg520520@qq.com
 * @LastEditTime: 2026-04-30 15:56:52
 * @
 * @Copyright (c) 2026 by colpu, All Rights Reserved.
 */
export default [
  {
    classify_id: 7,
    name: "老照片修复",
    icon: "static/icon/01.jpg",
    src: "static/repeair/01.png",
    original_src: "static/repeair/01_original.png",
    slider_percent: 0.5,
    feature: "智能识别人脸区域，一键去除模糊，增强面部细节，提升人脸图像的清晰度与质量",
    example_right: [
      {
        id: 1,
        src: "static/example/right_01.jpg",
        size: { width: 80, height: 80 },
      },
      {
        id: 2,
        src: "static/example/right_02.jpg",
        size: { width: 160, height: 80 },
      },
    ],
    example_error: [
      {
        id: 1,
        title: "人像过多",
        desc: "因多个面容需要进行修复，在修复过程中不确定因素过多，可能会导致修复结果有误。",
        src: "static/example/err_01.jpg",
      },
      {
        id: 2,
        title: "人像缺失",
        desc: "大范围破损，遮挡，侵蚀等，在修复过程中无法完好的提取人像要素。",
        src: "static/example/err_02.jpg",
      },
      {
        id: 3,
        title: "非人像",
        desc: "修复工具，对于人像修复效果较显著，非人像在修复时无显著效果。",
        src: "static/example/err_03.jpg",
      },
    ],
  },
  {
    classify_id: 16,
    name: "图像变清晰",
    feature: "对图像分辨率进行细节增强、图像修复以及倍数放大，显著提升图像细节丰富度，使图像变得更加清晰，具有更加真实、自然的细节。",
    icon: "static/icon/02.jpg",
    src: "static/repeair/0201.jpg",
    original_src: "static/repeair/0201_original.jpg",
    slider_percent: 0.5,
    is_auto: false,
    example_right: [
      {
        id: 1,
        src: "static/example/right_03.jpg",
        size: { width: 80, height: 80 },
      },
      {
        id: 2,
        src: "static/example/right_04.jpg",
        size: { width: 160, height: 80 },
      },
    ],
    example_error: [
      {
        id: 1,
        title: "损坏严重或失真",
        desc: "对于严重损坏或失真的图片，可能无法有效恢复原始细节和纹理。",
        src: "static/example/err_04.jpg",
      },
      {
        id: 2,
        title: "色彩偏差严重",
        desc: "如果图片本身存在严重的色彩偏差，可能无法完全校正色彩，导致最终效果不理想。",
        src: "static/example/err_05.jpg",
      },
      {
        id: 3,
        title: "分辨率过高",
        desc: "对于像素过高的图片，进行高分辨率处理，影响较小，可能无法达到理想的增强效果。",
        src: "static/example/err_06.jpg",
      },
    ],
  },
  {
    classify_id: 17,
    name: "图像放大",
    feature: "对低质量的设计素材图像进行优化处理，用于后续的设计生产，对拍摄的照片进行清晰度提升。",
    icon: "static/icon/04.jpg",
    src: "static/repeair/03.png",
    original_src: "static/repeair/03_original.png",
    slider_percent: 0.5,
    is_scale: true,
    example_right: [
      {
        id: 1,
        src: "static/example/right_05.jpg",
        size: { width: 80, height: 80 },
      },
      {
        id: 2,
        src: "static/example/right_06.jpg",
        size: { width: 160, height: 80 },
      },
    ],
    example_error: [
      {
        id: 1,
        title: "损坏严重或失真",
        desc: "对于严重损坏或失真的图片，可能无法有效恢复原始细节和纹理。",
        src: "static/example/err_04.jpg",
      },
      {
        id: 2,
        title: "色彩偏差严重",
        desc: "如果图片本身存在严重的色彩偏差，可能无法完全校正色彩，导致最终效果不理想。",
        src: "static/example/err_05.jpg",
      },
      {
        id: 3,
        title: "分辨率过高",
        desc: "对于像素过高的图片，进行高分辨率处理，影响较小，可能无法达到理想的增强效果。",
        src: "static/example/err_06.jpg",
      },]
  },
  {
    classify_id: 18,
    name: "黑白上色",
    feature: "分析黑白图片的内容，识别出不同的物体、人物、背景等元素，并为它们赋予相应的颜色，将其转换为彩色图片，使其更适合展示。",
    icon: "static/icon/03.jpg",
    src: "static/repeair/0401.jpg",
    original_src: "static/repeair/0401_original.jpg",
    slider_percent: 0.5,
    example_right: [
      {
        id: 1,
        src: "static/example/right_07.jpg",
        size: { width: 80, height: 80 },
      },
      {
        id: 2,
        src: "static/example/right_08.jpg",
        size: { width: 160, height: 80 },
      },
    ],
    example_error: [
      {
        id: 1,
        title: "正常色彩图片",
        desc: "正常彩色图片，使用老照片上色技术可能会改变原有的色彩，导致颜色失真或不自然。",
        src: "static/example/err_10.jpg",
      },
      {
        id: 2,
        title: "损坏严重或失真",
        desc: "严重损坏或失真的老照片，上色技术可能无法有效恢复原始细节和纹理。",
        src: "static/example/err_11.jpg",
      },
      {
        id: 3,
        title: "细节过于复杂",
        desc: "此类图片，上色技术可能难以准确重建所有细节，艺术效果可能与实际需求不符。",
        src: "static/example/err_12.jpg",
      },
    ],
  },
  {
    classify_id: 19,
    name: "人像微动",
    feature: "将静态图片中的人物变成动态化效果，让人物动作、面部表情鲜活起来，为友人祝福更生动。",
    isnew: true,
    ishidden: true,
    icon: "static/icon/05.jpg",
    src: "static/repeair/05.jpg",
    original_src: "static/repeair/05_original.jpg",
    slider_percent: 0.5,
    example_right: [
      {
        id: 1,
        src: "static/example/right_09.jpg",
        size: { width: 80, height: 80 },
      },
      {
        id: 2,
        src: "static/example/right_10.jpg",
        size: { width: 160, height: 80 },
      },
    ],
    example_error: [
      {
        id: 1,
        title: "非人像图片",
        desc: "微动图片技术主要针对人脸动态效果设计，非人物图片可能无法达到理想的动态效果。",
        src: "static/example/err_13.jpg",
      },
      {
        id: 2,
        title: "面部遮挡",
        desc: "人脸不清晰或遮挡，这样AI技术才能准确捕捉到面部特征并进行动态效果的生成。",
        src: "static/example/err_14.jpg",
      },
      {
        id: 3,
        title: "多人场景图片",
        desc: "人物众多的场景，可能导致面部表情或动作的不准确，影响活照片的效果。",
        src: "static/example/err_15.jpg",
      },
    ],
    status: 0,
  },
];
