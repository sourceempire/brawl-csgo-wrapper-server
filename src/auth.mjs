import fs from 'fs';
import jwt from 'jsonwebtoken';

const APIKey = 'ww7f2puejmcuox9vgysw0zfr';
const privateKey = fs.readFileSync('jwt-rsa256.key');
const publicKey = fs.readFileSync('jwt-rsa256.key.pub');


function validAPIKey(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer g1jipjgi1ifjioj
      // Handle token presented as a Bearer token in the Authorization header
      return req.headers.authorization.split(' ')[1] === APIKey;
    } else {
      return false;
    }
}

export function checkAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();

  if (validAPIKey(req)) {
    next();
  } else {
    res.status(401);
    res.send('{"succeeded": false, "error": "unauthorized"}')
  }
}

export function generateJWT() {
  return jwt.sign({}, privateKey, { algorithm: 'RS256', expiresIn: 5*60 });  
}

export function validateJWT(token) {
  try {
    jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    return true;
  } catch(err) {
    console.log(err);
    return false;
  }
}

var allowedOrigins = ['http://localhost:8080', 'https://api.brawlgaming.com', 'https://brawl-gaming-server.herokuapp.com'];
export function cors(req, res, next) {
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) != -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://api.brawlgaming.com');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Origin, Content-Type, Accept, Authorization, Cache-Contro, X-XSRF-TOKEN');
  res.header('Access-Control-Allow-Credentials', true); 
  next();
}
