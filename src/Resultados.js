import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';
import { groupBy } from 'lodash';
import firebaseConfig from './firebaseConfig';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import { Constants } from './Constants';

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

function Resultados() {
    const [listaCandidatos] = useState(Object.keys(Constants.candidatos));
    const [votosEPEP46, setVotosEPEP46] = useState([]);
    const [votosEPES34, setVotosEPES34] = useState([]);
    const [votosTotal, setVotosTotal] = useState([]);
    const [mesas, setMesas] = useState([]);
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, Constants.primariasKey));

                if (snapshot.exists()) {
                    const response = snapshot.val();
                    const auxGroupedData = groupBy(response, 'lugar');

                    setMesas(response);
                    setVotosEPEP46(getVotos(auxGroupedData['EPEP 46']));
                    setVotosEPES34(getVotos(auxGroupedData['EPES 34']));
                    setVotosTotal(getVotos(response));
                } else {
                    console.log('No data available');
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [database]);

    const calcularSumaDeVotos = (datosDeVotos, candidates) => {
        return candidates.reduce((sumaTotal, candidato) => sumaTotal + (parseFloat(datosDeVotos[candidato]) || 0), 0);
    };

    const cantVotantes = calcularSumaDeVotos(votosTotal, listaCandidatos);
    const cantVotosEPEP46 = calcularSumaDeVotos(votosEPEP46, listaCandidatos);
    const cantVotosEPES34 = calcularSumaDeVotos(votosEPES34, listaCandidatos);

    const getPorcentVotos = (nombre) => {
        if (cantVotantes > 0) {
            const percent = (votosTotal[nombre] * 100) / cantVotantes;
            const toFixed = percent.toFixed(1);
            return `${toFixed}%`;
        } else {
            return '0%';
        }
    };

    return (
        <div>
            <h2>Resultados</h2>
            <TableContainer component={Paper}>
                <Table aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell width='20%' padding='none' />
                            <StyledTableCell padding='none' align='right'>
                                EPEP 46
                            </StyledTableCell>
                            <StyledTableCell padding='none' align='right'>
                                EPES 34
                            </StyledTableCell>
                            <StyledTableCell align='right'>Total</StyledTableCell>
                            <StyledTableCell align='right'>{'(%)'}</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listaCandidatos.map((candidato) => (
                            <StyledTableRow key={candidato}>
                                <TableCell>{Constants.candidatos[candidato]}</TableCell>
                                <TableCell align='right'>{votosEPEP46[candidato]}</TableCell>
                                <TableCell align='right'>{votosEPES34[candidato]}</TableCell>
                                <TableCell align='right'>{votosTotal[candidato]}</TableCell>
                                <TableCell align='right'>{getPorcentVotos(candidato)}</TableCell>
                            </StyledTableRow>
                        ))}
                        <StyledTableRow>
                            <TableCell align='right' />
                            <TableCell align='right' />
                            <TableCell align='right' />
                            <TableCell align='right' />
                            <TableCell align='right' />
                        </StyledTableRow>
                        <StyledTableRow>
                            <StyledTableCellVotantes>Cantidad Votantes</StyledTableCellVotantes>
                            <StyledTableCellVotantes align='right'>{cantVotosEPEP46}</StyledTableCellVotantes>
                            <StyledTableCellVotantes align='right'>{cantVotosEPES34}</StyledTableCellVotantes>
                            <StyledTableCellVotantes align='right'>{cantVotantes}</StyledTableCellVotantes>
                            <TableCell align='right' />
                        </StyledTableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <h2>Resultados por mesas </h2>

            <TableContainer component={Paper}>
                <Table aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Mesas</StyledTableCell>

                            {listaCandidatos.map((nombre) => (
                                <StyledTableCell align='right'>{Constants.candidatos[nombre]}</StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mesas.map((pollingStation) => {
                            return (
                                <StyledTableRow key={pollingStation.id}>
                                    <TableCell>
                                        {pollingStation?.lugar?.replace(/ /g, '') || ''} {pollingStation.nombre}
                                    </TableCell>
                                    {listaCandidatos.map((key) => {
                                        const findCandidatos = pollingStation.candidatos.find(
                                            (candidatos) => candidatos.nombre === key
                                        );
                                        return <TableCell align='right'>{findCandidatos?.votos}</TableCell>;
                                    })}
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
export default Resultados;
