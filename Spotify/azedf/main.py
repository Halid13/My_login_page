import requests
import base64
from urllib.parse import urlencode
from fastapi import FastAPI, Depends, HTTPException, Query

app = FastAPI()

# Informations de l'application Spotify
client_id = '979a6b20e13a40079d2b76938d01abd4'
client_secret = '3ae4d62d5efd4553963b5680b2efcda4'
redirect_uri = 'http://localhost:8080/signup'

def generate_random_string(length):
    # Votre implémentation de la génération d'une chaîne aléatoire de la longueur spécifiée
    # A
    # ssurez-vous d'utiliser une méthode sécurisée pour générer des chaînes aléatoires en production
    pass

def spotify_login():
    state = generate_random_string(16)
    scope = 'user-read-private user-read-email'
    
    # Redirection vers la page d'autorisation Spotify
    redirect_url = 'https://accounts.spotify.com/authorize?' + urlencode({
        'response_type': 'code',
        'client_id': client_id,
        'scope': scope,
        'redirect_uri': redirect_uri,
        'state': state
    })
    
    return {"redirect_url": redirect_url}

def get_spotify_token(code: str = Query(..., description="Code d'autorisation")):
    auth_options = {
        'url': 'https://accounts.spotify.com/api/token',
        'data': {
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        },
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode('utf-8')
        }
    }
    response = requests.post(auth_options['url'], data=auth_options['data'], headers=auth_options['headers'])
    token_info = response.json()

    # À ce stade, vous avez l'objet token_info qui contient le token d'accès et d'autres informations
    return token_info

# Exemple d'utilisation :
# - Appeler spotify_login() pour obtenir l'URL de redirection vers la page d'autorisation
# - Visiter cette URL et autoriser l'application, puis obtenir le code d'autorisation
# - Appeler get_spotify_token(code='VOTRE_CODE') pour obtenir le token d'accès
# Remplacez 'VOTRE_CODE' par le code d'autorisation réel obtenu

# Exemple d'utilisation dans une application FastAPI :
# - Exécuter l'application avec uvicorn : uvicorn nom_du_fichier:app --reload
# - Accéder à http://localhost:8000/login pour obtenir l'URL de redirection
# - Suivre le lien généré pour autoriser l'application et obtenir le code d'autorisation
# - Appeler http://localhost:8000/token?code=VOTRE_CODE pour obtenir le token d'accès

@app.get("/q")
async def login():
    return spotify_login()

@app.get("/token")
async def token(code: str = Depends(get_spotify_token)):
    return code