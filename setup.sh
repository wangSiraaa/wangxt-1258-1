#!/bin/bash

echo "🚀 极端高温避暑安置系统启动脚本"
echo "=================================="

echo ""
echo "📦 1. 启动 PostgreSQL 数据库..."
docker compose up -d postgres

echo ""
echo "⏳ 等待数据库启动..."
sleep 5

echo ""
echo "🔧 2. 安装后端依赖..."
cd backend
npm install

echo ""
echo "🔧 3. 安装前端依赖..."
cd ../frontend
npm install

echo ""
echo "📚 4. 安装根目录依赖..."
cd ..
npm install

echo ""
echo "✅ 依赖安装完成！"
echo ""
echo "📖 启动命令："
echo "   - 启动数据库: docker compose up -d postgres"
echo "   - 启动后端: npm run dev:backend"
echo "   - 启动前端: npm run dev:frontend"
echo "   - 同时启动: npm run dev"
echo ""
echo "🌐 访问地址："
echo "   - 前端: http://localhost:3000"
echo "   - 后端: http://localhost:4000"
echo ""
