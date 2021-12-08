# Install dependencies only when needed
FROM node:14-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:14-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# Production image, copy all the files and run next
FROM node:14-alpine AS runner
RUN apk add --no-cache curl openssl

# kubectl
# RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
# RUN mv kubectl /usr/bin/kubectl && chmod +x /usr/bin/kubectl

#helm
ENV HELM_VER="3.7.1"
RUN curl -LO "https://get.helm.sh/helm-v${HELM_VER}-linux-amd64.tar.gz"
RUN tar -xvf "helm-v${HELM_VER}-linux-amd64.tar.gz" 
RUN mv linux-amd64/helm /usr/bin/helm && \
  chmod +x /usr/bin/helm && \
  rm -rf linux-amd64 && \
  rm "helm-v${HELM_VER}-linux-amd64.tar.gz"

# mongo cli
# RUN curl https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian10-4.4.10.tgz -S --output mdb.tgz
# RUN tar -xvf mdb.tgz 
# RUN mv mongodb-linux-x86_64-debian10-4.4.10/bin/mongo /usr/bin/mongo && \
#   chmod +x /usr/bin/mongo && \
#   rm -rf mongodb-linux-x86_64-debian10-4.4.10 && \
#   rm "mdb.tgz"

WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]