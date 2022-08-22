########################################################################################################################
########################################################################################################################
# Start with a node image for build dependencies
########################################################################################################################
########################################################################################################################
FROM node:16.15.0 as build-deps

# Indicating we are on a CI environment
ENV CI=true
ENV TZ=Europe/Amsterdam

WORKDIR /build-space

COPY tsconfig.json /build-space/
COPY tsconfig.bff.json /build-space/
COPY package.json /build-space/
COPY package-lock.json /build-space/

# Front-end env files
COPY .env.production /build-space/

# BFF env files
#COPY .env.bff.development /build-space/
COPY .env.bff.test /build-space/
#COPY .env.bff.acceptance /build-space/

COPY .prettierrc.json /build-space/

COPY public /build-space/public
COPY src /build-space/src

RUN npm ci


########################################################################################################################
########################################################################################################################
# Actually building the application
########################################################################################################################
########################################################################################################################
FROM build-deps as build-app-fe

ARG MA_OTAP_ENV=development
ENV MA_OTAP_ENV=$MA_OTAP_ENV

ARG MA_BFF_API_URL=/
ENV MA_BFF_API_URL=$MA_BFF_API_URL

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

ENV TZ=Europe/Amsterdam

COPY conf/nginx-server-default.template.conf /tmp/nginx-server-default.template.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Copy the built application files to the current image
COPY --from=build-app-fe /build-space/build /usr/share/nginx/html

COPY src/client/public/robots.disallow.txt /usr/share/nginx/html/robots.allow.txt

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

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
ENTRYPOINT npm run bff-api:serve-build

FROM deploy-bff as deploy-bff-o

ENV MA_OTAP_ENV=test
COPY --from=build-app-bff /build-space/.env.bff.test /app/.env.bff.test
ENTRYPOINT npm run bff-api:serve-build
