from __future__ import annotations

import hashlib
import json
from pathlib import Path

import fitz

root = Path(r"c:/Users/dalex/Desktop/Website/International TechbyP")
pdf_path = root / "src" / "assets" / "Technical" / "MP" / "2024.09.23_Ersatzteilliste MP.pdf"
img_dir = root / "src" / "assets" / "Technical" / "generated" / "spare-parts" / "mp"

# visible MP tabs that currently show MP images
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
        exists = image_path.exists()

        item = {
            "file": file_name,
            "page": page_number,
            "exists": exists,
        }

        if not exists:
            report.append(item)
            continue

        image_bytes = image_path.read_bytes()
        item["file_size_bytes"] = len(image_bytes)
        item["image_sha256"] = hashlib.sha256(image_bytes).hexdigest()

        # Render PDF page with same matrix as generator script.
        pix = doc[page_number - 1].get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
        rendered_png = pix.tobytes("png")

        item["render_sha256"] = hashlib.sha256(rendered_png).hexdigest()
        item["exact_match_to_pdf_render"] = item["image_sha256"] == item["render_sha256"]
        item["image_size_px"] = {"width": pix.width, "height": pix.height}

        # Also capture actual file dimensions via pixmap load for sanity.
        file_pix = fitz.Pixmap(str(image_path))
        item["file_size_px"] = {"width": file_pix.width, "height": file_pix.height}

        report.append(item)

print(json.dumps(report, indent=2))
