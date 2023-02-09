########################################################################################################################
########################################################################################################################
# Start with a node image for build dependencies
########################################################################################################################
########################################################################################################################
FROM node:16 as build-deps

ENV TZ=Europe/Amsterdam
ENV CI=true

WORKDIR /build-space

# Copy certificate
COPY certs/adp_rootca.crt /usr/local/share/ca-certificates/

# Tell node to use openssl ca
ENV NODE_OPTIONS=--use-openssl-ca

# Update new cert
RUN update-ca-certificates

# ssh ( see also: https://github.com/Azure-Samples/docker-django-webapp-linux )
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
  && apt-get install -y --no-install-recommends dialog \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssh-server \
  && echo "$SSH_PASSWD" | chpasswd 

COPY package-lock.json /build-space/
COPY package.json /build-space/

RUN npm ci --prefer-offline --no-audit --progress=false
COPY conf/sshd_config /etc/ssh/

COPY .prettierrc.json /build-space/

COPY conf/docker-entrypoint-bff.sh /usr/local/bin/
RUN chmod u+x /usr/local/bin/docker-entrypoint-bff.sh

COPY tsconfig.json /build-space/
COPY tsconfig.bff.json /build-space/

# Front-end env files
COPY .env.production /build-space/

# BFF env files
COPY .env.bff.development /build-space/
COPY .env.bff.test /build-space/
#COPY .env.bff.acceptance /build-space/

COPY src/react-app-env.d.ts /build-space/src/react-app-env.d.ts
COPY src /build-space/src

########################################################################################################################
########################################################################################################################
# Actually building the application
########################################################################################################################
########################################################################################################################
FROM build-deps as build-app-fe

# Env parameters will be passed to React Build via the .env.xxxx files
ARG MA_OTAP_ENV=development
ENV MA_OTAP_ENV=$MA_OTAP_ENV

ARG MA_BFF_API_URL=/
ENV MA_BFF_API_URL=$MA_BFF_API_URL

ARG MA_BFF_AUTH_PATH=/auth
ENV MA_BFF_AUTH_PATH=$MA_BFF_AUTH_PATH

ARG REACT_APP_ADO_BUILD_ID=0
ENV REACT_APP_ADO_BUILD_ID=$REACT_APP_ADO_BUILD_ID

ARG REACT_APP_GIT_SHA=0
ENV REACT_APP_GIT_SHA=$REACT_APP_GIT_SHA

ARG REACT_APP_TEST_ACCOUNTS=
ENV REACT_APP_TEST_ACCOUNTS=$REACT_APP_TEST_ACCOUNTS

COPY public /build-space/public

# Build FE
RUN npm run build


FROM build-deps as build-app-bff

# Build BFF
RUN npm run bff-api:build


########################################################################################################################
########################################################################################################################
# Front-end Web server image (Acceptance, Production)
########################################################################################################################
########################################################################################################################
FROM nginx:stable-alpine as deploy-frontend

WORKDIR /app

LABEL name="mijnamsterdam FRONTEND"
LABEL repository-url="https://github.com/Amsterdam/mijn-amsterdam-frontend"

ARG MA_APP_HOST=https://mijn.amsterdam.nl
ENV MA_APP_HOST=$MA_APP_HOST

ENV TZ=Europe/Amsterdam

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

COPY conf/nginx-server-default.template.conf /tmp/nginx-server-default.template.conf
RUN envsubst '${MA_APP_HOST}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf
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
FROM build-app-bff as deploy-bff

WORKDIR /app

ENV TZ=Europe/Amsterdam

LABEL name="Mijn.Amsterdam BFF (Back-end for front-end)"
LABEL repository-url="https://github.com/Amsterdam/mijn-amsterdam-frontend"

# Copy the built application files to the current image
COPY --from=build-app-bff /build-space/build-bff /app/build-bff
COPY --from=build-app-bff /build-space/node_modules /app/node_modules
COPY --from=build-app-bff /build-space/package.json /app/package.json

# Run the app
CMD /usr/local/bin/docker-entrypoint-bff.sh

FROM deploy-bff as deploy-bff-o

ENV MA_OTAP_ENV=development
COPY --from=build-app-bff /build-space/.env.bff.development /app/.env.bff.development
CMD /usr/local/bin/docker-entrypoint-bff.sh

FROM deploy-bff as deploy-bff-t

ENV MA_OTAP_ENV=test
COPY --from=build-app-bff /build-space/.env.bff.test /app/.env.bff.test
COPY files /app/files
CMD /usr/local/bin/docker-entrypoint-bff.sh
