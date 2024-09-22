FROM php:8.3-cli

RUN apt-get update -y && \
    apt-get install -y libzip-dev unzip libonig-dev && \
    docker-php-ext-install pdo pdo_mysql mbstring zip bcmath

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

COPY . /app

RUN composer install

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
