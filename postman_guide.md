# Guide de démarrage Docker & Tests Postman - Won-Mally

Ce guide vous explique comment lancer le projet complet avec Docker Compose, puis tester les différentes fonctionnalités d'authentification de l'API avec Postman.

---

## 1. Démarrage du projet avec Docker

Ouvrez un terminal dans le répertoire racine de votre projet (`wonmally`) et exécutez la commande suivante :

```bash
docker compose up --build
```

Cette commande va compiler l'application Java, construire les images Docker pour le Frontend et le Backend, puis démarrer tous les services nécessaires (base de données, API backend, frontend, outils de monitoring).

### Accès aux services une fois démarrés :
- **Frontend Web** : [http://localhost](http://localhost)
- **API Backend** : [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Interface de documentation Swagger (OpenAPI)** : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 2. Tests de l'API avec Postman

### A. Inscription (`/api/v1/auth/register`)
Créez un nouveau compte utilisateur.

* **Méthode** : `POST`
* **URL** : `http://localhost:8080/api/v1/auth/register`
* **Headers** :
  * `Content-Type`: `application/json`
* **Body** (JSON, raw) :
  ```json
  {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+224600000000",
    "password": "password123"
  }
  ```
* **Réponse attendue** (`201 Created`) :
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "abcdef-un-token-tres-long-et-aleatoire...",
    "tokenType": "Bearer"
  }
  ```

---

### B. Connexion (`/api/v1/auth/login`)
Connectez-vous pour obtenir de nouveaux jetons.

* **Méthode** : `POST`
* **URL** : `http://localhost:8080/api/v1/auth/login`
* **Headers** :
  * `Content-Type`: `application/json`
* **Body** (JSON, raw) :
  ```json
  {
    "email": "jean.dupont@example.com",
    "password": "password123"
  }
  ```
* **Réponse attendue** (`200 OK`) :
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "nouveau-token-genere...",
    "tokenType": "Bearer"
  }
  ```

---

### C. Rafraîchissement du Jeton (`/api/v1/auth/refresh`)
Obtenez un nouvel `accessToken` en échange de votre `refreshToken` (Rotation de session).

* **Méthode** : `POST`
* **URL** : `http://localhost:8080/api/v1/auth/refresh`
* **Headers** :
  * `Content-Type`: `application/json`
* **Body** (JSON, raw) :
  ```json
  {
    "refreshToken": "METTRE_ICI_LE_REFRESH_TOKEN_OBTENU_LORS_DU_LOGIN"
  }
  ```
* **Réponse attendue** (`200 OK`) :
  ```json
  {
    "accessToken": "nouveau-access-token-jwt...",
    "refreshToken": "nouveau-refresh-token-tournant...",
    "tokenType": "Bearer"
  }
  ```
  *(Note : L'ancien refresh token fourni dans la requête devient alors invalide par rotation).*

---

### D. Déconnexion (`/api/v1/auth/logout`)
Invalidez la session courante de l'utilisateur.

* **Méthode** : `POST`
* **URL** : `http://localhost:8080/api/v1/auth/logout`
* **Headers** :
  * `Content-Type`: `application/json`
* **Body** (JSON, raw) :
  ```json
  {
    "refreshToken": "METTRE_ICI_LE_REFRESH_TOKEN_A_REVOQUER"
  }
  ```
* **Réponse attendue** (`204 No Content` - sans corps de réponse) :
  * Cette requête révoque le jeton dans la base de données.
