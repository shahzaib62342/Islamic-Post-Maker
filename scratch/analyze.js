import fs from 'fs';
import path from 'path';

const dir = 'f:/Projects/Islamic-Post-Maker/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

function getDimensions(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        if (filePath.endsWith('.png')) {
            return {
                width: buffer.readUInt32BE(16),
                height: buffer.readUInt32BE(20)
            };
        } else if (filePath.endsWith('.jpg')) {
            let offset = 2;
            while (offset < buffer.length) {
                const marker = buffer.readUInt16BE(offset);
                offset += 2;
                if (marker === 0xFFC0 || marker === 0xFFC2) {
                    return {
                        height: buffer.readUInt16BE(offset + 3),
                        width: buffer.readUInt16BE(offset + 5)
                    };
                }
                offset += buffer.readUInt16BE(offset);
            }
        }
    } catch (e) {}
    return null;
}

const results = files.map(f => {
    const dim = getDimensions(path.join(dir, f));
    if (!dim) return { name: f, type: 'unknown' };
    const ratio = dim.width / dim.height;
    let type = 'portrait';
    if (Math.abs(ratio - 1) < 0.2) type = 'square';
    else if (ratio < 0.7 && ratio > 0.5) type = 'story';
    else if (ratio < 0.85) type = 'portrait';
    
    // Fine-tune for typical social media ratios
    if (Math.abs(ratio - 0.5625) < 0.1) type = 'story'; // 9:16
    if (Math.abs(ratio - 0.8) < 0.1) type = 'portrait'; // 4:5
    
    return { name: f, type };
});

fs.writeFileSync('f:/Projects/Islamic-Post-Maker/scratch/analysis_results.json', JSON.stringify(results, null, 2));
console.log('Analysis complete. Results saved to scratch/analysis_results.json');
