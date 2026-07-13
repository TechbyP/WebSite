import json
import re
from pathlib import Path
import importlib.util

root = Path(r"c:/Users/dalex/Desktop/Website/International TechbyP")

spec = importlib.util.spec_from_file_location("extract_spare_parts", root / "scripts" / "extract-spare-parts.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

src = (root / "src" / "data" / "sparePartsGenerated.ts").read_text(encoding="utf-8")
match = re.search(r"const RAW_GENERATED_SPARE_PARTS =\s*(\[.*?\]) as const;", src, re.S)
if not match:
    raise SystemExit("Could not parse RAW_GENERATED_SPARE_PARTS")
raw_catalogs = json.loads(match.group(1))

mp_catalog = next(c for c in raw_catalogs if c["id"] == "mp-shared")
assemblies = mp_catalog["assemblies"]

part1 = next(a for a in assemblies if a["id"] == "mp_page_04")
part2 = next(a for a in assemblies if a["id"] == "mp_page_05")

visible = []
for a in assemblies:
    if a["id"] == "mp_page_05":
        continue
    if a["id"] == "mp_page_04":
        merged = dict(part1)
        merged["items"] = list(part1["items"]) + list(part2["items"])
        visible.append(merged)
    else:
        visible.append(a)

pdf_reader = mod.PdfReader(str(root / "src" / "assets" / "Technical" / "MP" / "2024.09.23_Ersatzteilliste MP.pdf"))

page_map = {
    "mp_page_01": [1],
    "mp_page_03": [3],
    "mp_page_04": [4, 5],
    "mp_page_06": [6],
    "mp_page_07": [7],
    "mp_page_08": [8],
    "mp_page_09": [9],
    "mp_page_10": [10],
    "mp_page_11": [11],
}

report = []
for a in visible:
    aid = a["id"]
    pages = page_map.get(aid, [])
    text = "\n".join((pdf_reader.pages[p - 1].extract_text() or "") for p in pages)

    if aid == "mp_page_11":
        expected_rows = mod.parse_mp_hose_rows(text)
    else:
        expected_rows = mod.parse_spare_rows(text)

    actual_keys = {(int(i["pos"]), i["articleNumber"].strip(), i["name"].strip()) for i in a["items"]}
    expected_keys = {(int(i["pos"]), i["articleNumber"].strip(), i["name"].strip()) for i in expected_rows}

    missing_in_pdf = sorted(actual_keys - expected_keys)
    missing_in_catalog = sorted(expected_keys - actual_keys)

    report.append(
        {
            "assembly": aid,
            "pages": pages,
            "catalog_items": len(actual_keys),
            "pdf_items": len(expected_keys),
            "missing_in_pdf_count": len(missing_in_pdf),
            "missing_in_catalog_count": len(missing_in_catalog),
            "missing_in_pdf_sample": missing_in_pdf[:5],
            "missing_in_catalog_sample": missing_in_catalog[:5],
        }
    )

print(json.dumps(report, indent=2, ensure_ascii=False))
