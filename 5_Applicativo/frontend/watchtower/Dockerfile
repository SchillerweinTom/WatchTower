FROM node:22.14 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG VITE_BASE_URL_API
ENV VITE_BASE_URL_API=${VITE_BASE_URL_API}

RUN npm run build

FROM httpd:latest
#FROM nginx:latest

COPY --from=build /app/dist/ /usr/local/apache2/htdocs/
COPY public/new-apache.conf /usr/local/apache2/conf/httpd.conf
COPY public/.htaccess /usr/local/apache2/htdocs/

#COPY --from=build /app/dist/ /usr/share/nginx/html/
#COPY public/new-nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["httpd", "-D", "FOREGROUND"]
#CMD ["nginx", "-g", "daemon off;"]