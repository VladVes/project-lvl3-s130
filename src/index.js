import fs from 'mz/fs';
import debug from 'debug';
import { makeName, getResponse, writeToFile, updateErrMessage } from './common';
import { fetchResources } from './resources';

export default (url, outputDir) => {
  const log = debug('page-loader: app');
  const resourcesDir = makeName(url, outputDir, '_files');
  const htmlFileName = makeName(url, outputDir, '.html');
  log('Starting %s', 'page-loader');
  log('Downloading... ', url);
  log('..to ', outputDir);

  return fs.mkdir(resourcesDir)
    .then(() => getResponse(url))
    .then(htmlPage => fetchResources(htmlPage, url, resourcesDir, htmlFileName))
    .then(dataColl => Promise.all(dataColl.map(el => writeToFile(el.data, el.location, el.type))))
    .then((flowMessages) => {
      log('Jobe well done');
      process.exitCode = 0;
      return flowMessages;
    })
    .catch((err) => {
      log(`Err: ${err.message}`);
      const userReadableErrMessage = updateErrMessage(err);
      return Promise.reject(userReadableErrMessage);
    });
};
