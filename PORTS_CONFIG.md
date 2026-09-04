# 🎮 MONTRÉAL 2033 - ARCHITECTURE DES PORTS & OUTILS (VÉRIFIÉ 100%)

## 🔒 PORTS & SERVICES ACTIFS

| Service | Port | URL | Statut vérifié | Description |
|---|:---:|---|:---:|---|
| **🌐 God's Eye View** | **4173** | http://localhost:4173 | ✅ **GARDÉ (200 OK)** | Moteur 3D Cesium (Docker) intégré via iframe |
| **🎮 Montréal 2033 Hub** | **3034** | http://localhost:3034 | ✨ **Actif (npm run dev)** | Serveur Express + UI React du jeu |
| **🔍 OpenOSINT** | **8088** | http://localhost:8088 | ✅ **GARDÉ (200 OK)** | Démon d'enquête OSINT Sophia (Docker) |
| **🌍 World Monitor** | **3000** | http://localhost:3000 | ✅ **GARDÉ (200 OK)** | Renseignement global & satellites SkyFi |
| **🕵️ ShadowBroker** | **3001** | http://localhost:3001 | ✅ **GARDÉ (200 OK)** | Reconnaissance tactique géospatiale |
| **🐘 PostgreSQL** | **5432** | localhost:5432 | ✅ **Connecté (100%)** | Base `montreal_2033` (stm-postgres) |
| **🤖 Ollama Cluster** | **11435-11441**| http://localhost:11435-11441 | ✅ **7/7 En ligne** | 8 instances d'IA spécialisées (Nemotron, Sophia...) |

## 🚀 DÉMARRAGE DU HUB

```bash
npm run dev
# Écoute sur http://localhost:3034
# Intègre et connecte automatiquement tous les outils ci-dessus !
```
