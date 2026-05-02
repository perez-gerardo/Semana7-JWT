import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes  from './routes/auth.routes.js';
import userRoutes  from './routes/users.routes.js';
import viewRoutes  from './routes/views.routes.js';
import seedRoles   from './utils/seedRoles.js';
import { seedUsers } from './utils/seedUsers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
// Materialize CSS servido localmente (sin CDN)
app.use('/materialize', express.static(path.join(__dirname, '../node_modules/materialize-css/dist')));

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// API routes
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);

// Frontend routes
app.use('/', viewRoutes);

// Global error handler (API)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

// 404 catch-all
app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true })
    .then(async () => {
        console.log('Mongo connected');
        await seedRoles();
        await seedUsers();
        console.log('Roles y usuarios inicializados');
        app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con Mongo:', err);
        process.exit(1);
    });
