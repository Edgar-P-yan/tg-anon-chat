FROM node:12-slim AS installer
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn

# ---

FROM installer AS builder
WORKDIR /usr/src/app

COPY --from=installer /usr/src/app/ .
COPY src ./src
COPY ormconfig.js tsconfig.json tsconfig.release.json ./

ENV NODE_ENV production
RUN yarn build
RUN yarn install

# ---

FROM node:12-slim AS runner
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ .

ENV NODE_ENV production
EXPOSE 80
CMD ["node", "dist/src/main.js"]
