FROM node:lts-alpine

RUN apk add --no-cache curl php php-json php-mbstring php-openssl php-curl php-xml php-phar

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN composer --version

COPY . .

EXPOSE 3000

CMD ["npm", "start"]