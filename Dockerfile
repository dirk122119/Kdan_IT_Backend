FROM node:18.10.0

WORKDIR /app
COPY . /app

RUN npm install
CMD npm run start