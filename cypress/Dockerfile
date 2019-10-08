FROM cypress/base:10

WORKDIR /app

ENV CI=1
RUN npm init --yes
RUN npm install cypress

RUN npx cypress verify
CMD sleep 4 && npx cypress run
