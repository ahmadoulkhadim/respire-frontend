.PHONY: help install install-web install-mobile install-backend setup-backend dev-backend dev-web dev-mobile dev-db clean

help:
	@echo "RESPIRE — Commandes disponibles"
	@echo ""
	@echo "  make install          Installer toutes les dépendances"
	@echo "  make setup-backend    Configurer le venv Python + .env"
	@echo "  make dev-db           Démarrer MySQL + InfluxDB (Docker)"
	@echo "  make dev-backend      Démarrer l'API FastAPI"
	@echo "  make dev-web          Démarrer le dashboard React"
	@echo "  make dev-mobile       Démarrer l'app mobile Expo"
	@echo "  make clean            Supprimer node_modules et venv locaux"

install: install-web install-mobile install-backend

install-web:
	cd respire-web && npm install

install-mobile:
	cd respire-mobile && npm install

install-backend:
	cd backend && bash setup.sh

setup-backend:
	cd backend && bash setup.sh

dev-db:
	cd backend && docker compose up -d mysql influxdb

dev-backend:
	cd backend && . venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-web:
	cd respire-web && npm start

dev-mobile:
	cd respire-mobile && npx expo start

clean:
	rm -rf respire-web/node_modules respire-mobile/node_modules backend/venv
