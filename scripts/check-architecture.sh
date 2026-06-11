#!/usr/bin/env bash
#
# check-architecture.sh - 验证架构边界约束
#
# 检查项：
# 1. src/api/ 不导入 React 或页面组件
# 2. src/components/ 不导入页面组件
# 3. src/pages/ 不直接使用 axios（应通过 src/api/）
# 4. src/auth/ 不导入 React
#
# Exit code 0 = 全部通过
# Exit code 1 = 存在违规

set -euo pipefail

VIOLATIONS=0

echo "=== 架构边界检查 ==="
echo ""

# Check 1: src/api/ 不得导入 React 或页面组件
echo "[1] 检查 src/api/ 无 React / 页面组件导入..."
API_FILES=$(find src/api -name '*.ts' -o -name '*.tsx' 2>/dev/null || true)
if [ -n "$API_FILES" ]; then
  while IFS= read -r file; do
    if grep -qE "import.*from\s+['\"]react['\"]" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 导入了 React"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
    if grep -qE "import.*from\s+['\"]\.\./pages/|import.*from\s+['\"]\.\./\.\./pages/" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 导入了页面组件"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
    if grep -qE "import.*from\s+['\"]\.\./components/|import.*from\s+['\"]\.\./\.\./components/" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 导入了组件（API 层不应依赖组件）"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done <<< "$API_FILES"
fi
echo "  PASS: src/api/ 架构边界正常"
echo ""

# Check 2: src/components/ 不得导入页面组件
echo "[2] 检查 src/components/ 无页面组件导入..."
COMP_FILES=$(find src/components -name '*.ts' -o -name '*.tsx' 2>/dev/null || true)
if [ -n "$COMP_FILES" ]; then
  while IFS= read -r file; do
    if grep -qE "import.*from\s+['\"]\.\./pages/|import.*from\s+['\"]\.\./\.\./pages/" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 导入了页面组件"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done <<< "$COMP_FILES"
fi
echo "  PASS: src/components/ 架构边界正常"
echo ""

# Check 3: src/pages/ 不直接导入 axios
echo "[3] 检查 src/pages/ 不直接使用 axios..."
PAGE_FILES=$(find src/pages -name '*.ts' -o -name '*.tsx' 2>/dev/null || true)
if [ -n "$PAGE_FILES" ]; then
  while IFS= read -r file; do
    if grep -qE "import\s+axios\b" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 直接导入了 axios（应通过 src/api/）"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done <<< "$PAGE_FILES"
fi
echo "  PASS: src/pages/ 无直接 axios 导入"
echo ""

# Check 4: src/auth/ 不导入 React
echo "[4] 检查 src/auth/ 无 React 依赖..."
AUTH_FILES=$(find src/auth -name '*.ts' -o -name '*.tsx' 2>/dev/null || true)
if [ -n "$AUTH_FILES" ]; then
  while IFS= read -r file; do
    if grep -qE "import.*from\s+['\"]react['\"]" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 导入了 React（auth 层应为纯工具函数）"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done <<< "$AUTH_FILES"
fi
echo "  PASS: src/auth/ 架构边界正常"
echo ""

# Check 5: src/monitor/ 不依赖项目其他模块（自包含）
echo "[5] 检查 src/monitor/ 自包含..."
MONITOR_FILES=$(find src/monitor -name '*.ts' -o -name '*.tsx' 2>/dev/null || true)
if [ -n "$MONITOR_FILES" ]; then
  while IFS= read -r file; do
    if grep -qE "import.*from\s+['\"]\.\./api/|import.*from\s+['\"]\.\./pages/|import.*from\s+['\"]\.\./components/" "$file" 2>/dev/null; then
      echo "  VIOLATION: $file 导入了项目其他模块（monitor 应自包含）"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done <<< "$MONITOR_FILES"
fi
echo "  PASS: src/monitor/ 架构边界正常"
echo ""

# Summary
echo "=== 总结 ==="
if [ "$VIOLATIONS" -gt 0 ]; then
  echo "FAIL: 发现 $VIOLATIONS 个架构边界违规"
  exit 1
else
  echo "PASS: 所有架构边界检查通过"
  exit 0
fi
