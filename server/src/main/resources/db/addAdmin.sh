export PGPASSWORD=postgres
docker exec -it hours_db psql -U postgres -d hours -c "INSERT INTO users (username, password, enabled) VALUES ('admin', '\$2a\$10\$yY0BX0t4asaqnFDe4HM2h.XjFkmYmOip2yr7GKtosx1J4hQR25Ar2', true);"
docker exec -it hours_db psql -U postgres -d hours -c "INSERT INTO authorities (username, authority) VALUES ('admin', 'ADMIN');"

