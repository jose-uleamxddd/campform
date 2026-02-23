/**
 * Node.js Certificate Generator Script
 * 
 * This script generates certificates by overlaying student names on a template image.
 * Uses the Canvas library for image manipulation.
 * 
 * Installation:
 * npm install canvas
 * 
 * Usage:
 * node scripts/generate-certificates.js
 * 
 * Or with custom data:
 * node scripts/generate-certificates.js --input data.json --output ./certificates
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Path to the certificate template
  templatePath: path.join(__dirname, '../public/public/Certificado de Reconocimiento Curso de Artes Ilustrado Infantil Multicolor.png'),
  
  // Output directory for generated certificates
  outputDir: path.join(__dirname, '../generated-certificates'),
  
  // Text positioning (as percentage from top)
  yPositionPercent: 54,
  
  // Font settings
  fontColor: '#1D2B53', // Dark navy blue
  fontFamily: 'Georgia', // Fallback font (can use custom fonts with registerFont)
  maxFontSize: 90,
  minFontSize: 40,
  horizontalMargin: 100,
  
  // Output format
  outputFormat: 'jpeg', // 'jpeg' or 'png'
  jpegQuality: 0.95,
};

/**
 * Converts a string to Title Case
 * Example: "JUAN PEREZ" -> "Juan Pérez"
 */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Calculates the optimal font size for the given text to fit within maxWidth
 */
function calculateOptimalFontSize(ctx, text, maxWidth, maxFontSize, minFontSize, fontFamily) {
  let fontSize = maxFontSize;
  
  while (fontSize > minFontSize) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;
    
    if (textWidth <= maxWidth) {
      return fontSize;
    }
    
    fontSize -= 2;
  }
  
  return minFontSize;
}

/**
 * Sanitizes a filename by removing special characters
 */
function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Generates a single certificate
 */
async function generateCertificate(templateImage, fullName, config = CONFIG) {
  const {
    yPositionPercent,
    fontColor,
    fontFamily,
    maxFontSize,
    minFontSize,
    horizontalMargin,
    outputFormat,
    jpegQuality,
  } = config;
  
  // Create canvas with template dimensions
  const canvas = createCanvas(templateImage.width, templateImage.height);
  const ctx = canvas.getContext('2d');
  
  // Draw template
  ctx.drawImage(templateImage, 0, 0);
  
  // Format name to Title Case
  const formattedName = toTitleCase(fullName);
  
  // Calculate available width
  const availableWidth = canvas.width - (horizontalMargin * 2);
  
  // Calculate optimal font size
  const optimalFontSize = calculateOptimalFontSize(
    ctx,
    formattedName,
    availableWidth,
    maxFontSize,
    minFontSize,
    fontFamily
  );
  
  // Set text styling
  ctx.font = `${optimalFontSize}px ${fontFamily}`;
  ctx.fillStyle = fontColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate position
  const x = canvas.width / 2;
  const y = (canvas.height * yPositionPercent) / 100;
  
  // Add subtle shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  // Draw the name
  ctx.fillText(formattedName, x, y);
  
  // Generate filename
  const sanitizedName = sanitizeFilename(formattedName);
  const extension = outputFormat === 'png' ? 'png' : 'jpg';
  const fileName = `Certificado_${sanitizedName}.${extension}`;
  
  // Get buffer
  let buffer;
  if (outputFormat === 'png') {
    buffer = canvas.toBuffer('image/png');
  } else {
    buffer = canvas.toBuffer('image/jpeg', { quality: jpegQuality });
  }
  
  return { buffer, fileName, formattedName };
}

/**
 * Generates certificates for multiple students
 */
async function generateBatchCertificates(students, config = CONFIG) {
  console.log('🎓 Certificate Generator Started');
  console.log('================================');
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${config.outputDir}`);
  }
  
  // Load template
  console.log(`📄 Loading template from: ${config.templatePath}`);
  let templateImage;
  try {
    templateImage = await loadImage(config.templatePath);
    console.log(`✅ Template loaded (${templateImage.width}x${templateImage.height})`);
  } catch (error) {
    console.error(`❌ Failed to load template: ${error.message}`);
    process.exit(1);
  }
  
  console.log(`\n🔄 Generating ${students.length} certificates...\n`);
  
  const results = {
    success: [],
    failed: [],
  };
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const fullName = typeof student === 'string' 
      ? student 
      : `${student.first_name} ${student.last_name}`;
    
    try {
      const { buffer, fileName, formattedName } = await generateCertificate(
        templateImage,
        fullName,
        config
      );
      
      const outputPath = path.join(config.outputDir, fileName);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`  ✅ [${i + 1}/${students.length}] ${formattedName}`);
      results.success.push({ name: formattedName, path: outputPath });
    } catch (error) {
      console.log(`  ❌ [${i + 1}/${students.length}] ${fullName} - Error: ${error.message}`);
      results.failed.push({ name: fullName, error: error.message });
    }
  }
  
  // Print summary
  console.log('\n================================');
  console.log('📊 Summary');
  console.log('================================');
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📁 Output: ${config.outputDir}`);
  
  if (results.failed.length > 0) {
    console.log('\n⚠️ Failed certificates:');
    results.failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }
  
  return results;
}

// Sample data - Replace with your actual student data
const SAMPLE_STUDENTS = [
  { first_name: 'Juan Carlos', last_name: 'Pérez González' },
  { first_name: 'María', last_name: 'López' },
  { first_name: 'PEDRO PABLO', last_name: 'MARTINEZ RODRIGUEZ' },
  { first_name: 'Ana', last_name: 'Silva' },
  { first_name: 'Roberto', last_name: 'García Hernández' },
];

// Main execution
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let students = SAMPLE_STUDENTS;
  let customConfig = { ...CONFIG };
  
  // Check for --input flag for custom JSON data
  const inputIndex = args.indexOf('--input');
  if (inputIndex !== -1 && args[inputIndex + 1]) {
    const inputPath = args[inputIndex + 1];
    try {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      students = Array.isArray(data) ? data : data.students || [];
      console.log(`📂 Loaded ${students.length} students from ${inputPath}`);
    } catch (error) {
      console.error(`❌ Failed to load input file: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Check for --output flag for custom output directory
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    customConfig.outputDir = path.resolve(args[outputIndex + 1]);
  }
  
  // Generate certificates
  await generateBatchCertificates(students, customConfig);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  generateCertificate,
  generateBatchCertificates,
  toTitleCase,
  CONFIG,
};
