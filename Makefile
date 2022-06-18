dev:
	docker-compose up

pi:
	ssh escape@192.168.1.62 git --git-dir /var/www/html/escape-marcel-ayme/.git pull
	ssh escape@192.168.1.62 git --git-dir /var/www/html/escape-marcel-ayme/.git reset --hard