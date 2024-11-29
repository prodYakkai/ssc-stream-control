FROM node:18.19.0-alpine as builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn generate:prisma

RUN yarn build

FROM node:18.19.0-alpine

ENV NODE_ENV production
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

RUN yarn generate:prisma

COPY --from=builder /app/dist ./dist

EXPOSE 3005
CMD [ "node", "dist/index.js" ]
