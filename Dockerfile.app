FROM node

COPY / /

RUN npm i

CMD ["npm", "start"]

