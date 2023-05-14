import { createDiffieHellman } from 'crypto-browserify';

const DH = createDiffieHellman(256);

const generateKeys = () => {
  console.log("Hello")
  const publicKey = DH.generateKeys('hex');
  return publicKey;
};

self.postMessage(generateKeys());
