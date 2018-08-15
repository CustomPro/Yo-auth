const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('config');

const logsPath = path.join(process.cwd(), './logs');
const tsFormat = () => (new Date()).toLocaleTimeString();

if (!fs.existsSync(logsPath))
    fs.mkdirSync(logsPath);

winston.emitErrs = true;

function logger(module) {
    return new winston.Logger({
        transports : [
            new (require('winston-daily-rotate-file'))({
                level: config.mode === 'development' ? 'debug' : 'info',
                timestamp: tsFormat,
                datePattern: 'yyyy-MM-dd',
                prepend: true,
                filename: path.join(logsPath, '-all.log'),
                handleException: true,
                json: false,
                maxSize: 5242880, // 5mb
                maxFiles: 2,
                colorize: false
            }),
            new winston.transports.Console({
                level: config.mode === 'development' ? 'debug' : 'info',
                timestamp: tsFormat,
                label: getFilePath(module),
                handleException: true,
                colorize: true
            })
        ],
        exitOnError: false
    });
}

function getFilePath (module ) {
    //using filename in log statements
    return module.filename.split('/').slice(-2).join('/');
}

logger(module).debug('Logger initialized');

module.exports = logger;