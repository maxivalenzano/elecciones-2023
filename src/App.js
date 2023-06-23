import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import Home from './Home';
// import Mesas from './Mesas';
import Resultados from './Resultados';

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='resultados' element={<Resultados />} />
                <Route path='mesas' element={<Home />} />

                <Route path='*' element={<NoMatch />} />
            </Route>
        </Routes>
    );
}

function Layout() {
    return (
        <div>
            <AppBar position='static' color='primary'>
                <Toolbar>
                    <Typography
                        variant='h6'
                        component={Link}
                        to='/'
                        sx={{ flexGrow: 1, color: 'white', textDecoration: 'none' }}
                    >
                        Elecciones 2023
                    </Typography>
                    <div>
                        <Button component={Link} to='/resultados' color='inherit'>
                            Resultados
                        </Button>
                        {/* <Button component={Link} to='/mesas' color='inherit'>
                            Mesas
                        </Button> */}
                    </div>
                </Toolbar>
            </AppBar>

            <hr />

            <Outlet />
        </div>
    );
}

function NoMatch() {
    return (
        <div>
            <h2>Nothing to see here!</h2>
            <p>
                <Link to='/'>Go to the home page</Link>
            </p>
        </div>
    );
}
