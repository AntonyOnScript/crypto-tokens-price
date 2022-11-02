import axios from 'axios'

const httpClient = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/'
})

export { httpClient as http }
