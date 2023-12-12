import requests
import base64
from fastapi import FastAPI, HTTPException, Depends

app = FastAPI()

# Informations de l'application Spotify
client_id = '979a6b20e13a40079d2b76938d01abd4'
client_secret = '3ae4d62d5efd4553963b5680b2efcda4'
redirect_uri = 'http://localhost:8080/signup'

# Fonction pour obtenir le token d'accès
def get_spotify_token():
    auth_options = {
        'url': 'https://accounts.spotify.com/api/token',
        'data': {
            'grant_type': 'client_credentials'
        },
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode('utf-8')
        }
    }
    response = requests.post(auth_options['url'], data=auth_options['data'], headers=auth_options['headers'])
    token_info = response.json()
    return token_info['access_token']

# Endpoint pour récupérer les genres musicaux
@app.get("/genres")
async def get_genres(token: str = Depends(get_spotify_token)):
    url = 'https://api.spotify.com/v1/recommendations/available-genre-seeds'
    headers = {'Authorization': f'Bearer {token}'}

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        genres = response.json()['genres']
        return {"genres": genres}
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch genres")

# Exemple d'utilisation :
# - Exécuter l'application avec uvicorn : uvicorn nom_du_fichier:app --reload
# - Accéder à http://localhost:8000/genres pour obtenir la liste des genres musicaux
