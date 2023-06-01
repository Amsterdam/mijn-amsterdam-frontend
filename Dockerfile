########################################################################################################################
########################################################################################################################
# Start with a node image for build dependencies
########################################################################################################################
########################################################################################################################
FROM node:current-buster as build-deps

ENV TZ=Europe/Amsterdam
ENV CI=true

WORKDIR /build-space

# Copy certificate
COPY ca/* /usr/local/share/ca-certificates/extras/

# Update new cert
RUN chmod -R 644 /usr/local/share/ca-certificates/extras/ \
  && update-ca-certificates

# ssh ( see also: https://github.com/Azure-Samples/docker-django-webapp-linux )
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
  && apt-get install -y --no-install-recommends dialog \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssh-server \
  && apt-get install -y --no-install-recommends nano \
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

COPY src/react-app-env.d.ts /build-space/src/react-app-env.d.ts
COPY src /build-space/src

########################################################################################################################
########################################################################################################################
# Actually building the application
########################################################################################################################
########################################################################################################################
FROM build-deps as build-app-fe

ARG REACT_APP_OTAP_ENV=production
ENV REACT_APP_OTAP_ENV=$REACT_APP_OTAP_ENV

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
FROM nginx:latest as deploy-frontend

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
ENV NODE_OPTIONS=--use-openssl-ca

LABEL name="Mijn.Amsterdam BFF (Back-end for front-end)"
LABEL repository-url="https://github.com/Amsterdam/mijn-amsterdam-frontend"

# Copy the built application files to the current image
COPY --from=build-app-bff /build-space/build-bff /app/build-bff
COPY --from=build-app-bff /build-space/node_modules /app/node_modules
COPY --from=build-app-bff /build-space/package.json /app/package.json
COPY src/server/views /app/build-bff/server/views

# Run the app
CMD /usr/local/bin/docker-entrypoint-bff.sh

FROM deploy-bff as deploy-bff-o

CMD /usr/local/bin/docker-entrypoint-bff.sh

FROM deploy-bff as deploy-bff-t

ENV MA_OTAP_ENV=test

COPY files /app/files
CMD /usr/local/bin/docker-entrypoint-bff.sh
