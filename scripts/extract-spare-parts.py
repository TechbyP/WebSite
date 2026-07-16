from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
ASSET_OUTPUT_DIR = ROOT / "src" / "assets" / "Technical" / "generated" / "spare-parts"
DATA_OUTPUT_FILE = ROOT / "src" / "data" / "sparePartsGenerated.ts"

BOPROB_DIR = ROOT / "src" / "assets" / "Technical" / "BoprobIII"
MP_PDF = ROOT / "src" / "assets" / "Technical" / "MP" / "2024.09.23_Ersatzteilliste MP.pdf"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_only = ascii_only.lower()
    ascii_only = re.sub(r"[^a-z0-9]+", "-", ascii_only).strip("-")
    return ascii_only or "assembly"


def normalize_spaces(value: str) -> str:
    value = value.replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def clean_text(value: str) -> str:
    value = normalize_spaces(value)
    value = (
        value.replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u00b0", " grad")
        .replace("\u00ae", "")
    )
    value = value.replace("\ufffd", "")
    value = value.encode("latin-1", "ignore").decode("latin-1", "ignore")
    return normalize_spaces(value)


def should_skip_name(name: str) -> bool:
    lowered = name.lower()
    blocked_prefixes = (
        "k:\\",
        "c:\\",
        "tel.",
        "e-mail",
        "bodenprobetechnik",
        "allgemeintoleranzen",
        "din iso",
        "werkstoff",
        "gewicht in g",
        "masstab",
        "blatt",
        "schutzvermerk",
        "technische daten",
        "erstfreigabe",
        "name",
        "zeichnungsnr",
    )
    return lowered.startswith(blocked_prefixes)


def parse_spare_rows(raw_text: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen: set[tuple[int, str, str]] = set()

    for raw_line in raw_text.splitlines():
        line = clean_text(raw_line)

        if not line:
            continue

        # Repair split article numbers like "MP-UP.203.00- 02".
        line = re.sub(r"([A-Za-z0-9.]+-)\s+(\d{2})(?=\s)", r"\1\2", line)

        match = re.match(r"^(\d+)\s+([A-Za-z0-9._/\-]+)\s+(.+)$", line)
        if not match:
            continue

        pos = int(match.group(1))
        article_number = clean_text(match.group(2))
        rest = clean_text(match.group(3))

        # Ignore obvious non-article tokens like "179" from dimension lines.
        if not re.search(r"[A-Za-z]", article_number):
            continue

        qty_candidates = list(re.finditer(r"(?<![A-Za-z0-9])(\d+)(?![A-Za-z0-9])", rest))
        if not qty_candidates:
            continue

        qty_match = qty_candidates[-1]
        quantity = int(qty_match.group(1))
        name = clean_text(rest[: qty_match.start()])

        # Remove technical file-path fragments that can leak into extracted lines.
        name = re.sub(r"\s+[A-Za-z]:\\.*$", "", name).strip()
        name = re.sub(r"\s+\d+\s*$", "", name).strip()

        if not name or should_skip_name(name):
            continue

        if quantity <= 0:
            quantity = 1

        key = (pos, article_number, name)
        if key in seen:
            continue

        seen.add(key)
        rows.append(
            {
                "pos": pos,
                "articleNumber": article_number,
                "name": name,
                "defaultQty": quantity,
            }
        )

    rows.sort(key=lambda item: (item["pos"], item["articleNumber"]))
    return rows


def parse_mp_hose_rows(raw_text: str) -> list[dict[str, Any]]:
    lines = [clean_text(line) for line in raw_text.splitlines()]
    lines = [line for line in lines if line]

    rows: list[dict[str, Any]] = []
    index = 0

    while index < len(lines):
        line = lines[index]
        inline_match = re.match(r"^(MP-[A-Za-z0-9._/\-]+)\s+(.+)$", line)
        if inline_match:
            article_number = inline_match.group(1)
            remainder = inline_match.group(2).strip()
            qty_match = re.search(r"(?<![A-Za-z0-9])(\d+)(?![A-Za-z0-9])\s*$", remainder)

            if qty_match:
                description = clean_text(remainder[: qty_match.start()])
                quantity = int(qty_match.group(1))
                if description and not should_skip_name(description):
                    rows.append(
                        {
                            "pos": len(rows) + 1,
                            "articleNumber": article_number,
                            "name": description,
                            "defaultQty": max(1, quantity),
                        }
                    )
                index += 1
                continue

        article_match = re.match(r"^(MP-[A-Za-z0-9._/\-]+)$", line)

        if not article_match:
            index += 1
            continue

        article_number = article_match.group(1)
        index += 1

        description_parts: list[str] = []
        quantity = 1

        while index < len(lines):
            current = lines[index]

            if re.match(r"^(MP-[A-Za-z0-9._/\-]+)$", current):
                break

            pure_qty = re.fullmatch(r"(\d+)", current)
            inline_qty = re.match(r"^(.*?)(?:\s+)(\d+)$", current)

            if pure_qty:
                quantity = int(pure_qty.group(1))
                index += 1
                break

            if inline_qty and " " in inline_qty.group(1).strip():
                description_parts.append(inline_qty.group(1).strip())
                quantity = int(inline_qty.group(2))
                index += 1
                break

            description_parts.append(current)
            index += 1

        description = clean_text(" ".join(description_parts))
        description = re.sub(r"\s+[A-Za-z]:\\.*$", "", description).strip()

        if not description or should_skip_name(description):
            continue

        rows.append(
            {
                "pos": len(rows) + 1,
                "articleNumber": article_number,
                "name": description,
                "defaultQty": max(1, quantity),
            }
        )

    return rows


def render_page_to_png(pdf_path: Path, page_index: int, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with fitz.open(pdf_path) as document:
        page = document[page_index]
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
        pixmap.save(output_path)


def parse_boprob_catalog() -> dict[str, Any]:
    assemblies: list[dict[str, Any]] = []

    for pdf_path in sorted(BOPROB_DIR.glob("*.pdf")):
        reader = PdfReader(str(pdf_path))
        if not reader.pages:
            continue

        text = reader.pages[0].extract_text() or ""
        items = parse_spare_rows(text)

        base_name = pdf_path.stem
        clean_title = base_name.replace("Ersatzteilzeichnung", "").strip()
        assembly_slug = slugify(clean_title)
        image_relative = Path("boprob") / f"{assembly_slug}.png"
        image_path = ASSET_OUTPUT_DIR / image_relative

        render_page_to_png(pdf_path, 0, image_path)

        assemblies.append(
            {
                "id": f"boprob_{assembly_slug}",
                "title": clean_title,
                "imageAsset": image_relative.as_posix(),
                "items": items,
            }
        )

    return {
        "id": "boprob-iii",
        "machineName": "BOPROB III",
        "sectionTitle": "BOPROB III Ersatzteile",
        "sectionDescription": "Waehlen Sie Teile aus den Zeichnungen aus, legen Sie sie in den Warenkorb und senden Sie Ihre Anfrage.",
        "storageKey": "techbyp-spare-parts-boprob-iii",
        "productIds": [1006],
        "assemblies": assemblies,
    }


def parse_mp_catalog() -> dict[str, Any]:
    page_map = [
        {"page": 1, "title": "Uebersicht", "models": ["mp_1_90", "mp_2_60", "mp_3_90", "mp_4_100"]},
        {"page": 3, "title": "Tragegestell", "models": ["mp_1_90", "mp_2_60", "mp_3_90", "mp_4_100"]},
        {
            "page": 4,
            "title": "Turm",
            "models": ["mp_1_90", "mp_2_60", "mp_3_90", "mp_4_100"],
            "mergePages": [5],
        },
        {"page": 6, "title": "Fussplatte", "models": ["mp_1_90", "mp_2_60", "mp_3_90", "mp_4_100"]},
        {"page": 7, "title": "Sternmagazin", "models": ["mp_2_60", "mp_3_90"]},
        {"page": 8, "title": "Magazin MP-4.100", "models": ["mp_4_100"]},
        {"page": 9, "title": "Schlitten MP-3.90 und MP-4.100", "models": ["mp_3_90", "mp_4_100"]},
        {"page": 10, "title": "Schlitten MP-1.90 und MP-2.60", "models": ["mp_1_90", "mp_2_60"]},
        {
            "page": 11,
            "title": "Schlaeuche",
            "models": ["mp_1_90", "mp_2_60", "mp_3_90", "mp_4_100"],
            "imageAsset": "boprob/boprob.png",
        },
    ]

    reader = PdfReader(str(MP_PDF))
    assemblies: list[dict[str, Any]] = []

    for entry in page_map:
        page_number = int(entry["page"])
        page_index = page_number - 1

        if page_index < 0 or page_index >= len(reader.pages):
            continue

        title = str(entry["title"])
        models = list(entry["models"])
        merge_pages = [int(page) for page in entry.get("mergePages", [])]
        image_asset_override = entry.get("imageAsset")
        text = reader.pages[page_index].extract_text() or ""
        if page_number == 11:
            items = parse_mp_hose_rows(text)
        else:
            items = parse_spare_rows(text)

        if page_number == 3:
            page_three_fallback = [
                {
                    "pos": 6,
                    "articleNumber": "UP.106.00",
                    "name": "Verbindungsbolzen Hydraulikzylinder",
                    "defaultQty": 2,
                },
                {
                    "pos": 7,
                    "articleNumber": "Z-00059",
                    "name": "Zylinderschraube mit Innensechskant und Schaft",
                    "defaultQty": 12,
                },
            ]

            for fallback_item in page_three_fallback:
                exists = any(
                    item["pos"] == fallback_item["pos"]
                    and item["articleNumber"] == fallback_item["articleNumber"]
                    for item in items
                )
                if not exists:
                    items.append(fallback_item)

            items.sort(key=lambda item: (item["pos"], item["articleNumber"]))

        for merge_page in merge_pages:
            merge_index = merge_page - 1
            if merge_index < 0 or merge_index >= len(reader.pages):
                continue

            merge_text = reader.pages[merge_index].extract_text() or ""
            items.extend(parse_spare_rows(merge_text))

        if not items:
            continue

        if image_asset_override:
            image_relative = Path(str(image_asset_override))
        else:
            image_relative = Path("mp") / f"mp-page-{page_number:02d}.png"
            image_path = ASSET_OUTPUT_DIR / image_relative
            render_page_to_png(MP_PDF, page_index, image_path)

        assemblies.append(
            {
                "id": f"mp_page_{page_number:02d}",
                "title": title,
                "imageAsset": image_relative.as_posix(),
                "models": models,
                "items": items,
            }
        )

    return {
        "id": "mp-shared",
        "machineName": "MP",
        "sectionTitle": "MP Ersatzteile",
        "sectionDescription": "Waehlen Sie Teile aus den Zeichnungen aus, legen Sie sie in den Warenkorb und senden Sie Ihre Anfrage.",
        "storageKey": "techbyp-spare-parts-mp",
        "productIds": [1000, 1001, 1002, 1003],
        "modelByProductId": {
            "1000": "mp_1_90",
            "1001": "mp_2_60",
            "1002": "mp_3_90",
            "1003": "mp_4_100",
        },
        "assemblies": assemblies,
    }


def json_to_ts_literal(value: Any) -> str:
    dumped = json.dumps(value, ensure_ascii=True, indent=2)
    return dumped


def write_generated_ts(catalogs: list[dict[str, Any]]) -> None:
    lines: list[str] = []
    lines.append("import type { SparePartsCatalog } from './sparePartsCatalog';")
    lines.append("")
    lines.append("const RAW_GENERATED_SPARE_PARTS = ")
    lines.append(json_to_ts_literal(catalogs) + " as const;")
    lines.append("")
    lines.append("export const GENERATED_SPARE_PARTS_CATALOGS: SparePartsCatalog[] = RAW_GENERATED_SPARE_PARTS.map((catalog) => ({")
    lines.append("  ...catalog,")
    lines.append("  assemblies: catalog.assemblies.map((assembly) => ({")
    lines.append("    ...assembly,")
    lines.append("    imageUrl: new URL(`../assets/Technical/generated/spare-parts/${assembly.imageAsset}`, import.meta.url).href,")
    lines.append("  })),")
    lines.append("}));")
    lines.append("")

    DATA_OUTPUT_FILE.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    ASSET_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    boprob_catalog = parse_boprob_catalog()
    mp_catalog = parse_mp_catalog()

    catalogs = [boprob_catalog, mp_catalog]
    write_generated_ts(catalogs)

    summary = {
        "boprob_assemblies": len(boprob_catalog["assemblies"]),
        "mp_assemblies": len(mp_catalog["assemblies"]),
        "output_data_file": str(DATA_OUTPUT_FILE.relative_to(ROOT)),
        "output_asset_dir": str(ASSET_OUTPUT_DIR.relative_to(ROOT)),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
