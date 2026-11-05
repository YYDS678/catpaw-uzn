import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const currentDir = process.cwd();
const distDir = path.resolve(currentDir, 'dist');

if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist! Run npm run build first.');
    process.exit(1);
}

const requiredFiles = ['index.js', 'index.config.js'];
for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(distDir, file))) {
        console.error(`Error: Required file dist/${file} not found!`);
        process.exit(1);
    }
}

// Ensure MD5 files exist
const targetFiles = ['index.js', 'index.config.js'];
for (const file of targetFiles) {
    const md5Path = path.join(distDir, `${file}.md5`);
    if (!fs.existsSync(md5Path)) {
        const hash = createHash('md5').update(fs.readFileSync(path.join(distDir, file))).digest('hex');
        fs.writeFileSync(md5Path, hash);
    }
}

const allFiles = ['index.js', 'index.config.js', 'index.js.md5', 'index.config.js.md5'];
const zipName = 'dist.zip';
const outZipPath = path.resolve(currentDir, zipName);
const aliasZipPath = path.resolve(currentDir, 'catpaw-nodejs.zip');
const rootZipPath = path.resolve(currentDir, '../../dist.zip');

try {
    // Remove old zip files if exist
    [outZipPath, aliasZipPath, rootZipPath].forEach((p) => {
        if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    // Package using zip command with -j (junk directory names)
    execSync(`zip -j -q "${outZipPath}" ${allFiles.map((f) => `"${path.join(distDir, f)}"`).join(' ')}`);

    // Copy to aliases
    fs.copyFileSync(outZipPath, aliasZipPath);
    try {
        fs.copyFileSync(outZipPath, rootZipPath);
    } catch (_) {}

    const stat = fs.statSync(outZipPath);
    const zipHash = createHash('md5').update(fs.readFileSync(outZipPath)).digest('hex');

    console.log('\n=============================================');
    console.log('✅ 本地 ZIP 订阅包打包成功！');
    console.log('=============================================');
    console.log(`📦 包文件路径: ${outZipPath}`);
    console.log(`📦 根目录副本: ${rootZipPath}`);
    console.log(`📏 文件大小:   ${(stat.size / 1024).toFixed(2)} KB (${stat.size} 字节)`);
    console.log(`🔑 压缩包 MD5: ${zipHash}`);
    console.log('\n📄 压缩包内文件列表:');
    allFiles.forEach((file) => {
        const fStat = fs.statSync(path.join(distDir, file));
        console.log(`  - ${file.padEnd(20)} (${(fStat.size / 1024).toFixed(2)} KB)`);
    });
    console.log('=============================================\n');
} catch (err) {
    console.error('打包失败:', err.message);
    process.exit(1);
}
