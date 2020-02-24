FROM node:13.7.0 as build-deps

# Indicating we are on a CI environment
ENV CI=true
# CRA will generate a file for the React runtime chunk, inlining it will cause issues with the CSP config
ENV INLINE_RUNTIME_CHUNK=false

WORKDIR /app

COPY tsconfig.json /app/
COPY package.json /app/
COPY package-lock.json /app/

RUN npm ci

COPY public /app/public
COPY src /app/src

ARG PORT=3000
ENV PORT=${PORT}
ARG REACT_APP_ENV=development
ENV REACT_APP_ENV=${REACT_APP_ENV}

COPY .env* /app/

RUN npm run build

COPY mock-api /app/mock-api
COPY scripts/serveBuild.js /app/scripts/serveBuild.js

EXPOSE 80

# Entrypoint used for serving frontend and mock-api used by e2e testsuite and test server (mijn.ot.amsterdam.nl)
ENTRYPOINT npm run serve-build

# Web server image
FROM nginx:stable-alpine as deploy-prod

ENV LOGOUT_URL=${LOGOUT_URL:-notset}

# Setting the correct timezone for the build
# RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Default --build-args
ARG BUILD_NUMBER=-1
ARG COMMIT_HASH=unknown

COPY conf/nginx-server-default.template.conf /tmp/nginx-server-default.template.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

# Copy the built application files to the current image
COPY --from=build-deps /app/build /usr/share/nginx/html
# Copy the correct robots file
COPY --from=build-deps /app/src/public/robots.${REACT_APP_ENV}.txt /usr/share/nginx/html/robots.txt

RUN echo "date=`date`; build=${BUILD_NUMBER}; env=${REACT_APP_ENV}; see also: https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${COMMIT_HASH}" > /usr/share/nginx/html/version.txt

# Use LOGOUT_URL for nginx rewrite directive
CMD envsubst '${LOGOUT_URL}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
