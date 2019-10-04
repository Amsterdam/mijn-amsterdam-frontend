FROM node:10.15 as build-deps
LABEL maintainer="datapunt@amsterdam.nl"

ENV LOGOUT_URL=${LOGOUT_URL:-notset}

WORKDIR /app

RUN apt-get update && \
  apt-get install -y \
  netcat \
  netcat \
  git && \
  rm -rf /var/lib/apt/lists/*

COPY package.json /app/
COPY package-lock.json /app/
COPY tsconfig.json /app/
COPY paths.json /app/
COPY .env* /app/
COPY scripts/env-copy.sh /app/

ARG BUILD_ENV=production
ARG BUILD_NUMBER=-1
ARG COMMIT_HASH=unknown

# Builds are always production builds but can have differences in server environment (test/acceptance/production)
# Try to overwrite the default production .env file if a BUILD_ENV is set as build-arg
RUN sh env-copy.sh ${BUILD_ENV}

COPY src /app/src/
COPY public /app/public/

ENV CI=true
ENV INLINE_RUNTIME_CHUNK=false

RUN npm install \
  --unsafe-perm \
  --verbose \
  ci \
  && npm cache clean --force

RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# RUN npm run build
RUN export BUILD_ENV=$BUILD_ENV
RUN if [ "$BUILD_ENV" != "test-unit" ]; then npm run build ; fi
RUN if [ "$BUILD_ENV" != "test-unit" ]; then echo "date=`date`; build=${BUILD_NUMBER}; see also: https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${COMMIT_HASH}" > /app/build/version.txt ; fi

# Set-up the integration test part of the build
FROM cypress/base:10 as e2e-tests

WORKDIR /app

COPY --from=build-deps /app/ /app/
COPY cypress /app/cypress
COPY /proxy-serve.js /app/proxy-serve.js
COPY /cypress.json /app/cypress.json
COPY mock-api /app/mock-api

RUN npm install cypress

# Web server image
FROM nginx:stable-alpine

COPY conf/nginx-server-default.template.conf /tmp/nginx-server-default.template.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

# Copy the built application files to the current image
COPY --from=build-deps /app/build /usr/share/nginx/html

# Use LOGOUT_URL for nginx rewrite directive
CMD envsubst '${LOGOUT_URL}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
