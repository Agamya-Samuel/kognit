# Build stage
FROM node:18.17.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages ./packages
COPY apps/web-student/package*.json ./apps/web-student/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/web-student ./apps/web-student
COPY packages ./packages

# Build the application
RUN npm run build --filter=web-student

# Production stage
FROM node:18.17.0-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/apps/web-student/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/web-student/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/apps/web-student/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "run", "start"]
