FROM node:22-slim
RUN corepack enable
WORKDIR /app

COPY client ./client
COPY server ./server
COPY contracts/contracts ./contracts/contracts

RUN cd client && pnpm install --frozen-lockfile
RUN cd client/frontend && pnpm install --frozen-lockfile
RUN cd server && pnpm install --frozen-lockfile --prod

RUN cd client/frontend && pnpm build

ENV STATIC_DIR=/app/client/frontend/dist
EXPOSE 3000
USER node
CMD ["node", "server/index.js"]