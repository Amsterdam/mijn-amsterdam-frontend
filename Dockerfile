########################################################################################################################
########################################################################################################################
# Start with a node image for build dependencies
########################################################################################################################
########################################################################################################################
FROM node:13.7.0 as build-deps

# Indicating we are on a CI environment
ENV CI=true

WORKDIR /app

COPY tsconfig.json /app/
COPY tsconfig.bff.json /app/
COPY package.json /app/
COPY package-lock.json /app/

RUN npm ci

COPY public /app/public
COPY src /app/src
COPY .env* /app/


########################################################################################################################
########################################################################################################################
# Actually building the application
########################################################################################################################
########################################################################################################################
FROM build-deps as build-app

ARG REACT_APP_ENV=development
ENV REACT_APP_ENV=$REACT_APP_ENV

# CRA will generate a file for the React runtime chunk, inlining it will cause issues with the CSP config
ENV INLINE_RUNTIME_CHUNK=false

# Setting the correct timezone for the build
RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Build client
RUN npm run build
# Build bff
RUN npm run bff-api:build

RUN echo "date=`date`; env=${REACT_APP_ENV}" > /app/build/version.txt
RUN echo "Current REACT_APP_ENV (node build image) = ${REACT_APP_ENV}"


########################################################################################################################
########################################################################################################################
# Serving the application
########################################################################################################################
########################################################################################################################
FROM build-app as serve-bff

# COPY src/server/mock-data /app/mock-api
COPY scripts/serveBuild.js /app/scripts/serveBuild.js

ENV PORT=80
EXPOSE 80

########################################################################################################################
########################################################################################################################
# Client Web server image
########################################################################################################################
########################################################################################################################
FROM nginx:stable-alpine as deploy-prod-client

ARG REACT_APP_ENV=production
ENV REACT_APP_ENV=$REACT_APP_ENV
RUN echo "Current REACT_APP_ENV (nginx CLIENT deploy image) = ${REACT_APP_ENV}"
ENV LOGOUT_URL=${LOGOUT_URL:-notset}

# Setting the correct timezone for the build
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
COPY --from=build-app /app/build /usr/share/nginx/html
# Copy the correct robots file
COPY --from=build-deps /app/src/client/public/robots.$REACT_APP_ENV.txt /usr/share/nginx/html/robots.txt

RUN echo "date=`date`; build=${BUILD_NUMBER}; env=${REACT_APP_ENV}; see also: https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${COMMIT_HASH}" > /usr/share/nginx/html/version.txt

# Use LOGOUT_URL for nginx rewrite directive
CMD envsubst '${LOGOUT_URL}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'


########################################################################################################################
########################################################################################################################
# Bff Web server image
########################################################################################################################
########################################################################################################################
FROM node:13.7.0 as deploy-prod-bff

WORKDIR /app

ARG REACT_APP_ENV=production
ENV REACT_APP_ENV=$REACT_APP_ENV
RUN echo "Current REACT_APP_ENV (node BFF deploy image) = ${REACT_APP_ENV}"

# Setting the correct timezone for the build
RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Copy the built application files to the current image
COPY --from=build-app /app/build-bff /app/build-bff
COPY --from=build-app /app/node_modules /app/node_modules
COPY --from=build-app /app/.env.production /app/.env.production
COPY --from=build-app /app/package.json /app/package.json

ENV PORT=5000
EXPOSE 5000

# Run the app
ENTRYPOINT npm run bff-api:serve-prod
