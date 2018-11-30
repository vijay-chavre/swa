import jsonp from 'jsonp';

export default function requestJSONP(url, options = null) {
  return new Promise((resolve, reject) => {
    jsonp(url, options, (error, data) => {
      if (error) {
        return reject(error);
      }

      return resolve(data);
    });
  });
}
