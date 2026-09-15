# build
FROM node:24.3-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# runtime
FROM node:24.3-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist/ ./dist

EXPOSE 3000
CMD ["npm", "run", "start"]
