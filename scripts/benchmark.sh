#!/usr/bin/env bash
# benchmark.sh -- 车界管理后台 性能基准测试
#
# 测量：构建时间、类型检查时间、打包体积、lint 时间
# 用法: bash scripts/benchmark.sh
set -euo pipefail

echo "=== 车界管理后台 性能基准测试 ==="
echo ""

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TASKS=4

# ---- Task 1: TypeScript 类型检查 ----

echo "[1/4] TypeScript 类型检查耗时"
TSC_START=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
npx tsc -b 2>/dev/null
TSC_RESULT=$?
TSC_END=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
TSC_MS=$((TSC_END - TSC_START))

if [ "$TSC_RESULT" -eq 0 ]; then
  echo "  PASS: 类型检查完成 (${TSC_MS}ms)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL: 类型检查失败"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# ---- Task 2: 生产构建 ----

echo "[2/4] 生产构建耗时与体积"
BUILD_START=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
npm run build 2>/dev/null
BUILD_RESULT=$?
BUILD_END=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
BUILD_MS=$((BUILD_END - BUILD_START))

if [ "$BUILD_RESULT" -eq 0 ] && [ -d "dist" ]; then
  # 测量构建产物大小
  JS_SIZE=$(find dist/assets -name '*.js' ! -name '*.map' -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
  CSS_SIZE=$(find dist/assets -name '*.css' ! -name '*.map' -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
  TOTAL_SIZE=$((JS_SIZE + CSS_SIZE))
  JS_KB=$((JS_SIZE / 1024))
  CSS_KB=$((CSS_SIZE / 1024))
  TOTAL_KB=$((TOTAL_SIZE / 1024))
  echo "  PASS: 构建完成 (${BUILD_MS}ms)"
  echo "  JS: ${JS_KB}KB, CSS: ${CSS_KB}KB, 总计: ${TOTAL_KB}KB"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL: 构建失败"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# ---- Task 3: ESLint 检查 ----

echo "[3/4] ESLint 检查耗时"
LINT_START=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
npm run lint 2>/dev/null
LINT_RESULT=$?
LINT_END=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
LINT_MS=$((LINT_END - LINT_START))

if [ "$LINT_RESULT" -eq 0 ]; then
  echo "  PASS: ESLint 零警告 (${LINT_MS}ms)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL: ESLint 存在警告或错误"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# ---- Task 4: 架构边界检查 ----

echo "[4/4] 架构边界检查"
ARCH_START=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
bash scripts/check-architecture.sh 2>/dev/null
ARCH_RESULT=$?
ARCH_END=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s)
ARCH_MS=$((ARCH_END - ARCH_START))

if [ "$ARCH_RESULT" -eq 0 ]; then
  echo "  PASS: 架构边界零违规 (${ARCH_MS}ms)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL: 存在架构边界违规"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# ---- Summary ----

echo "=== 基准测试结果 ==="
echo "TypeScript 类型检查: ${TSC_MS}ms"
echo "Vite 生产构建:      ${BUILD_MS}ms"
echo "ESLint:             ${LINT_MS}ms"
echo "架构边界检查:        ${ARCH_MS}ms"
echo ""
echo "=== 总结: $PASS_COUNT/$TOTAL_TASKS 项通过 ==="

if [ "$PASS_COUNT" -eq "$TOTAL_TASKS" ]; then
  echo "所有基准测试通过"
  exit 0
else
  echo "部分基准测试失败 ($FAIL_COUNT 项)"
  exit 1
fi
