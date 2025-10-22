-- Script de inicialización de base de datos para Biblioteca Moi
-- Este script crea el usuario inicial con la contraseña correctamente hasheada

-- Nota: Este script se ejecuta DESPUÉS de que Drizzle haya creado las tablas
-- con "npm run db:push"

-- Insertar usuario inicial "moi" con contraseña hasheada usando scrypt
-- Contraseña en texto plano: Delgado1509#
-- Hash generado con: scrypt(password, salt, 64)
-- Formato: hash.salt

INSERT INTO users (username, password, created_at)
VALUES (
  'moi',
  '46bea16c248db9877186c127a1b68e6aff7921036d158c2d77bc7b5d1d811a4c5cf6b4465f0f067ac946df12caf710d0a83bc52794963a41961f1cd687677c62.9ea8b8a5031f884b9723f020c3995186',
  NOW()
)
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password,
  created_at = EXCLUDED.created_at;

-- Verificar que el usuario se insertó correctamente
SELECT id, username, created_at FROM users WHERE username = 'moi';
