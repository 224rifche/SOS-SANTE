# Won-Mally

> Chaque seconde compte. Chaque vie mérite une réponse.

Plateforme intelligente de gestion des urgences médicales et de coordination de la prise en charge.

## Structure du dépôt

```
wonmally/
├── backend/          Spring Boot 3 (Java 17) - API REST + WebSocket
├── frontend/          React + Vite - PWA Offline First
├── database/          Scripts SQL (schéma + données d'amorçage)
├── docker/            (réservé : scripts de déploiement additionnels)
├── observability/      Configurations Loki, Mimir, Grafana
├── docker-compose.yml  Orchestration complète de l'infrastructure
└── .env.example        Variables d'environnement à copier en .env
```

## État d'avancement (Sprint 2 — squelette fonctionnel)

### ✅ Fait et fonctionnel
- Base de données : schéma complet (20 tables, contraintes, index) + migrations Flyway + seed
- Backend : 19 entités JPA, repositories, sécurité JWT (access 15 min / refresh 7 jours), RBAC, module Auth complet (register/login/refresh/logout), module Alert complet (création + diffusion WebSocket), module Intervention avec machine à états validée (15 statuts, transitions contrôlées), gestion centralisée des exceptions, documentation OpenAPI/Swagger
- Frontend : build Vite **vérifié et fonctionnel**, PWA manifest, routing protégé par rôle (RBAC), AuthContext + WebSocketContext (STOMP/SockJS), intercepteur Axios avec refresh automatique de token, parcours citoyen complet (Login, Register, SOS avec géolocalisation)
- Infrastructure : Docker Compose complet (MySQL, Backend, Frontend/Nginx, Grafana, Loki, Mimir, Beyla), Dockerfiles multi-stage

### ⚠️ À compléter au prochain sprint
- Backend : controllers/services CRUD pour Doctor, MedicalCenter, Ambulance, Ambulancier, Notification, Audit (dossiers vides présents dans l'arborescence comme emplacements prévus)
- Backend : mappers MapStruct pour Intervention (actuellement l'entité est retournée brute par le controller)
- Frontend : tableaux de bord Centre Médical / Ambulancier / Médecin / Admin (routes en place, contenu à développer)
- Frontend : Service Worker (cache offline, IndexedDB, synchronisation automatique) — la PWA a son manifest mais pas encore son Service Worker
- Tests unitaires et d'intégration (aucun test n'a encore été écrit)

## ⚠️ Limite de vérification importante

Le **Frontend a été réellement construit et son build a été vérifié** (`npm run build` exécuté avec succès, 229 modules transformés).

Le **Backend n'a pas pu être compilé** dans cet environnement : l'accès réseau ne permet pas de joindre Maven Central (dépôt des dépendances Java), uniquement npm, PyPI et GitHub. Le code a été écrit avec la plus grande rigueur (cohérence des imports, des packages, des annotations JPA/Lombok/Spring), mais **il est fortement recommandé d'exécuter `mvn clean compile` en local dès récupération du projet** pour détecter d'éventuelles erreurs de compilation avant d'aller plus loin.

## Démarrage rapide

```bash
# 1. Copier et renseigner les variables d'environnement
cp .env.example .env
# éditer .env : JWT_SECRET, mots de passe DB, etc.

# 2. Lancer toute l'infrastructure (production / démo complète)
docker compose up --build

# Accès :
# Frontend       -> http://localhost
# API Backend    -> http://localhost:8080/api/v1
# Swagger UI     -> http://localhost:8080/swagger-ui.html
# Grafana        -> http://localhost:3000
```

## Workflow de développement local (recommandé au quotidien)

Pour itérer rapidement sur le Backend sans reconstruire l'image Docker à chaque modification, on lance uniquement la base de données en conteneur et le Backend directement depuis l'IDE ou Maven :

```bash
# 1. Lancer uniquement MySQL (+ Adminer pour l'administrer visuellement)
docker compose -f docker-compose.dev.yml up -d

# Adminer (interface web DB) -> http://localhost:8081
#   Système : MySQL, Serveur : mysql ou localhost, Utilisateur/mdp : voir .env

# 2. Lancer le Backend en local (il se connecte au conteneur via localhost:3307)
#    -> definir DB_PORT=3307 dans backend/.env (le conteneur MySQL est expose
#       sur le port hote 3307 pour eviter tout conflit avec un MySQL local deja installe)
cd backend
mvn spring-boot:run
# Flyway applique automatiquement le schéma (V1__init_schema.sql) et le seed
# (V2__seed_data.sql) au démarrage, sur la base wonmally_db du conteneur.

# 3. Lancer le Frontend en local
cd frontend
npm install
npm run dev
```

Avec cette approche, la base de données reste **toujours en conteneur Docker** (jamais installée nativement sur la machine), conformément à l'architecture cible — seul le code applicatif tourne en local pendant le développement actif.

### `Error response from daemon: ports are not available ... 0.0.0.0:3306`

Un service MySQL est déjà installé et actif sur ta machine (XAMPP, WAMP, MySQL Server natif, etc.), ce qui occupe le port 3306. Le `docker-compose.yml` expose désormais MySQL sur le port hôte **3307** au lieu de 3306 (le conteneur écoute toujours sur 3306 en interne, seule la correspondance côté hôte change). Si tu utilises un client externe (MySQL Workbench, DBeaver...) pour te connecter à la base depuis Windows, utilise `localhost:3307`.



Cette erreur n'est pas liée au projet mais à une incompatibilité entre la version de **Lombok** et la version de **JDK** installée sur la machine (typique avec un JDK 21+ récent et une ancienne version de Lombok). Deux vérifications :

1. Vérifier la version du JDK utilisée : `java -version`. Le projet cible Java 17 ; un JDK plus récent (21, 23...) fonctionne aussi mais nécessite une version de Lombok à jour.
2. Le `pom.xml` fixe désormais explicitement `lombok.version` à `1.18.36` (corrige les incompatibilités avec les JDK récents). Si l'erreur persiste après un `mvn clean package`, essayer en forçant Java 17 précisément (`JAVA_HOME` pointé vers un JDK 17), ou mettre à jour Lombok vers la toute dernière version stable disponible sur Maven Central.


## Convention technique

- Package Java racine : `com.wonmally.app`
- Schéma de base de données : `wonmally_db`
- Statuts d'intervention (référence officielle) : voir `com.wonmally.app.common.InterventionStatus`
