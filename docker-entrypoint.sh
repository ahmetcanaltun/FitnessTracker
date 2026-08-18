#!/bin/sh
set -e

# Migration'lar ayrı `migrate` servisinde çalışır (docker-compose.yml):
# runtime imajı slim standalone çıktısı olduğu için Prisma CLI'nin tüm
# bağımlılık ağacını içermiyor. app servisi migrate tamamlanmadan başlamaz.
#
# Seed'ler ve ilk admin hesabı:
#   docker compose run --rm tools npm run seed:admin
#   docker compose run --rm tools npm run seed:exercises
#   docker compose run --rm tools npm run seed:foods

exec "$@"
