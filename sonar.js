const scanner = require('sonarqube-scanner');

// Usa scanner.scan() en lugar de scanner()
scanner.scan(
  {
    serverUrl: 'http://localhost:9000',
    token: 'sqp_097061d1f2c35054bea60bda39cc2c08ee538c97',
    options: {
      'sonar.projectKey': 'CrossworldsPage',
      'sonar.sources': './src',
    },
  },
  () => process.exit()
);