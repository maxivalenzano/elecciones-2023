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
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.info.light,
    fontWeight: 600,
    // color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {},
  [`&.${tableCellClasses.footer}`]: {
    backgroundColor: theme.palette.info.dark,
  },
}));

const StyledTableCellVotantes = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.info.light,
    fontWeight: 600,
    // color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    // backgroundColor: theme.palette.info.light,
  },
  [`&.${tableCellClasses.footer}`]: {
    backgroundColor: theme.palette.common.white,
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 4,
  },
}));

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   [`&.${tableCellClasses.head}`]: {
//     backgroundColor: theme.palette.action.hover,
//   },
//   [`&.${tableCellClasses.body}`]: {
//     backgroundColor: theme.palette.action.hover,
//   },
// }));

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

  const cantVotantes = votosTotal['Ruly'] + votosTotal['Blanco'];
  const cantVotosEPEP46 = votosEPEP46['Ruly'] + votosEPEP46['Blanco'];
  const cantVotosEPES34 = votosEPES34['Ruly'] + votosEPES34['Blanco'];

  return (
    <div>
      <h2>Resultados</h2>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell width="20%" padding="none"></StyledTableCell>
              <StyledTableCell padding="none" align="right">
                EPEP 46
              </StyledTableCell>
              <StyledTableCell padding="none" align="right">
                EPES 34
              </StyledTableCell>
              <StyledTableCell align="right">Total</StyledTableCell>
              <StyledTableCell align="right">{'(%)'}</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              <TableCell>Ruly</TableCell>
              <TableCell align="right">{votosEPEP46['Ruly']}</TableCell>
              <TableCell align="right">{votosEPES34['Ruly']}</TableCell>
              <TableCell align="right">{votosTotal['Ruly']}</TableCell>
              <TableCell padding="none" align="right">
                {((votosTotal['Ruly'] * 100) / cantVotantes).toFixed(1)}%
              </TableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TableCell>Isidro</TableCell>
              <TableCell align="right">{votosEPEP46['Isidro']}</TableCell>
              <TableCell align="right">{votosEPES34['Isidro']}</TableCell>
              <TableCell align="right">{votosTotal['Isidro']}</TableCell>
              <TableCell padding="none" align="right">
                {((votosTotal['Isidro'] * 100) / cantVotantes).toFixed(1)}%
              </TableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TableCell>Blanco</TableCell>
              <TableCell align="right">{votosEPEP46['Blanco']}</TableCell>
              <TableCell align="right">{votosEPES34['Blanco']}</TableCell>
              <TableCell align="right">{votosTotal['Blanco']}</TableCell>
              <TableCell padding="none" align="right">
                {((votosTotal['Blanco'] * 100) / cantVotantes).toFixed(1)}%
              </TableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TableCell>Negro</TableCell>
              <TableCell align="right">{votosEPEP46['Negro']}</TableCell>
              <TableCell align="right">{votosEPES34['Negro']}</TableCell>
              <TableCell align="right">{votosTotal['Negro']}</TableCell>
              <TableCell padding="none" align="right">
                {((votosTotal['Negro'] * 100) / cantVotantes).toFixed(1)}%
              </TableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TableCell></TableCell>
              <TableCell align="right"></TableCell>
              <TableCell align="right"></TableCell>
              <TableCell align="right"></TableCell>
              <TableCell align="right"></TableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCellVotantes>Cant. Votantes</StyledTableCellVotantes>
              <StyledTableCellVotantes align="right">{cantVotosEPEP46}</StyledTableCellVotantes>
              <StyledTableCellVotantes align="right">{cantVotosEPES34}</StyledTableCellVotantes>
              <StyledTableCellVotantes align="right">{cantVotantes}</StyledTableCellVotantes>
              <TableCell align="right"></TableCell>
            </StyledTableRow>
          </TableBody>
        </Table>

        <Table></Table>
      </TableContainer>
    </div>
  );
}
export default Resultados;
