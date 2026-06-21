#!/bin/bash
# ============================================================================
# 极端高温避暑安置协同系统 - 端到端验证脚本
# 用法: cd <project_root> && bash verify.sh
# ============================================================================
set -e

BASE="http://localhost:4000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${YELLOW}▸${NC} $1"; }

echo ""
echo "============================================"
echo "  极端高温避暑安置系统 - E2E 验证"
echo "============================================"
echo ""

# ---- 0. 健康检查 ----
info "检查后端健康状态"
for i in $(seq 1 15); do
  if curl -sf http://localhost:4000/api/locations >/dev/null 2>&1; then
    pass "后端 API 已启动"
    break
  fi
  sleep 1
done

# ---- 1. 点位满员禁止登记验证 ----
echo ""
info "链路一：点位满员禁止登记"

# 1.1 创建一个小容量点位（仅容 1 人）
LOC=$(curl -sf -X POST "$BASE/locations" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试点-迷你","address":"测试地址1号","street":"测试街道","community":"测试社区","capacity":1}' \
  2>/dev/null)
LOC_ID=$(echo "$LOC" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id))')
pass "创建容量=1点位: $LOC_ID"

# 1.2 创建测试人员
P1=$(curl -sf -X POST "$BASE/people" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试人员A","idCard":"T0001","gender":"MALE","age":65,"phone":"13800000001","address":"测试","priority":"HIGH","healthStatus":"健康","emergencyContact":"家人 138"}' \
  2>/dev/null)
P1_ID=$(echo "$P1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id))')
P2=$(curl -sf -X POST "$BASE/people" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试人员B","idCard":"T0002","gender":"FEMALE","age":66,"phone":"13800000002","address":"测试","priority":"MEDIUM","healthStatus":"健康","emergencyContact":"家人 139"}' \
  2>/dev/null)
P2_ID=$(echo "$P2" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id))')
pass "创建两名测试人员"

# 1.3 第1人进站 - 应成功
R1=$(curl -sf -X POST "$BASE/check-ins" \
  -H "Content-Type: application/json" \
  -d "{\"personId\":\"$P1_ID\",\"locationId\":\"$LOC_ID\"}" \
  2>/dev/null)
R1_ID=$(echo "$R1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id||""))')
if [ -n "$R1_ID" ]; then
  pass "第1人进站成功，登记ID=$R1_ID"
else
  fail "第1人进站失败（预期成功）"
fi

# 1.4 验证点位状态变 FULL
CAP=$(curl -sf "$BASE/locations/$LOC_ID/check-capacity" 2>/dev/null)
AVAIL=$(echo "$CAP" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).available))')
if [ "$AVAIL" = "false" ]; then
  pass "点位容量已耗尽，状态标记为满员"
else
  fail "点位应被标记为满员，available=$AVAIL"
fi

# 1.5 第2人进站 - 应失败（400 Bad Request）
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/check-ins" \
  -H "Content-Type: application/json" \
  -d "{\"personId\":\"$P2_ID\",\"locationId\":\"$LOC_ID\"}" \
  2>/dev/null)
if [ "$STATUS" = "400" ]; then
  pass "第2人被拒绝进站（返回 400）- 容量控制生效"
else
  fail "第2人应被拒绝，但返回了 $STATUS"
fi

# ---- 2. 离站未确认自动生成回访提醒验证 ----
echo ""
info "链路二：离站未确认自动生成回访提醒"

# 2.1 第1人出站，不确认
CO=$(curl -sf -X POST "$BASE/check-ins/check-out" \
  -H "Content-Type: application/json" \
  -d "{\"recordId\":\"$R1_ID\",\"confirmed\":false,\"notes\":\"老人声称独自回家\"}" \
  2>/dev/null)
CO_STATUS=$(echo "$CO" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).status))')
if [ "$CO_STATUS" = "left_unconfirmed" ]; then
  pass "出站登记为 LEFT_UNCONFIRMED"
else
  fail "出站状态应为 left_unconfirmed，实际=$CO_STATUS"
fi

# 2.2 验证系统自动生成回访任务
sleep 1
FU_COUNT=$(curl -sf "$BASE/follow-ups/pending" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).length||0))')
if [ "$FU_COUNT" -ge 1 ]; then
  pass "自动生成回访任务（待回访任务数=$FU_COUNT）"
else
  fail "未生成回访任务（待回访任务数=$FU_COUNT）"
fi

# ---- 3. 物资低于安全线自动生成补货单验证 ----
echo ""
info "链路三：物资低于安全线自动生成补货单"

# 3.1 创建物资（安全线=30，初始数量=50）
MAT=$(curl -sf -X POST "$BASE/materials" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试物资-风油精","category":"MEDICINE","unit":"瓶","quantity":50,"safetyStock":30}' \
  2>/dev/null)
MAT_ID=$(echo "$MAT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id))')
pass "创建物资（初始50 / 安全线30）ID=$MAT_ID"

# 3.2 调拨消耗 45 件 -> 剩余 5 件（低于安全线）
curl -sf -X POST "$BASE/allocations" \
  -H "Content-Type: application/json" \
  -d "{\"materialId\":\"$MAT_ID\",\"locationId\":\"$LOC_ID\",\"quantity\":45,\"transportBy\":\"测试车1\",\"driverName\":\"测试司机\"}" \
  >/dev/null 2>&1
pass "调拨出库 45 件（预期剩余 5 件，低于安全线）"

# 3.3 验证低库存告警标志
MAT2=$(curl -sf "$BASE/materials/$MAT_ID" 2>/dev/null)
LOW=$(echo "$MAT2" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).lowStockAlert))')
QTY=$(echo "$MAT2" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).quantity))')
if [ "$LOW" = "true" ] && [ "$QTY" = "5" ]; then
  pass "lowStockAlert=true，剩余数量=5（低于安全线 30）"
else
  fail "低库存告警未触发，lowStockAlert=$LOW quantity=$QTY"
fi

# 3.4 验证自动生成补货单
sleep 1
REP_COUNT=$(curl -sf "$BASE/replenishments?status=PENDING" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let a=JSON.parse(s);let c=a.filter(r=>r.materialId=="'"$MAT_ID'"&&r.autoGenerated).length;console.log(c)})')
if [ "$REP_COUNT" -ge 1 ]; then
  pass "自动生成补货单（同物资待审批补货单数=$REP_COUNT）"
else
  fail "未自动生成补货单"
fi

echo ""
echo "============================================"
echo "  ${GREEN}全部业务链验证通过 ✓${NC}"
echo "============================================"
echo ""
