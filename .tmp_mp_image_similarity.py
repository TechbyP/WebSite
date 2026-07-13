from __future__ import annotations

import json
from pathlib import Path

import fitz

root = Path(r"c:/Users/dalex/Desktop/Website/International TechbyP")
pdf_path = root / "src" / "assets" / "Technical" / "MP" / "2024.09.23_Ersatzteilliste MP.pdf"
img_dir = root / "src" / "assets" / "Technical" / "generated" / "spare-parts" / "mp"

page_map = {
    "mp-page-01.png": 1,
    "mp-page-03.png": 3,
    "mp-page-04.png": 4,
    "mp-page-06.png": 6,
    "mp-page-07.png": 7,
    "mp-page-08.png": 8,
    "mp-page-09.png": 9,
    "mp-page-10.png": 10,
}

report = []
with fitz.open(pdf_path) as doc:
    for file_name, page_number in page_map.items():
        image_path = img_dir / file_name
        file_pix = fitz.Pixmap(str(image_path))

        page = doc[page_number - 1]
        sx = file_pix.width / page.rect.width
        sy = file_pix.height / page.rect.height
        render_pix = page.get_pixmap(matrix=fitz.Matrix(sx, sy), alpha=False)

        # Ensure same channel count (both should be RGB, 3 channels)
        f = file_pix.samples
        r = render_pix.samples

        if len(f) != len(r):
            report.append({
                "file": file_name,
                "page": page_number,
                "error": f"sample length mismatch: file={len(f)} render={len(r)}",
            })
            continue

        # Mean absolute difference per byte channel
        total = 0
        for a, b in zip(f, r):
            total += abs(a - b)
        mad = total / len(f)

        report.append(
            {
                "file": file_name,
                "page": page_number,
                "width": file_pix.width,
                "height": file_pix.height,
                "mean_abs_diff": round(mad, 4),
            }
        )

print(json.dumps(report, indent=2))
