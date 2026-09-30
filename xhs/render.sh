#!/usr/bin/env bash
# 渲染小红书配图：生成 6 页 HTML → headless Chrome 截图 → 裁成 1080x1440
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -x "$CHROME" ] || CHROME="/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"

node xhs/build-cards.mjs
mkdir -p xhs/raw xhs/final

# window-size 比视口各多 18x96（Chrome 边框+滚动条占位），裁掉后正好 1080x1440
for n in 1 2 3 4 5 6; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size=1098,1536 --force-device-scale-factor=1 --virtual-time-budget=18000 \
    --screenshot="D:/project/silver-lines/xhs/raw/c$n.png" \
    "file:///D:/project/silver-lines/xhs/out/card-$n.html" >/dev/null 2>&1
done

python - <<'EOF'
from PIL import Image
for n in range(1, 7):
    Image.open(f'xhs/raw/c{n}.png').convert('RGB').crop((0, 0, 1080, 1440)) \
         .save(f'xhs/final/{n}.png', optimize=True)
print('已输出 xhs/final/1.png … 6.png（1080x1440）')
EOF
