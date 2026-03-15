# 构建阶段
FROM node:20-alpine AS builder

# 设置 Alpine 阿里云镜像源
RUN sed -i 's|https://dl-cdn.alpinelinux.org/alpine|http://mirrors.aliyun.com/alpine|g' /etc/apk/repositories

# 设置工作目录
WORKDIR /app

# 配置 npm 使用淘宝镜像源（npmmirror）
# RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 运行阶段 - 使用 Nginx Alpine
FROM nginx:alpine

# 设置 Alpine 阿里云镜像源并安装 tzdata
RUN sed -i 's|https://dl-cdn.alpinelinux.org/alpine|http://mirrors.aliyun.com/alpine|g' /etc/apk/repositories && \
    apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制打包文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
