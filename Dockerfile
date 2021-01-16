FROM node:14-buster

RUN mkdir /app
WORKDIR /app

COPY Makefile /app/
RUN make all

COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile

COPY ./ /app/
RUN yarn build-prod

EXPOSE 8000
ENV PORT 8000

CMD yarn start
