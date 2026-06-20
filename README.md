# 极端高温避暑安置协同系统

一个集**街道点位管理**、**社区人员登记**、**仓库物资调拨**于一体的综合管理平台，实现极端高温天气下的避暑安置全流程协同。

## ✨ 功能特性

### 🏢 街道端 - 点位管理
- 发布和管理避暑安置点位
- 实时监控点位容量和在站人数
- 点位状态自动更新（开放/满员/关闭）

### 👥 社区端 - 人员登记
- 重点人群档案管理（老人、孕妇、慢性病患者等）
- 优先级分类（高/中/低）
- 进站/出站登记，自动关联点位容量

### 📦 仓库端 - 物资管理
- 饮用水、药品等物资库存管理
- 安全库存预警，低于阈值自动告警
- 物资调拨单管理（出库→运输→送达）

### 🔔 智能提醒
- **容量限制**: 点位满员后禁止继续登记
- **离站未确认**: 出站时未确认安全到家自动生成回访任务
- **库存预警**: 物资低于安全线自动生成补货单
- **定时巡检**: 每30分钟检查未确认离站记录，每小时检查库存

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端 (Next.js 14)                    │
│  ┌─────────┬──────────┬──────────┬──────────┬─────────┐  │
│  │ 仪表盘 │ 点位管理 │ 人员管理 │ 登记管理 │ 物资管理 │  │
│  └─────────┴──────────┴──────────┴──────────┴─────────┘  │
│                     Mantine v7 UI                         │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTP API
┌─────────────────────────────▼─────────────────────────────┐
│                     后端 (NestJS 10)                      │
│  ┌──────────┬──────────┬────────────┬─────────────────┐  │
│  │ Location │  Person  │ CheckIn    │ Material        │  │
│  │ Module   │  Module  │ Module     │ Module          │  │
│  ├──────────┼──────────┼────────────┼─────────────────┤  │
│  │ Allocation │ FollowUp │ Replenishment │ Tasks     │  │
│  │ Module     │ Module   │ Module        │ Scheduler │  │
│  └──────────┴──────────┴────────────┴─────────────────┘  │
│                     TypeORM / PostgreSQL                  │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                   PostgreSQL 数据库                       │
│  locations, people, check_in_records, materials,         │
│  allocations, follow_ups, replenishments                  │
└───────────────────────────────────────────────────────────┘
```

## 📦 数据库模型

### 核心数据表

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| `locations` | 避暑点位 | 名称、地址、街道、社区、容量、当前人数、状态 |
| `people` | 重点人群 | 姓名、身份证、电话、社区、优先级、健康状况 |
| `check_in_records` | 登记记录 | 人员ID、点位ID、进站时间、出站时间、状态 |
| `materials` | 物资库存 | 名称、分类、数量、安全库存、低库存告警 |
| `allocations` | 物资调拨 | 物资ID、出库地、入库地、数量、状态 |
| `follow_ups` | 回访记录 | 人员ID、状态、回访时间、是否需进一步协助 |
| `replenishments` | 补货单 | 物资ID、申请数量、状态、是否自动生成 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14 或 Docker
- npm >= 9

### 方式一：快速启动脚本

```bash
chmod +x setup.sh
./setup.sh
```

### 方式二：手动启动

**1. 启动数据库**
```bash
# 使用 Docker
docker compose up -d postgres

# 或使用本地 PostgreSQL，创建数据库
createdb heat_relief
```

**2. 配置环境变量**
```bash
cp .env.example .env
# 修改 .env 中的数据库配置
```

**3. 安装依赖**
```bash
# 安装所有依赖
npm install

# 或分别安装
cd backend && npm install
cd ../frontend && npm install
```

**4. 启动服务**
```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend    # 后端: http://localhost:4000
npm run dev:frontend   # 前端: http://localhost:3000
```

### 初始化测试数据

系统启动后，可以通过 API 接口创建测试数据：

```bash
# 创建点位
curl -X POST http://localhost:4000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"社区服务中心","address":"XX路123号","street":"XX街道","community":"XX社区","capacity":50}'

# 创建重点人群
curl -X POST http://localhost:4000/api/people \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","idCard":"110101199001011234","phone":"13800138000","address":"XX小区1号楼","community":"XX社区","priority":"high"}'

# 创建物资
curl -X POST http://localhost:4000/api/materials \
  -H "Content-Type: application/json" \
  -d '{"name":"瓶装矿泉水","category":"drinking_water","unit":"箱","quantity":100,"safetyStock":30}'
```

## 📡 API 接口

### 点位管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/locations` | 获取点位列表 |
| POST | `/api/locations` | 创建点位 |
| GET | `/api/locations/:id` | 获取点位详情 |
| PATCH | `/api/locations/:id` | 更新点位 |
| GET | `/api/locations/:id/capacity` | 检查容量 |
| GET | `/api/locations/statistics` | 点位统计 |

### 人员管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/people` | 获取人员列表 |
| POST | `/api/people` | 添加人员 |
| GET | `/api/people/high-priority` | 获取高优先级人员 |
| GET | `/api/people/statistics` | 人员统计 |

### 登记管理
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/check-ins` | 进站登记 |
| POST | `/api/check-ins/check-out` | 出站登记 |
| GET | `/api/check-ins` | 获取登记记录 |
| GET | `/api/check-ins/unconfirmed` | 获取未确认离站 |
| GET | `/api/check-ins/location/:id` | 获取点位当前在站人员 |
| GET | `/api/check-ins/statistics` | 登记统计 |

### 物资管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/materials` | 获取物资列表 |
| POST | `/api/materials` | 添加物资 |
| PATCH | `/api/materials/:id/quantity` | 更新库存 |
| GET | `/api/materials/low-stock` | 获取低库存物资 |
| GET | `/api/materials/check-replenishments` | 检查并生成补货单 |

### 物资调拨
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/allocations` | 获取调拨列表 |
| POST | `/api/allocations` | 创建调拨单 |
| PATCH | `/api/allocations/:id/confirm-delivery` | 确认收货 |

### 回访管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/follow-ups` | 获取回访列表 |
| POST | `/api/follow-ups` | 创建回访任务 |
| PATCH | `/api/follow-ups/:id` | 更新回访结果 |
| GET | `/api/follow-ups/pending` | 获取待回访 |

### 补货单
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/replenishments` | 获取补货单列表 |
| POST | `/api/replenishments` | 创建补货单 |
| PATCH | `/api/replenishments/:id` | 更新状态 |
| DELETE | `/api/replenishments/:id/cancel` | 取消补货单 |

## 🔧 业务规则引擎

### 1. 点位容量控制
```typescript
// 登记进站时自动检查
if (newOccupancy > location.capacity) {
  throw new BadRequestException('点位容量已满，无法继续登记');
}

// 自动更新点位状态
location.status = newOccupancy >= location.capacity ? FULL : OPEN;
```

### 2. 离站未确认提醒
```typescript
// 出站时未确认安全到家
if (!confirmed) {
  record.status = LEFT_UNCONFIRMED;
  // 自动生成回访任务
  await followUpService.createFromCheckIn(record);
}

// 定时任务每30分钟检查未确认记录
@Cron(EVERY_30_MINUTES)
async checkUnconfirmedCheckOuts() { ... }
```

### 3. 库存自动补货
```typescript
// 库存更新时检查
material.lowStockAlert = material.quantity <= material.safetyStock;

// 低于安全线自动生成补货单
if (material.lowStockAlert) {
  await replenishmentService.autoGenerateIfNeeded(material);
}

// 定时任务每小时检查
@Cron(EVERY_HOUR)
async checkMaterialStock() { ... }
```

## 📁 项目结构

```
.
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── entities/          # 数据库实体
│   │   ├── location/          # 点位模块
│   │   ├── person/            # 人员模块
│   │   ├── checkin/           # 登记模块
│   │   ├── material/          # 物资模块
│   │   ├── allocation/        # 调拨模块
│   │   ├── follow-up/         # 回访模块
│   │   ├── replenishment/     # 补货单模块
│   │   ├── tasks/             # 定时任务
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/                   # Next.js 前端
│   ├── app/                   # App Router 页面
│   │   ├── page.tsx           # 仪表盘
│   │   ├── locations/         # 点位管理
│   │   ├── people/            # 人员管理
│   │   ├── checkin/           # 登记管理
│   │   ├── materials/         # 物资管理
│   │   ├── allocations/       # 调拨管理
│   │   ├── followups/         # 回访管理
│   │   └── replenishments/    # 补货单
│   ├── components/            # 通用组件
│   ├── lib/                   # 工具函数
│   ├── types/                 # 类型定义
│   └── package.json
├── docker-compose.yml         # PostgreSQL 服务
├── setup.sh                   # 一键启动脚本
└── README.md
```

## 🎯 核心业务流程

### 人员进站流程
1. 社区工作人员在系统中选择重点人员
2. 选择可容纳的点位（系统自动过滤满员点位）
3. 确认进站，系统自动：
   - 增加点位当前人数
   - 更新人员在站状态
   - 如人数达到容量上限，自动标记点位为满员

### 人员出站流程
1. 选择在站人员进行出站登记
2. 确认是否安全到家：
   - **已确认**: 正常完成出站流程
   - **未确认**: 标记为"离站未确认"，自动生成回访任务
3. 系统自动：
   - 减少点位当前人数
   - 更新人员在站状态
   - 如点位从满员变为有空位，自动恢复开放状态

### 物资调拨流程
1. 仓库创建调拨单，选择物资和目的地点位
2. 确认出库，物资从仓库库存扣除
3. 运输途中，状态更新为"运输中"
4. 点位确认收货，调拨完成

### 库存预警流程
1. 物资库存低于安全线时，自动标记为"低库存"
2. 系统自动生成补货单（如无待处理补货单）
3. 管理人员审批补货单
4. 下单采购，确认收货后库存自动增加

## 🛡️ 安全特性

- 输入参数自动校验（class-validator）
- 库存操作使用乐观锁防止超卖
- 数据库事务保证数据一致性
- CORS 跨域保护
- SQL 注入防护（TypeORM 参数化查询）

## 📝 开发说明

### 添加新模块
```bash
# 后端
cd backend
nest generate module [module-name]
nest generate service [module-name]
nest generate controller [module-name]
```

### 数据库迁移
开发环境使用 `synchronize: true` 自动同步表结构，生产环境建议使用 TypeORM migrations。

## 📄 License

MIT License
