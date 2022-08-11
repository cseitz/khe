const { execSync } = require('child_process');
const { existsSync } = require('fs');

if (!existsSync('./dist')) {
    throw new Error('Exports is not yet built. Run `yarn workspace exports build`');
}

require('./dist').DependencyExports('*');