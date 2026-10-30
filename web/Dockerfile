# Production image of the web app. Local development doesn't need it, see AGENTS.md.
FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS build
# Read by next.config.ts.
ENV STANDALONE_BUILD=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS run
ENV NODE_ENV=production
ENV PORT=3000
# Docker sets HOSTNAME to the container ID, and Next.js would bind to that.
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# A new named volume copies this owner, so the node user can write the database.
RUN mkdir .data && chown node:node .data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
