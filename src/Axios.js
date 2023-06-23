import axios from 'axios';

export default axios.create({
  baseURL: 'https://padron-sietepalmas-default-rtdb.firebaseio.com',
  headers: {
    'Content-type': 'application/json',
  },
});
