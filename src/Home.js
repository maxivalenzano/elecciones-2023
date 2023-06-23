import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Container, InputLabel, Select, TextField, Typography } from '@mui/material';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get, update } from 'firebase/database';
import { groupBy } from 'lodash';
import firebaseConfig from './firebaseConfig';

const MAX_VOTOS = 350;

const Home = () => {
  const [mesas, setMesas] = useState([]);
  const [groupedByLugar, setGroupedByLugar] = useState([]);
  const [selectedCandidatos, setSelectedCandidatos] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const fetchData = useCallback(() => {
    const dbRef = ref(database);
    get(child(dbRef, 'mesas/-NY_H_gWJmIzqDE9pGG9/listado'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const response = snapshot.val();
          const auxGroupedData = groupBy(response, 'lugar');
          setGroupedByLugar(auxGroupedData);
          setMesas(response);
          console.log('Home ~ fetchData ~ GroupedData:', auxGroupedData);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [database]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    setSaved(false);
    setLoading(true);
    const findCandidatos = mesas.find((item) => item.numero.toString() === event.target.value);

    setSelectedMesa(event.target.value);
    setSelectedCandidatos(findCandidatos?.candidatos || []);
  };

  const handleVotosChange = ({ target: { value } }, candidatoId) => {
    setSaved(false);
    setLoading(false);
    const updatedCandidatos = selectedCandidatos.map((candidato) => {
      if (candidato.id === candidatoId) {
        let inputVotos = parseInt(value);

        if (inputVotos < 0) {
          inputVotos = 0;
        } else if (inputVotos > MAX_VOTOS) {
          inputVotos = MAX_VOTOS;
        }

        return { ...candidato, votos: inputVotos };
      }
      return candidato;
    });
    setSelectedCandidatos(updatedCandidatos);
  };

  const handleSaveVotosChange = () => {
    setLoading(true);
    const updatedCandidatos = selectedCandidatos.reduce((acc, candidato) => {
      acc[`${candidato.id}/votos`] = candidato.votos || 0;
      return acc;
    }, {});
    const mesaId = mesas.find((item) => item.numero.toString() === selectedMesa).id;

    const dbRef = ref(database);

    update(
      child(dbRef, `mesas/-NY_H_gWJmIzqDE9pGG9/listado/${mesaId}/candidatos`),
      updatedCandidatos
    )
      .then(() => {
        console.log('Candidatos actualizados correctamente.');
        fetchData();
      })
      .catch((error) => {
        console.error('Error al actualizar los candidatos:', error);
      })
      .finally(() => {
        setLoading(false);
        setSaved(true);
      });
  };

  return (
    <Container>
      <Box pb={2} alignItems="center">
        <InputLabel shrink={true} id="select-label">
          Seleccionar mesa
        </InputLabel>
        <Select
          native
          labelId="select-label"
          fullWidth
          value={selectedMesa}
          onChange={handleChange}
        >
          <option disabled value="">
            Seleccione una mesa
          </option>
          {Object.entries(groupedByLugar).map(([lugar, mesas]) => {
            return (
              <optgroup label={lugar} key={lugar}>
                {mesas.map((mesa) => (
                  <option key={mesa.numero} value={mesa.numero}>
                    {mesa.nombre}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </Select>
      </Box>
      <Box>
        {selectedMesa &&
          selectedCandidatos.map((candidato) => {
            return (
              <Box key={candidato.id} display="flex" alignItems="center" py={2}>
                <Box minWidth={80}>
                  <Typography>{candidato.nombre}</Typography>
                </Box>
                <TextField
                  type="number"
                  id={`votos-${candidato.id}`}
                  label="Votos"
                  value={candidato.votos}
                  onChange={(event) => handleVotosChange(event, candidato.id)}
                />
              </Box>
            );
          })}
      </Box>
      <Box alignItems="center" py={2}>
        {selectedMesa && (
          <Button
            disabled={loading || saved}
            variant="contained"
            fullWidth
            onClick={handleSaveVotosChange}
            style={{ backgroundColor: saved ? 'green' : null, color: saved ? 'white' : null }}
          >
            {saved ? 'Guardado' : 'Guardar'}
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Home;
