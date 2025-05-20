require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

async function getToken() {
  const auth = Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64');

  const res = await axios.post('https://api.sandbox.ebay.com/identity/v1/oauth2/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope'
    }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    }
  });

  return res.data.access_token;
}

app.get('/buscar', async (req, res) => {
  try {
    const query = req.query.q || 'reloj';
    const token = await getToken();

    const response = await axios.get('https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: query,
        limit: 5,
        deliveryCountry: 'PY'
      }
    });

    const items = response.data.itemSummaries.map(i => ({
      titulo: i.title,
      precio: i.price?.value + ' ' + i.price?.currency,
      link: i.itemWebUrl
    }));

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en la búsqueda');
  }
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
