module.exports = {
  apps: [
    {
      name: 'carboninteraktif-seo',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_KEY: process.env.API_KEY,
        PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: 'logs/error.log',
      out_file: 'logs/output.log',
      merge_logs: true
    }
  ]
}; 