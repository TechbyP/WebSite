from __future__ import annotations

import json
from pathlib import Path

import fitz

root = Path(r"c:/Users/dalex/Desktop/Website/International TechbyP")
pdf_path = root / "src" / "assets" / "Technical" / "MP" / "2024.09.23_Ersatzteilliste MP.pdf"
img_dir = root / "src" / "assets" / "Technical" / "generated" / "spare-parts" / "mp"

files = [
    "mp-page-01.png",
    "mp-page-03.png",
    "mp-page-04.png",
    "mp-page-06.png",
    "mp-page-07.png",
    "mp-page-08.png",
    "mp-page-09.png",
    "mp-page-10.png",
]

report = []
with fitz.open(pdf_path) as doc:
    for file_name in files:
        image_path = img_dir / file_name
        file_pix = fitz.Pixmap(str(image_path))

        page_scores = []
        for page_number in range(1, 12):
            page = doc[page_number - 1]
            sx = file_pix.width / page.rect.width
            sy = file_pix.height / page.rect.height
            render_pix = page.get_pixmap(matrix=fitz.Matrix(sx, sy), alpha=False)

            f = file_pix.samples
            r = render_pix.samples
            if len(f) != len(r):
                continue

            total = 0
            for a, b in zip(f, r):
                total += abs(a - b)
            mad = total / len(f)
            page_scores.append((page_number, mad))

        page_scores.sort(key=lambda item: item[1])
        best_page, best_mad = page_scores[0]

        report.append(
            {
                "file": file_name,
                "best_page": best_page,
                "best_mad": round(best_mad, 4),
                "top3": [
                    {"page": p, "mad": round(m, 4)}
                    for p, m in page_scores[:3]
                ],
            }
        )

print(json.dumps(report, indent=2))
