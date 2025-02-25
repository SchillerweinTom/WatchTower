FROM node:22.14 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

#ARG VITE_BASE_URL_API
#ENV VITE_BASE_URL_API=${VITE_BASE_URL_API}
ENV VITE_BASE_URL_API="http://watchtower-api.caprover.samt.local:3333"

RUN npm run build

FROM httpd:latest

COPY --from=build /app/dist/ /usr/local/apache2/htdocs/
COPY public/new-apache.conf /usr/local/apache2/conf/httpd.conf
COPY public/.htaccess /usr/local/apache2/htdocs/

EXPOSE 80

CMD ["httpd", "-D", "FOREGROUND"]