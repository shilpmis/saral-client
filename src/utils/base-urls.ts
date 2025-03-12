let serverBaseUrl = '';
switch (__Mode__) {
  case 'production':
    serverBaseUrl = "https://saral-server-dev.melzo.com/"
    break;

  case 'development':
    serverBaseUrl = "https://saral-server-dev.melzo.com/"
    break;

  case 'localdb':
    serverBaseUrl = "http://localhost:3333/"
    break;

  default:
    serverBaseUrl = "https://saral-server-dev.melzo.com/"
    break;
}
const baseUrl = {
  serverUrl: "http://localhost:3333/"
};
export default baseUrl;