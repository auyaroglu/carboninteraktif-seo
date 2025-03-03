const { exec } = require('child_process');
const path = require('path');

// Next.js projesinin kök dizini
const projectRoot = __dirname;

// Next.js uygulamasını başlat
console.log('Next.js uygulaması başlatılıyor...');
const nextProcess = exec('npm start', { cwd: projectRoot });

nextProcess.stdout.on('data', (data) => {
  console.log(data);
});

nextProcess.stderr.on('data', (data) => {
  console.error(data);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js uygulaması kapandı. Çıkış kodu: ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT sinyali alındı. Uygulama kapatılıyor...');
  nextProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM sinyali alındı. Uygulama kapatılıyor...');
  nextProcess.kill();
  process.exit(0);
}); 