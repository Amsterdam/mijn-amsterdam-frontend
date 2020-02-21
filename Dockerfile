FROM node:13.7.0 as build-deps

ENV LOGOUT_URL=${LOGOUT_URL:-notset}
# Indicating we are on a CI environment
ENV CI=true
# CRA will generate a file for the React runtime chunk, inlining it will cause issues with the CSP config
ENV INLINE_RUNTIME_CHUNK=false

WORKDIR /app

# Copy required files for building
COPY package.json /app/
COPY package-lock.json /app/

RUN npm ci

COPY tsconfig.json /app/
COPY .env* /app/
COPY scripts/ /app/scripts
COPY src /app/src/
COPY public /app/public/

# Setting the correct timezone for the build
RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Default --build-args
ARG BUILD_ENV=production
ARG BUILD_NUMBER=-1
ARG COMMIT_HASH=unknown

ENV REACT_APP_BUILD_ENV=${BUILD_ENV}

# Builds are always production builds but can have differences in server environment (test/acceptance/production)
# Try to overwrite the default production .env file if a BUILD_ENV is set as build-arg
RUN sh scripts/env-copy.sh ${BUILD_ENV}

# Some conditional setup
RUN if [ "$BUILD_ENV" = "production" ]; then rm /app/public/robots.txt ; fi
RUN if [ "$BUILD_ENV" != "test-unit" ]; then npm run build ; fi
RUN if [ "$BUILD_ENV" != "test-unit" ]; then echo "date=`date`; build=${BUILD_NUMBER}; build_env=${BUILD_ENV}; see also: https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${COMMIT_HASH}" > /app/build/version.txt ; fi

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
