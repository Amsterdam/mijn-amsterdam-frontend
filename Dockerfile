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

########################################################################################################################
########################################################################################################################
# Actually building the application
########################################################################################################################
########################################################################################################################
FROM build-deps as build-app

ENV BROWSER=none
ENV CI=true
ENV INLINE_RUNTIME_CHUNK=false
ENV TZ=Europe/Amsterdam

# Setting the correct timezone for the build
RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Build client
RUN npm run build
# Build bff
RUN npm run bff-api:build

########################################################################################################################
########################################################################################################################
# Serving the application (test (OT) + e2e)
########################################################################################################################
########################################################################################################################
FROM build-app as serve-ot-bff

ENV PORT=80
ENV REDIRECT_AFTER_LOGIN=https://mijn.ot.amsterdam.nl
ENV BFF_ENV=development

COPY scripts/serveBuild.js /app/scripts/serveBuild.js

# Serving both front-end and back-end on th test environment
ENTRYPOINT npm run serve-build

########################################################################################################################
########################################################################################################################
# Front-end Web server image (Acceptance, Production)
########################################################################################################################
########################################################################################################################
FROM nginx:stable-alpine as deploy-ap-frontend

LABEL name="mijnamsterdam FRONTEND"
LABEL repository-url="https://github.com/Amsterdam/mijn-amsterdam-frontend"

ENV LOGOUT_URL=${LOGOUT_URL:-notset}
ENV TZ=Europe/Amsterdam

COPY conf/nginx-server-default.template.conf /tmp/nginx-server-default.template.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

# Copy the built application files to the current image
COPY --from=build-app /app/build /usr/share/nginx/html

# Use LOGOUT_URL for nginx rewrite directive
CMD envsubst '${LOGOUT_URL}' < /tmp/nginx-server-default.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'


########################################################################################################################
########################################################################################################################
# Front-end Web server image Acceptance
########################################################################################################################
########################################################################################################################
FROM deploy-ap-frontend as deploy-acceptance-frontend
COPY --from=build-deps /app/src/client/public/robots.acceptance.txt /usr/share/nginx/html/robots.txt

########################################################################################################################
########################################################################################################################
# Front-end Web server image Production
########################################################################################################################
########################################################################################################################
FROM deploy-ap-frontend as deploy-production-frontend
COPY --from=build-deps /app/src/client/public/robots.production.txt /usr/share/nginx/html/robots.txt



########################################################################################################################
########################################################################################################################
# Bff Web server image (Acceptance, Production)
########################################################################################################################
########################################################################################################################
FROM node:13.7.0 as deploy-ap-bff

ENV BFF_MS_API_HOST=mijn.acc.data.amsterdam.nl
ENV BFF_ENV=production
ENV TZ=Europe/Amsterdam

LABEL name="mijnamsterdam BFF (Back-end for front-end)"
LABEL repository-url="https://github.com/Amsterdam/mijn-amsterdam-frontend"

WORKDIR /app

# Copy the built application files to the current image
COPY --from=build-app /app/build-bff /app/build-bff

# Copy required node modules
COPY --from=build-app /app/node_modules /app/node_modules
COPY --from=build-app /app/package.json /app/package.json

# Run the app
ENTRYPOINT npm run bff-api:serve-build
