const fs = require('fs').promises;
const axios = require('axios');
const express = require('express');
const uuid = require('uuid');

// Creamos la aplicación con express
const app = express();

// Definimos ruta para archivos estáticos o assets
app.use(express.static('static'));

// Creamos función de llamado a la api y retorno de datos de usuarios random
async function api () {
        const llamado = await axios.get('https://randomuser.me/api');
        const datos = llamado.data.results[0];
        console.log(datos);
        return datos;
};

// Definimos rutas get, post, put y delete
// GET roommates devuelve contenido de db.json, el filtro se realiza en frontend
app.get('/roommates', async function(req, res) {
        let db = await fs.readFile('db.json', 'utf-8');
        res.send(db);
});

// GET gastos idem que GET roommates
app.get('/gastos', async function(req, res) {
        let db = await fs.readFile('db.json', 'utf-8');
        res.send(db);
});

// POST roommate llama a api randomuser, genera id único random
// y agrega nuevo usuario a db.json (lo lee y luego lo reescribe)
app.post('/roommate', async function(req, res) {
        const datos = await api();
        const nuevoroom = {
                id: uuid.v4(),
                nombre: `${datos.name.first} ${datos.name.last}`
        }
        // Escribir esto en el db.json
        let db = await fs.readFile('db.json', 'utf-8');
        db = JSON.parse(db);
        db.roommates.push(nuevoroom);
        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
        res.send(db);
});

// POST gastos agrega un nuevo gasto tomando la petición
// POST hecha en el frontend
app.post('/gasto', async(req, res) => {
        let body;
        req.on('data', (payload) => {
                body = JSON.parse(payload);
        });
        req.on('end', async() => {
                body.id = uuid.v4().slice(30);
                let db = await fs.readFile('db.json', 'utf-8');
                db = JSON.parse(db);
                db.gastos.push(body);
                await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
                res.send(db);
        })
})

// PUT gasto edita un gasto, recibiendo un objeto desde el frontend
// función updateGasto
app.put('/gasto', async function (req, res) {
        let body;
        let aidi;
        req.on('data', (payload) => {
                body = JSON.parse(payload);
                aidi = req.query.id;
        });
        
        req.on('end', async () => {
                let db = await fs.readFile('db.json', 'utf-8');
                db = JSON.parse(db);
                let gast = db.gastos;
                const match = gast.find(obj => obj.id == aidi);
                const indx = gast.indexOf(match);
                gast[indx].roommate = body.roommate;
                gast[indx].descripcion = body.descripcion;
                gast[indx].monto = body.monto;
                db.gastos = gast;
                await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
                res.send(db);
        });
        res.send('Hola desde Express');
});

// DELETE gasto borra un gasto
app.delete('/gasto', async function (req, res) {
        let aidi;
        aidi = req.query.id;
        let db = await fs.readFile('db.json', 'utf-8');
        db = JSON.parse(db);
        let gast = db.gastos;
        gast = gast.filter(obj => obj.id != aidi);
        db.gastos = gast;
        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
        res.send(db);
});

app.listen(3000, () => console.log('Servidor funcionando en el puerto 3000'));
