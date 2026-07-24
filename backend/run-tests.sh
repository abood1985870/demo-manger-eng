#!/bin/bash
set -e

echo "Starting Docker environment..."
docker-compose -f docker-compose.test.yml up -d db

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "Installing dependencies..."
docker-compose -f docker-compose.test.yml run --rm app composer install --no-interaction --prefer-dist --optimize-autoloader

echo "Clearing config and caches..."
docker-compose -f docker-compose.test.yml run --rm app php artisan config:clear
docker-compose -f docker-compose.test.yml run --rm app php artisan cache:clear

echo "Running Migrations..."
docker-compose -f docker-compose.test.yml run --rm app php artisan migrate:fresh --env=testing

echo "Running Tests..."
docker-compose -f docker-compose.test.yml run --rm app php artisan test --env=testing

echo "Tearing down..."
docker-compose -f docker-compose.test.yml down -v
