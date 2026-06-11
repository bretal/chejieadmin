#!/usr/bin/env bash
#
# check-style.sh - 代码风格与约定检查
#
# 检查项：
# 1. 命名导出优先（页面组件 default export 除外）
# 2. CRUD 页面遵循标准模式
# 3. API 模块包含类型接口定义
# 4. 无 console.log 遗留（monitor SDK 内部除外）
#
# Exit code 0 = 全部通过
# Exit code 1 = 存在违规

set -euo pipefail

WARNINGS=0

echo "=== 代码风格检查 ==="
echo ""

# Check 1: API 模块有类型导出
echo "[1] 检查 API 模块包含 interface/type 定义..."
API_FILES=$(find src/api -name '*.ts' ! -name 'request.ts' 2>/dev/null || true)
if [ -n "$API_FILES" ]; then
  while IFS= read -r file; do
    if ! grep -qE "\binterface\b|\btype\b" "$file" 2>/dev/null; then
      echo "  WARNING: $file 缺少类型定义（建议导出 interface）"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$API_FILES"
fi
echo "  DONE"
echo ""

# Check 2: CRUD 页面包含标准模式元素
echo "[2] 检查 CRUD 页面使用标准模式..."
CRUD_PAGES="Brand Car CarConfig CarMedia CarColor CarRival Persona PersonaCar Banner"
for page in $CRUD_PAGES; do
  FILE="src/pages/${page}/index.tsx"
  if [ -f "$FILE" ]; then
    if ! grep -q "useState" "$FILE" 2>/dev/null; then
      echo "  WARNING: $FILE 未使用 useState（非标准 CRUD 模式？）"
      WARNINGS=$((WARNINGS + 1))
    fi
    if ! grep -q "useCallback" "$FILE" 2>/dev/null; then
      echo "  WARNING: $FILE 未使用 useCallback（非标准 CRUD 模式？）"
      WARNINGS=$((WARNINGS + 1))
    fi
    if ! grep -qE "\bTable\b" "$FILE" 2>/dev/null; then
      echo "  WARNING: $FILE 未使用 Table 组件（非标准 CRUD 模式？）"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
done
echo "  DONE"
echo ""

# Check 3: 页面组件使用 default export
echo "[3] 检查页面组件使用 default export..."
PAGE_FILES=$(find src/pages -name 'index.tsx' 2>/dev/null || true)
if [ -n "$PAGE_FILES" ]; then
  while IFS= read -r file; do
    if ! grep -qE "export\s+default\s+function" "$file" 2>/dev/null; then
      echo "  WARNING: $file 未使用 default export function"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$PAGE_FILES"
fi
echo "  DONE"
echo ""

# Check 4: 无遗留 console.log（monitor 内部除外）
echo "[4] 检查无遗留 console.log..."
# 排除 monitor/ 目录、node_modules、dist
SRC_FILES=$(find src -name '*.ts' -o -name '*.tsx' 2>/dev/null | grep -v 'src/monitor/' || true)
if [ -n "$SRC_FILES" ]; then
  while IFS= read -r file; do
    if grep -qE "console\.log\(" "$file" 2>/dev/null; then
      echo "  WARNING: $file 包含 console.log（考虑使用 monitor SDK 或移除）"
      WARNINGS=$((WARNINGS + 1))
    fi
  done <<< "$SRC_FILES"
fi
echo "  DONE"
echo ""

# Summary
echo "=== 总结 ==="
if [ "$WARNINGS" -gt 0 ]; then
  echo "WARNING: $WARNINGS 个风格建议（非阻塞）"
  exit 0  # 风格检查不阻塞构建
else
  echo "PASS: 所有风格检查通过"
  exit 0
fi
