########################################################################################################################
########################################################################################################################
# Update Dist packages and install dependencies
########################################################################################################################
########################################################################################################################
FROM node:20-bookworm as updated-local

ENV TZ=Europe/Amsterdam
ENV CI=true

RUN apt-get update \
  && apt-get dist-upgrade -y \
  && apt-get autoremove -y \
  && apt-get install -y --no-install-recommends \
  nano


########################################################################################################################
########################################################################################################################
# Start with a node image for build dependencies
########################################################################################################################
########################################################################################################################
FROM updated-local as build-deps

WORKDIR /build-space

# Copy packages + Install
COPY package-lock.json /build-space/
COPY package.json /build-space/
COPY vite.config.ts /build-space/
COPY vendor /build-space/vendor

# Install the dependencies
RUN npm ci --prefer-offline --no-audit --progress=false

# Typescript configs
COPY tsconfig.json /build-space/
COPY tsconfig.bff.json /build-space/

# Copy source files
COPY src /build-space/src
COPY index.html /build-space/

########################################################################################################################
########################################################################################################################
# Actually building the application
########################################################################################################################
########################################################################################################################
FROM build-deps as build-app-fe

# Universal env variables (defined in vite.config.ts)
ARG MA_OTAP_ENV=production
ENV MA_OTAP_ENV=$MA_OTAP_ENV

ARG MA_BUILD_ID=-1
ENV MA_BUILD_ID=$MA_BUILD_ID

ARG MA_RELEASE_VERSION_TAG=-1
ENV MA_RELEASE_VERSION_TAG=$MA_RELEASE_VERSION_TAG

ARG MA_GIT_SHA=-1
ENV MA_GIT_SHA=$MA_GIT_SHA

ARG MA_IS_AZ=unknown
ENV MA_IS_AZ=$MA_IS_AZ

ARG MA_TEST_ACCOUNTS=
ENV MA_TEST_ACCOUNTS=$MA_TEST_ACCOUNTS

# Statically replaced import.meta variables
ARG REACT_APP_BFF_API_URL=/api/v1
ENV REACT_APP_BFF_API_URL=$REACT_APP_BFF_API_URL

ARG REACT_APP_SENTRY_DSN=
ENV REACT_APP_SENTRY_DSN=$REACT_APP_SENTRY_DSN

ARG REACT_APP_ANALYTICS_ID=
ENV REACT_APP_ANALYTICS_ID=$REACT_APP_ANALYTICS_ID

ARG REACT_APP_MONITORING_CONNECTION_STRING=
ENV REACT_APP_MONITORING_CONNECTION_STRING=$REACT_APP_MONITORING_CONNECTION_STRING


COPY public /build-space/public

# Build FE
RUN npm run build

# Build BFF
FROM build-deps as build-app-bff

RUN npm run bff-api:build


########################################################################################################################
########################################################################################################################
# Front-end Web server image (Acceptance, Production)
########################################################################################################################
########################################################################################################################
FROM nginx:latest as deploy-frontend

ENV TZ=Europe/Amsterdam

WORKDIR /app

ARG MA_FRONTEND_HOST=mijn.amsterdam.nl
ENV MA_FRONTEND_HOST=$MA_FRONTEND_HOST


# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

COPY conf/nginx-server-default.template.conf /tmp/nginx-server-default.template.conf
RUN envsubst '${MA_FRONTEND_HOST}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Copy the built application files to the current image
COPY --from=build-app-fe /build-space/build /usr/share/nginx/html
COPY src/client/public/robots.disallow.txt /usr/share/nginx/html/robots.txt

CMD nginx -g 'daemon off;'

########################################################################################################################
########################################################################################################################
# Front-end Web server image Production
########################################################################################################################
########################################################################################################################
FROM deploy-frontend as deploy-production-frontend
COPY src/client/public/robots.allow.txt /usr/share/nginx/html/robots.txt


########################################################################################################################
########################################################################################################################
# Bff Web server image
########################################################################################################################
########################################################################################################################
FROM updated-local as deploy-bff

WORKDIR /app

ARG MA_OTAP_ENV=production
ENV MA_OTAP_ENV=$MA_OTAP_ENV

ARG MA_CONTAINER_SSH_ENABLED=false
ENV MA_CONTAINER_SSH_ENABLED=$MA_CONTAINER_SSH_ENABLED

ARG MA_BUILD_ID=0
ENV MA_BUILD_ID=$MA_BUILD_ID

ARG MA_GIT_SHA=-1
ENV MA_GIT_SHA=$MA_GIT_SHA

# Tell node to use the OpenSSL (OS installed) Certificates
ENV NODE_OPTIONS=--use-openssl-ca

# Copy certificate
COPY ca/* /usr/local/share/ca-certificates/extras/

# Update new cert
RUN chmod -R 644 /usr/local/share/ca-certificates/extras/ \
  && update-ca-certificates

# Entrypoint
COPY scripts/docker-entrypoint-bff.sh /usr/local/bin/
RUN chmod u+x /usr/local/bin/docker-entrypoint-bff.sh

# Copy the built application files to the current image
COPY --from=build-app-bff /build-space/build-bff /app/build-bff
COPY --from=build-app-bff /build-space/node_modules /app/node_modules
COPY --from=build-app-bff /build-space/package.json /app/package.json
COPY --from=build-app-bff /build-space/vendor /app/vendor
COPY src/server/views /app/build-bff/server/views

# Run the app
CMD /usr/local/bin/docker-entrypoint-bff.sh

FROM deploy-bff as deploy-bff-az

# ssh ( see also: https://github.com/Azure-Samples/docker-django-webapp-linux )
ARG SSH_PASSWD
ENV SSH_PASSWD=$SSH_PASSWD

RUN apt-get install -y --no-install-recommends openssh-server \
  && echo "$SSH_PASSWD" | chpasswd

# SSH config
COPY conf/sshd_config /etc/ssh/
COPY files /app/files
