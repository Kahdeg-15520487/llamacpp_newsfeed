#!/usr/bin/env bash
# Rebuild the mdBook site: copy reports and regenerate SUMMARY.md
set -euo pipefail

BOOK_SRC="book/src"
OUTPUT_DIR="output"
SUMMARY="$BOOK_SRC/SUMMARY.md"

# Copy all reports from output/ to book/src/
echo "📋 Copying reports..."
cp "$OUTPUT_DIR"/*.md "$BOOK_SRC/" 2>/dev/null || echo "   (no reports to copy)"

# Regenerate SUMMARY.md
echo "📝 Regenerating SUMMARY.md..."
cat > "$SUMMARY" << 'HEADER'
# Llama.cpp Daily News

[Run Command Reference](./run-commands.md)

---

## Reports

HEADER

# List reports in reverse chronological order
for f in $(ls -1r "$BOOK_SRC"/*-llama-cpp-news.md 2>/dev/null); do
  name=$(basename "$f")
  date=$(echo "$name" | cut -d'-' -f1-3)
  echo "- [$date](./$name)" >> "$SUMMARY"
done

echo "✅ Book rebuilt: $(ls "$BOOK_SRC"/*.md 2>/dev/null | wc -l) pages"
