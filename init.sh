#!/usr/bin/env bash
# init.sh -- 验证项目可干净构建。克隆后或恢复工作时运行。
set -euo pipefail

echo "=== 车界管理后台 初始化 ==="
echo ""

echo "[1/4] 安装依赖..."
npm install
echo ""

echo "[2/4] TypeScript 类型检查..."
npx tsc -b
echo ""

echo "[3/4] 生产构建..."
npm run build
echo ""

echo "[4/4] 验证 Harness 文件..."
FILES_OK=true
for file in AGENTS.md CLAUDE.md feature_list.json clean-state-checklist.md session-handoff.md; do
  if [ ! -f "$file" ]; then
    echo "  MISSING: $file"
    FILES_OK=false
  else
    echo "  OK: $file"
  fi
done

for doc in docs/ARCHITECTURE.md docs/PRODUCT.md docs/STYLE_GUIDE.md; do
  if [ ! -f "$doc" ]; then
    echo "  MISSING: $doc"
    FILES_OK=false
  else
    echo "  OK: $doc"
  fi
done

for script in scripts/check-architecture.sh scripts/check-style.sh; do
  if [ ! -f "$script" ]; then
    echo "  MISSING: $script"
    FILES_OK=false
  else
    echo "  OK: $script"
  fi
done
echo ""

if [ "$FILES_OK" = true ]; then
  echo "=== 初始化完成，所有检查通过。 ==="
  echo "运行 'npm run dev' 启动开发服务器 (port 3000)。"
  echo "运行 'npm run build' 执行生产构建。"
  echo "运行 'npm run lint' 执行 ESLint 检查。"
else
  echo "=== 初始化完成，但部分 harness 文件缺失（非致命，后续阶段会补齐）。 ==="
fi
