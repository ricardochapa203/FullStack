import request from 'supertest';
import app from '../server/index.js';

describe('Pruebas para endpoints de usuarios', () => {
  it('GET /users debe responder con status 200 y un arreglo', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /users debe crear un usuario y responder con status 201', async () => {
    const nuevoUsuario = {
      nombre: 'Test',
      correo: `test_${Date.now()}@example.com`,
      contraseña: '123456'
    };

    // Debes autenticarte para crear usuario, así que aquí deberías obtener un token válido
    // Por simplicidad, este test asume que tienes un endpoint de login y un usuario válido
    const loginRes = await request(app)
      .post('/api/login')
      .send({ correo: 'admin@mail.com', contraseña: 'adminpassword' });
    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevoUsuario);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
