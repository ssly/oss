const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const IMAGE_DIR = '/usr/src/oss';
// const IMAGE_DIR = path.join(__dirname, '../oss');

// 中间件：处理图片请求
app.get('/oss/*', async (req, res) => {
  try {
    // 获取请求的相对路径，例如 '/oss/home/image.jpg' -> 'home/image.jpg'
    const relativeImagePath = req.params[0];
    
    // 防止路径遍历攻击，规范化路径
    const sanitizedPath = path.normalize(relativeImagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // 构建图片的绝对路径
    const imagePath = path.join(IMAGE_DIR, sanitizedPath);
    console.log('goooooodoss', req.url, req.params, sanitizedPath, imagePath)

    // 确保图片路径在 IMAGE_DIR 目录下
    if (!imagePath.startsWith(IMAGE_DIR)) {
      return res.status(400).send('无效的图片路径');
    }

    // 检查图片是否存在
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('图片未找到');
    }

    const { q, w, h, mode } = req.query;

    let image = sharp(imagePath);

    // 处理大小调整
    if (w || h) {
      const resizeOptions = {};

      if (w) resizeOptions.width = parseInt(w, 10);
      if (h) resizeOptions.height = parseInt(h, 10);

      if (mode === '1') {
        resizeOptions.fit = sharp.fit.inside; // 保持比例
        resizeOptions.withoutEnlargement = true;
      } else {
        resizeOptions.fit = sharp.fit.fill; // 填充，不保持比例
      }

      image = image.resize(resizeOptions);
    }

    // 处理质量压缩
    if (q) {
      const quality = parseInt(q, 10);
      if (quality >= 1 && quality <= 100) {
        // 根据图片格式选择相应的压缩方法
        const metadata = await image.metadata();
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          image = image.jpeg({ quality });
        } else if (metadata.format === 'png') {
          // PNG 的压缩质量控制不同，可以调整压缩级别
          // 压缩级别范围从 0 (无压缩) 到 9 (最高压缩)
          const compressionLevel = Math.round((100 - quality) / 10);
          image = image.png({ compressionLevel });
        } else if (metadata.format === 'webp') {
          image = image.webp({ quality });
        }
        // 你可以根据需要添加更多格式的压缩支持
      }
    }

    // 获取图片的 MIME 类型
    const metadata = await image.metadata();
    let mimeType = 'image/jpeg'; // 默认类型
    if (metadata.format === 'png') mimeType = 'image/png';
    else if (metadata.format === 'webp') mimeType = 'image/webp';
    // 你可以根据需要添加更多格式

    res.set('Content-Type', mimeType);
    image.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('服务器内部错误');
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`OSS 服务已启动，访问：http://localhost:${PORT}/oss/你的图片.jpg`);
});
