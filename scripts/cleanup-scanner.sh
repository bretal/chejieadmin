#!/usr/bin/env bash
# cleanup-scanner.sh -- 检查项目中的临时、过时或不一致工件
#
# 检查项：
# 1. 未使用的依赖（package.json 中声明但未在 src/ 中导入的）
# 2. 遗留的 TODO/FIXME 注释
# 3. 调试文件（.log, .tmp）
# 4. 空目录
# 5. dist/ 目录大小
#
# 用法: bash scripts/cleanup-scanner.sh
set -euo pipefail

echo "=== 清理扫描器 ==="
echo ""

ISSUE_COUNT=0

# ---- Check 1: 遗留 TODO/FIXME ----

echo "[1] 扫描遗留 TODO/FIXME 注释..."
TODO_COUNT=$(grep -rn "TODO\|FIXME" src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ' || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
  echo "  FOUND: $TODO_COUNT 个 TODO/FIXME"
  grep -rn "TODO\|FIXME" src/ --include='*.ts' --include='*.tsx' 2>/dev/null | head -20
  ISSUE_COUNT=$((ISSUE_COUNT + 1))
else
  echo "  OK: 无遗留 TODO/FIXME"
fi
echo ""

# ---- Check 2: 调试/临时文件 ----

echo "[2] 扫描临时/调试文件..."
DEBUG_FILES=$(find . -maxdepth 3 -name '*.log' -o -name '*.tmp' -o -name '*.bak' 2>/dev/null | grep -v node_modules | grep -v '.git/' || true)
if [ -n "$DEBUG_FILES" ]; then
  echo "  FOUND:"
  echo "$DEBUG_FILES" | while read -r f; do echo "    $f"; done
  ISSUE_COUNT=$((ISSUE_COUNT + 1))
else
  echo "  OK: 无临时/调试文件"
fi
echo ""

# ---- Check 3: 未使用的 npm 依赖 ----

echo "[3] 检查可能未使用的依赖..."
# 检查 package.json 中的 dependencies 是否在源码中被引用
if [ -f "package.json" ]; then
  UNUSED_DEPS=""
  for dep in $(node -e "const p=require('./package.json'); Object.keys(p.dependencies).forEach(d=>console.log(d))" 2>/dev/null || echo ""); do
    if [ -n "$dep" ]; then
      # 在 src/ 中搜索 import 语句
      IMPORT_COUNT=$(grep -r "from\s\+['\"].*$dep" src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ' || echo "0")
      if [ "$IMPORT_COUNT" -eq 0 ]; then
        # react 和 react-dom 在 tsx 中通过 JSX 隐式使用，不检查
        if [ "$dep" != "react" ] && [ "$dep" != "react-dom" ]; then
          UNUSED_DEPS="$UNUSED_DEPS $dep"
          echo "  WARNING: $dep 未在 src/ 中找到 import（可能通过间接方式使用）"
        fi
      fi
    fi
  done
  if [ -z "$UNUSED_DEPS" ]; then
    echo "  OK: 所有依赖在源码中有引用"
  else
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
  fi
fi
echo ""

# ---- Check 4: dist/ 目录 ----

echo "[4] 检查 dist/ 目录..."
if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist 2>/dev/null | awk '{print $1}' || echo "unknown")
  DIST_FILES=$(find dist -type f 2>/dev/null | wc -l | tr -d ' ' || echo "0")
  echo "  INFO: dist/ 大小 $DIST_SIZE, $DIST_FILES 个文件"
  echo "  OK: dist/ 存在（构建产物正常）"
else
  echo "  OK: dist/ 不存在（未构建或已清理）"
fi
echo ""

# ---- Check 5: 空目录 ----

echo "[5] 扫描空目录..."
EMPTY_DIRS=$(find src -type d -empty 2>/dev/null || true)
if [ -n "$EMPTY_DIRS" ]; then
  echo "  FOUND:"
  echo "$EMPTY_DIRS" | while read -r d; do echo "    $d"; done
  ISSUE_COUNT=$((ISSUE_COUNT + 1))
else
  echo "  OK: 无空目录"
fi
echo ""

# ---- Summary ----

echo "=== 扫描完成 ==="
if [ "$ISSUE_COUNT" -eq 0 ]; then
  echo "结果: CLEAN (0 个问题)"
else
  echo "结果: 发现 $ISSUE_COUNT 类问题"
  echo ""
  echo "建议操作:"
  echo "  1. 检查并清理 TODO/FIXME 注释"
  echo "  2. 删除临时文件 (.log, .tmp, .bak)"
  echo "  3. 运行 npm prune 清理未使用的依赖"
fi
