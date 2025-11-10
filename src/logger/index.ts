import koffi from 'koffi';
import pino from 'pino';
import pretty from 'pino-pretty';

if (process.platform === 'win32') {
  const CP_UTF8 = 65001;
  const kernel32 = koffi.load('Kernel32');
  const setConsoleOutputCP = kernel32.func('SetConsoleOutputCP', 'bool', ['int']);
  const setConsoleCP = kernel32.func('SetConsoleCP', 'bool', ['int']);
  setConsoleOutputCP(CP_UTF8);
  setConsoleCP(CP_UTF8);
}

const stream = pretty({
  colorize: true,
  sync: true,
});

const logger = pino(stream);

export default logger;
