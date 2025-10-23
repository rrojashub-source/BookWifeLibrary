/**
 * Configuración PM2 para Biblioteca Moi (Producción)
 * 
 * IMPORTANTE: Las credenciales de base de datos están en el archivo .env
 * No se incluyen aquí por seguridad
 */

module.exports = {
  apps: [{
    name: 'biblioteca-moi',
    script: 'dist/index.js',  // Usar código compilado en producción
    
    // Variables de entorno
    // NOTA: Las credenciales reales están en .env (no se sube a GitHub)
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Opciones de PM2
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Reinicio automático en caso de error
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
