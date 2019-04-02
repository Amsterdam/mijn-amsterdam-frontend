FROM node:10.15 as build-deps
LABEL maintainer="datapunt@amsterdam.nl"

ENV LOGOUT_URL=${LOGOUT_URL:-notset}

WORKDIR /app

RUN apt-get update && \
  apt-get install -y \
  netcat \
  git && \
  rm -rf /var/lib/apt/lists/*

# Enable when we add the app to the repo
COPY package.json /app/
COPY package-lock.json /app/

RUN npm install \
  --unsafe-perm \
  --verbose \
  ci \
  && npm cache clean --force

COPY .env.production /app
COPY src /app/src
COPY public /app/public

RUN npm run build
RUN echo "build= `date`" > /app/build/version.txt

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
RUN envsubst '${LOGOUT_URL}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf
