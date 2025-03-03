module.exports = {
  apps: [
    {
      name: 'carboninteraktif-seo',
      script: 'server.js', // Oluşturduğumuz server.js dosyasını kullan
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    }
  ]
}; 