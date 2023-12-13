const express = require('express');
const axios = require('axios');
const base64 = require('base-64');
// const { generateRandomString } = require('./your-utils'); // Remplacez par votre fonction de génération de chaîne aléatoire

const app = express();
app.use(express.json())
const port = 8080;

const clientId = '979a6b20e13a40079d2b76938d01abd4';
const clientSecret = '3ae4d62d5efd4553963b5680b2efcda4';
const redirectUri = 'http://localhost:8080/signup';

app.get('/login', (req, res) => {
    const state = "qwertyuioasdfghjklasdfghj";
    const scope = 'user-read-private user-read-email';

    const redirectUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
        'response_type': 'code',
        'client_id': clientId,
        'scope': scope,
        'redirect_uri': redirectUri,
        'state': state
    }).toString();

    res.redirect(redirectUrl);
});

app.post('/token', async (req, res) => {
    console.log(req.body)
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        data: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    try {
        const response = await axios.post(authOptions.url, authOptions.data, {
            headers: authOptions.headers
        });

        const tokenInfo = response.data;
        res.json(tokenInfo);
    } catch (error) {
        console.error(error.response);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/genre', async (req, res) => { 
    const result = await axios.get('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
        headers: { Authorization: 'Bearer ' + req.body.token },
      });
  
      const data = result.data;
      return res.json(data.categories.items);
} )

app.post('/playlist', async (req, res) =>  {
    const limit = 10;
  
      const result = await axios.get(`https://api.spotify.com/v1/browse/categories/${req.body.genreId}/playlists?limit=${limit}`, {
          headers: { Authorization: 'Bearer ' + req.body.token },
        });
  
      const data = result.data;
      return res.json(data.playlists.items);
})

app.post('/tracks', async (req, res) => {
    const limit = 10;
    console.log(req.body)

    try {
        const result = await axios.get(`${req.body.tracksEndPoint}?limit=${limit}`, {
          headers: { Authorization: 'Bearer ' + req.body.token },
        });
    
        const data = result.data;
        return res.json(data);
    } catch (error) {
        return res.json({
            message: "Something went wrong"
        })
    }
  
})

app.post('/track', async (req, res) => {
    const result = await axios.get(`${req.body.trackEndPoint}`, {
        headers: { Authorization: 'Bearer ' + req.body.token },
      });
  
      const data = result.data;
      return res.json(data);
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
