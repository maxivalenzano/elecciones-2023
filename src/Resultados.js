import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';
import { groupBy } from 'lodash';
import firebaseConfig from './firebaseConfig';

const getVotos = (mesas) => {
  return mesas.reduce((acc, mesa) => {
    mesa.candidatos.forEach((candidato) => {
      if (acc[candidato.nombre]) {
        acc[candidato.nombre] += candidato.votos;
      } else {
        acc[candidato.nombre] = candidato.votos;
      }
    });
    return acc;
  }, {});
};

function Resultados() {
  //   const [mesas, setMesas] = useState([]);
  //   const [groupedByLugar, setGroupedByLugar] = useState([]);
  //   const [loading, setLoading] = useState(false);
  const [votosEPEP46, setVotosEPEP46] = useState([]);
  const [votosEPES34, setVotosEPES34] = useState([]);
  const [votosTotal, setVotosTotal] = useState([]);
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  useEffect(() => {
    async function fetchData() {
      try {
        const dbRef = ref(database);
        get(child(dbRef, 'mesas/-NY_H_gWJmIzqDE9pGG9/listado'))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const response = snapshot.val();
              const auxGroupedData = groupBy(response, 'lugar');
              console.log('🚀 ~ file: Home.js:70 ~ .then ~ snapshot.val():', snapshot.val());
              console.log('🚀 ~ file: Home.js:16 ~ fetchData ~ auxGroupedData:', auxGroupedData);

              setVotosEPEP46(getVotos(auxGroupedData['EPEP 46']));
              setVotosEPES34(getVotos(auxGroupedData['EPES 34']));
              setVotosTotal(getVotos(response));
            } else {
              console.log('No data available');
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (e) {
        console.error('Home.js:14 ~ fetchData ~ e:', e);
      }
    }
    fetchData();
  }, [database]);
  return (
    <div>
      <h2>Resultados</h2>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="right">EPEP 46</TableCell>
              <TableCell align="right">EPES 34</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>Ruly</TableCell>
              <TableCell align="right">{votosEPEP46['Ruly']}</TableCell>
              <TableCell align="right">{votosEPES34['Ruly']}</TableCell>
              <TableCell align="right">{votosTotal['Ruly']}</TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>Isidro</TableCell>
              <TableCell align="right">{votosEPEP46['Isidro']}</TableCell>
              <TableCell align="right">{votosEPES34['Isidro']}</TableCell>
              <TableCell align="right">{votosTotal['Isidro']}</TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>Blanco</TableCell>
              <TableCell align="right">{votosEPEP46['Blanco']}</TableCell>
              <TableCell align="right">{votosEPES34['Blanco']}</TableCell>
              <TableCell align="right">{votosTotal['Blanco']}</TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>Negro</TableCell>
              <TableCell align="right">{votosEPEP46['Negro']}</TableCell>
              <TableCell align="right">{votosEPES34['Negro']}</TableCell>
              <TableCell align="right">{votosTotal['Negro']}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
export default Resultados;
