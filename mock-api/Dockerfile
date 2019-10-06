FROM node:10.15.3

WORKDIR /app

COPY mock-api /app/mock-api
COPY package.json /app/package.json
COPY get-ip.js /app

RUN npm install dyson node-persist date-fns

CMD ["npm", "run", "mock-api"]
