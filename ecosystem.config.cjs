/**
 * Configuración PM2 para Biblioteca Moi
 * 
 * Este archivo resuelve el problema de ES modules con PM2
 * PM2 no maneja bien los ES modules por defecto, así que usamos
 * una configuración específica para que funcione.
 */

module.exports = {
  apps: [{
    name: 'biblioteca-moi',
    script: 'server/index.ts',
    
    // Usar tsx para ejecutar TypeScript directamente
    // tsx maneja ES modules correctamente
    interpreter: 'node',
    interpreter_args: '--import tsx',
    
    // Variables de entorno
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
