import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

interface FileMetadata {
    id: string;
    name: string;
    type: string;
    category: string;
    size: string;
    date: string;
    path: string;
    previewPath?: string;

}

export default function fileMetadataPlugin(): Plugin {
    return {
        name: 'file-metadata-generator',
        buildStart() {
            const filesDir = path.resolve(__dirname, '../public/files');
            const outputFile = path.resolve(__dirname, '../public/file-metadata.json');

            if (!fs.existsSync(filesDir)) {
                console.warn(`[file-metadata-generator] Directory not found: ${filesDir}`);
                return;
            }

            const files = fs.readdirSync(filesDir);

            const metadata: FileMetadata[] = files.map((file, index) => {
                const filePath = path.join(filesDir, file);
                const stats = fs.statSync(filePath);
                const ext = path.extname(file).slice(1).toLowerCase();

                const category = getCategory(file, ext);

                return {
                    id: (index + 1).toString(),
                    name: file, // Just the name without extension
                    type: ext, // Use the actual extension
                    category,
                    size: formatFileSize(stats.size),
                    date: stats.mtime.toISOString(),
                    url: `/files/${file}`, // Use 'url' instead of 'path'
                    previewUrl: getPreviewPath(file, ext), // Use 'previewUrl' instead of 'previewPath'
                };
            });

            fs.writeFileSync(outputFile, JSON.stringify(metadata, null, 2));
            console.log(`[file-metadata-generator] Metadata written to ${outputFile}`);
        },
    };
}

// === Helper functions ===

function getCategory(filename: string, ext: string): string {
    const lowerFilename = filename.toLowerCase();
    
    // First check filename patterns
    if (/invoice|receipt/i.test(lowerFilename)) return 'Invoice';
    if (/manual|guide/i.test(lowerFilename)) return 'Manual';
    if (/brochure|catalog|flyer|leaflet|product sheet/i.test(lowerFilename)) return 'Brochure';
    if (/report|analysis/i.test(lowerFilename)) return 'Report';
    if (/presentation|slides/i.test(lowerFilename)) return 'Presentation';
    if (/contract|agreement/i.test(lowerFilename)) return 'Contract';
    if (/specification|spec/i.test(lowerFilename)) return 'Specification';
    if (/form|application/i.test(lowerFilename)) return 'Form';
    if (/policy|terms/i.test(lowerFilename)) return 'Policy';
    if (/data|dataset/i.test(lowerFilename)) return 'Dataset';

    // Then check by extension
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const audioExts = ['mp3', 'wav', 'ogg', 'flac'];

    if (imageExts.includes(ext)) return 'Image';
    if (videoExts.includes(ext)) return 'Video';
    if (audioExts.includes(ext)) return 'Audio';
    if (docExts.includes(ext)) return 'Document';

    return 'Other';
}

// Update the getPreviewPath function to ensure PDFs get preview URLs
function getPreviewPath(filename: string, ext: string): string | undefined {
  const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mov', 'avi'];
  if (previewableTypes.includes(ext)) {
    return `/files/${filename}`;
  }
  return undefined;
}

// function getFileType(ext: string): string {
//     // Return MIME-like or simple type
//     switch (ext) {
//         case 'jpg':
//         case 'jpeg':
//         case 'png':
//         case 'gif':
//         case 'bmp':
//         case 'svg':
//         case 'webp':
//             return 'image';
//         case 'pdf':
//             return 'pdf';
//         case 'doc':
//         case 'docx':
//             return 'word';
//         case 'xls':
//         case 'xlsx':
//             return 'excel';
//         case 'ppt':
//         case 'pptx':
//             return 'powerpoint';
//         case 'txt':
//             return 'text';
//         case 'mp4':
//         case 'mov':
//         case 'avi':
//         case 'mkv':
//         case 'webm':
//             return 'video';
//         case 'mp3':
//         case 'wav':
//         case 'ogg':
//         case 'flac':
//             return 'audio';
//         default:
//             return 'unknown';
//     }
// }

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + ' KB';
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(2) + ' MB';
    const gb = mb / 1024;
    return gb.toFixed(2) + ' GB';
}



