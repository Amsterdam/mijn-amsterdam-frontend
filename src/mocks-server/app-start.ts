if (!process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'info';
}

await import('./app.ts');
