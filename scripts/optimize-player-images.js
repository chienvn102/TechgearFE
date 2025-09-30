#!/usr/bin/env node

/**
 * Script tự động tối ưu hóa ảnh tuyển thủ
 * 
 * Chức năng:
 * 1. Resize ảnh thành multiple sizes responsive
 * 2. Convert sang WebP format
 * 3. Optimize compression
 * 4. Generate thumbnails
 * 
 * Usage: node scripts/optimize-player-images.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Cấu hình sizes cho responsive images
const SIZES = {
  sm: { width: 640, height: 240 },   // Mobile
  md: { width: 1024, height: 384 },  // Tablet
  lg: { width: 1440, height: 540 },  // Desktop
  xl: { width: 1920, height: 720 },  // Large Desktop
  thumb: { width: 200, height: 75 }  // Thumbnail
};

// Cấu hình chất lượng
const QUALITY = {
  webp: 85,
  jpeg: 80
};

const INPUT_DIR = path.join(__dirname, '../public/images/players/source');
const OUTPUT_DIR = path.join(__dirname, '../public/images/players');
const THUMB_DIR = path.join(OUTPUT_DIR, 'thumbnails');

async function ensureDirectories() {
  try {
    await fs.mkdir(INPUT_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(THUMB_DIR, { recursive: true });
    console.log('✅ Đã tạo thư mục cần thiết');
  } catch (error) {
    console.error('❌ Lỗi tạo thư mục:', error);
  }
}

async function optimizeImage(inputPath, playerId) {
  console.log(`🔄 Đang xử lý: ${playerId}`);
  
  try {
    // Đọc ảnh gốc
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`   📐 Kích thước gốc: ${metadata.width}x${metadata.height}`);
    
    // Tạo responsive sizes
    for (const [sizeName, dimensions] of Object.entries(SIZES)) {
      const outputPath = sizeName === 'thumb' 
        ? path.join(THUMB_DIR, `${playerId}_thumb.webp`)
        : path.join(OUTPUT_DIR, `${playerId}_${dimensions.width}x${dimensions.height}.webp`);
      
      await image
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: QUALITY.webp })
        .toFile(outputPath);
      
      // Kiểm tra dung lượng
      const stats = await fs.stat(outputPath);
      const sizeKB = Math.round(stats.size / 1024);
      
      console.log(`   ✅ ${sizeName}: ${dimensions.width}x${dimensions.height} (${sizeKB}KB)`);
      
      // Cảnh báo nếu file quá lớn
      if (sizeKB > 200) {
        console.log(`   ⚠️  File ${sizeName} lớn hơn 200KB (${sizeKB}KB)`);
      }
    }
    
    // Tạo fallback JPG cho main size
    const jpgPath = path.join(OUTPUT_DIR, `${playerId}.jpg`);
    await image
      .resize(SIZES.lg.width, SIZES.lg.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: QUALITY.jpeg })
      .toFile(jpgPath);
    
    console.log(`   ✅ JPG fallback tạo thành công`);
    
  } catch (error) {
    console.error(`   ❌ Lỗi xử lý ${playerId}:`, error.message);
  }
}

async function processAllImages() {
  console.log('🚀 Bắt đầu xử lý ảnh tuyển thủ...\n');
  
  await ensureDirectories();
  
  try {
    // Đọc tất cả files trong thư mục source
    const files = await fs.readdir(INPUT_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      console.log('❌ Không tìm thấy ảnh nào trong thư mục source/');
      console.log('💡 Hãy đặt ảnh gốc vào: public/images/players/source/');
      console.log('💡 Tên file nên theo format: {player_id}.{extension}');
      console.log('   Ví dụ: cr7.jpg, messi.png, mbappe.webp');
      return;
    }
    
    console.log(`📁 Tìm thấy ${imageFiles.length} ảnh để xử lý\n`);
    
    for (const file of imageFiles) {
      const playerId = path.parse(file).name.toLowerCase();
      const inputPath = path.join(INPUT_DIR, file);
      
      await optimizeImage(inputPath, playerId);
      console.log(''); // Empty line between players
    }
    
    console.log('🎉 Hoàn thành xử lý tất cả ảnh!');
    console.log('\n📊 Kết quả:');
    console.log(`   • ${imageFiles.length} tuyển thủ đã được xử lý`);
    console.log(`   • ${Object.keys(SIZES).length} sizes cho mỗi ảnh`);
    console.log(`   • WebP + JPG fallback`);
    console.log(`   • Thumbnails trong /thumbnails/`);
    
  } catch (error) {
    console.error('❌ Lỗi xử lý:', error);
  }
}

// Chỉ dẫn sử dụng
function showUsage() {
  console.log('📸 SCRIPT TỐI ƯU HÓA ẢNH TUYỂN THỦ');
  console.log('=====================================\n');
  console.log('📁 Cách sử dụng:');
  console.log('1. Đặt ảnh gốc vào: public/images/players/source/');
  console.log('2. Tên file theo format: {player_id}.{extension}');
  console.log('   Ví dụ: cr7.jpg, messi.png, mbappe.webp');
  console.log('3. Chạy: npm run optimize-images\n');
  
  console.log('🎯 Yêu cầu ảnh gốc:');
  console.log('• Kích thước: tối thiểu 1200x400px');
  console.log('• Chất lượng: cao, không bị blur');
  console.log('• Format: JPG, PNG, WebP');
  console.log('• Composition: landscape, rule of thirds\n');
  
  console.log('📤 Output được tạo:');
  Object.entries(SIZES).forEach(([name, size]) => {
    console.log(`• ${name}: ${size.width}x${size.height}px`);
  });
  console.log('• JPG fallback cho compatibility\n');
}

// Main execution
if (require.main === module) {
  // Kiểm tra nếu sharp được cài đặt
  try {
    require('sharp');
    processAllImages();
  } catch (error) {
    console.log('❌ Thiếu dependency "sharp"');
    console.log('💡 Cài đặt: npm install sharp --save-dev');
    console.log('💡 Hoặc: yarn add sharp --dev\n');
    showUsage();
  }
}
