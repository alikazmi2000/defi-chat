
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import io from 'socket.io-client';
// import { createDiffieHellman } from 'crypto-browserify';
import CryptoJS from 'crypto-js';
import { generateKey, readPrivateKey, decryptKey, readKey, readKeys, readMessage, encrypt, PrivateKey, decrypt, createMessage } from 'openpgp';

const ChatPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [socket, setSocket] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [privateKeyVal, setPrivateKeyVal] = useState(null);
  const [armPrivateKey, setArmPrivateKey] = useState(null);
  const [armPublicKey, setArmPublicKey] = useState(null);
  const [messageBus, setMessageBus] = useState([]);
  const [armFriendPublicKey, setArmFriendPublicKey] = useState(null);
  const [clientPublicKey, setClientPublicKey] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);
  const [inputText, setInputText] = useState('');
  const user = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')) || {
    email: "dummy"
  };
  const token = useSelector(state => state.auth.token);
  const passphrase = "password";

  const generateKeys = async () => {
    const userId = {
      email: user.email,
      name: token,
      comment: token
    };

    const option = {
      userIDs: [userId],
      curve: "ed25519",
      passphrase
    };
    const { privateKey, publicKey } = await generateKey(option);
    setArmPrivateKey(privateKey);
    setArmPublicKey(publicKey);
    // console.log("Private",privateKey);
    console.log("public", publicKey);
    // let privateKeyObj = await readPrivateKey(privateKey)
    // console.log(privateKeyObj,publicKey)
    const pvt = await decryptKey({
      privateKey: await readPrivateKey({ armoredKey: privateKey }),
      passphrase
    });

    let pbl = await readKey({ armoredKey: publicKey })
    setPrivateKeyVal(pvt);
    setClientPublicKey(pbl);
    return publicKey
  };
  const encryptText = async (text) => {
    let pbl = await readKey({ armoredKey: armFriendPublicKey })
    let msg = await createMessage({ text })
    const ciphertext = await encrypt({
      message: msg,
      encryptionKeys: pbl,
      signingKeys: privateKeyVal,
      passwords: "password"

    });
    return ciphertext;
  }

  async function decryptMessage(text) {
    let pbl = await readKey({ armoredKey: armFriendPublicKey })
    let msg = await readMessage({ armoredMessage: text });
    const decrypted = await decrypt({
      message: msg,
      decryptionKeys: privateKeyVal,
      verificationKeys: pbl,
      passwords: passphrase

    });
    console.log("IS DECRYPTED",decrypted)
    return decrypted;
  }
  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    setSocket(newSocket);
    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      let intervalId = setInterval(() => {
        socket.emit("fetchPBL");
      }, 15000);
      // Listen for new messages from the server
      socket.on('message', (message) => {
        setMessages([...messages, message]);
      });
      socket.on('sendPublicKey', async () => {
        let pbl = await generateKeys()
        socket.emit('clientPublicKey', { email: user.email, pbl });
        // console.log("This is a public key", clientPublicKey);
        // Step 2: client sends its DH public key to server

      });
      socket.on("recieveMessage", async (data) => {
        // if (data.cipher) {
        //   setTimeout(async()=>{
        //     console.log("I have recieved a message",armFriendPublicKey);
        //     let decrypt = await decryptMessage(data.cipher)
        //     console.log(decrypt);

        //   },4000)
        // }
        setTimeout(()=>{
          setMessageBus(messageBus=>[...messageBus, {
            cipher: data.cipher,
            isDisplay: false,
            email: data.email
          }])
        },200)

        // if(data && data.user && data.user.email == user.email){

        // }

      })
      // Step 3: client receives confirmation from server and generates shared secret
      socket.on('SharedPublicKey',  (message) => {
        if (message && message.email != user.email) {
          console.log("EVENT-------------SharedPublicKey")
          console.log(message.socketConnect)
           setArmFriendPublicKey(message.socketConnect.pbl)
          console.log(armFriendPublicKey)
        }
      });

    }

  }, [socket]);
  const loopMessage = async(messages)=>{
    let arr =[]
    let isUpdated = false
    await Promise.all(messages.map(async e => {
      if (!e.isDisplay) {
        arr.push({
          ...e,
          isDisplay: true,
          message: await decryptMessage(e.cipher)
        })
        isUpdated = true
      }
      else
        arr.push(e)
    }))
    // return arr
    if(arr.length >0 && isUpdated){
      setMessageBus(arr);
      isUpdated = false;
    } 
    // setMessageBus(arr)

  }
  useEffect( () => {
     let arr = loopMessage(messageBus);
    //  console.log(arr);
    //  setMessageBus(arr);
  }, [messageBus, armFriendPublicKey])
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim() !== '') {
      // debugger
      let cipher = await encryptText(inputText.trim());
      // let textFile = await decryptMessage(cipher);
      socket.emit('sendMessage', { cipher, email: user.email });
      setInputText('');

    }
  };
  return (
    <Container>
      <Row>
        <Col>
          <h1>Chat App</h1>
          <div style={{ height: '400px', overflowY: 'scroll' }}>
            {messageBus.map((e, index) => (
              <p key={index}>{e?.email} {e?.message?.data}</p>
            ))}
          </div>
          <Form >
            <Form.Group controlId="formMessage">
              <Form.Control
                type="text"
                placeholder="Enter message"
                value={inputText}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button onClick={handleSubmit} variant="primary" >
              Send
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;


// import React, { useState, useEffect } from 'react';
// import { Container, Form, Button, Row, Col } from 'react-bootstrap';
// import io from 'socket.io-client';

// const ChatPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [socket, setSocket] = useState(undefined);
//   const [messages, setMessages] = useState([]);
//   const [publicKey, setPublicKey] = useState(null);
//   const [clientPublicKey, setClientPublicKey] = useState(null);
//   const [sharedSecret, setSharedSecret] = useState(null);
//   const [inputText, setInputText] = useState('');
//   const [dhWorker, setDhWorker] = useState(undefined);

//   useEffect(() => {
//     const newSocket = io('http://localhost:3001');
//     setSocket(newSocket);

//     // Clean up the socket connection when the component unmounts
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (socket) {
//       // Listen for new messages from the server
//       socket.on('message', (message) => {
//         setMessages([...messages, message]);
//       });
//       socket.on('publicKey', (recievedPublicKey) => {
//         if (recievedPublicKey ) {
//           const worker = new Worker(new URL('./deffihellmans.worker.js', import.meta.url));
//           worker.addEventListener('message', event => {
//             console.log('Worker said:', event.data);
//           });
//           worker.addEventListener('error', event => {
//             console.error('Worker error:', event);
//           });
//           // const worker = new Worker('/deffihellmansworker.js');
//           setDhWorker(worker);
//           debugger
//           // Step 2: client sends its DH public key to server
//           worker.postMessage({ type: 'setPublicKey', publicKey: recievedPublicKey });

//           // Listen for the worker to send back the client public key
//           worker.addEventListener('message', (event) => {
//             const cpublicKey = event.data.clientPublicKey;
//             setClientPublicKey(cpublicKey);

//             // Step 3: client receives confirmation from server and generates shared secret
//             socket.emit('clientPublicKey', cpublicKey);
//           });
//         }
//       });

//       // Listen for the server to send back the shared secret
//       socket.on('sharedSecret', (message) => {
//         const worker = new Worker(new URL('./deffihellmans.worker.js', import.meta.url));
//         setDhWorker(worker);

//         // Listen for the worker to send back the shared secret
//         worker.addEventListener('message', (event) => {
//           const sharedSecret = event.data.sharedSecret;
//           setSharedSecret(sharedSecret);
//         });

//         // Send the server's public key and the client's public key to the worker
//         worker.postMessage({ type: 'setPublicKeys', publicKey: publicKey, clientPublicKey: clientPublicKey });
//       });
//     }
//   }, [socket, publicKey, messages]);

//   const handleInputChange = (e) => {
//     setInputText(e.target.value);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (inputText.trim() !== '') {
//       if (sharedSecret && sharedSecret.length > 0) {
//         // Encrypt the message with the shared secret
//         dhWorker.postMessage({ type: 'encrypt', message: inputText.trim() });
//         dhWorker.addEventListener('message', (event) => {
//           const cipherText = event.data.cipherText;
//           socket.emit('message', cipherText);
//         });

//         setInputText('');
//       }
//     }
//   };

//   return (
//     <Container>
//       <Row>
//         <Col>
//           <h1>Chat App</h1>
//           <div style={{ height: '400px', overflowY: 'scroll' }}>
//             {messages.map((message, index) => (
//               <p key={index}>{message}</p>
//             ))}
//           </div>
//           <Form >
//             <Form.Group controlId="formMessage">
//               <Form.Control
//                 type="text"
//                 placeholder="Enter message"
//                 value={inputText}
//                 onChange={handleInputChange}
//               />
//             </Form.Group>
//             <Button onClick={handleSubmit} variant="primary" >
//               Send
//             </Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ChatPage;




// import React, { useState, useEffect } from 'react';
// import { Container, Form, Button, Row, Col } from 'react-bootstrap';
// import io from 'socket.io-client';
// import { createDiffieHellman } from 'crypto-browserify';
// import CryptoJS from 'crypto-js';

// const ChatPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [socket, setSocket] = useState(undefined);
//   const [messages, setMessages] = useState([]);
//   const [publicKey, setPublicKey] = useState(null);
//   const [clientPublicKey, setClientPublicKey] = useState(null);
//   const [sharedSecret, setSharedSecret] = useState(null);
//   const DH = createDiffieHellman(256)
//   const [inputText, setInputText] = useState('');

//   useEffect(() => {
//     const newSocket = io('http://localhost:3001');

//     setSocket(newSocket);
//     console.log('i am called this')
//     // Clean up the socket connection when the component unmounts
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (socket) {
//       // Listen for new messages from the server
//       socket.on('message', (message) => {
//         setMessages([...messages, message]);
//       });
//       socket.on('publicKey', (recievedPublicKey) => {
//         if (recievedPublicKey != publicKey) {
//           const cpublicKey = DH.generateKeys('hex');
//           setPublicKey(recievedPublicKey);
//           setClientPublicKey(cpublicKey);
//           socket.emit('clientPublicKey', cpublicKey);
//         }

//         // console.log("This is a public key", clientPublicKey);
//         // Step 2: client sends its DH public key to server

//       });

//       // Step 3: client receives confirmation from server and generates shared secret
//       socket.on('sharedSecret', (message) => {
//         // console.log("I am  publicKey recieved", publicKey)
//         const sharedSecret = DH.computeSecret(publicKey, 'hex', 'hex');
//         console.log("I am sharedSecret recieved", sharedSecret)

//         setSharedSecret(sharedSecret);
//       });
//     }
//   }, [socket]);
//   const handleInputChange = (e) => {
//     setInputText(e.target.value);
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (inputText.trim() !== '') {
//       debugger
//       let cipherText = null
//       console.log(sharedSecret)
//       if (sharedSecret && sharedSecret.length > 0) {
//         let sharedSecretText = new TextDecoder('iso-8859-1').decode(sharedSecret);
//         cipherText = CryptoJS.AES.encrypt(inputText.trim(), sharedSecretText);
//         console.info("MY NAME IS CIPEr", cipherText)
//         let decryptedText = CryptoJS.AES.decrypt(cipherText, sharedSecretText)
//         console.info("MY NAME IS Decrpyted CIPEr", decryptedText)

//         // socket.emit('message', cipherText);
//         setInputText('');
//       }

//     }
//   };
//   return (
//     <Container>
//       <Row>
//         <Col>
//           <h1>Chat App</h1>
//           <div style={{ height: '400px', overflowY: 'scroll' }}>
//             {messages.map((message, index) => (
//               <p key={index}>{message}</p>
//             ))}
//           </div>
//           <Form >
//             <Form.Group controlId="formMessage">
//               <Form.Control
//                 type="text"
//                 placeholder="Enter message"
//                 value={inputText}
//                 onChange={handleInputChange}
//               />
//             </Form.Group>
//             <Button onClick={handleSubmit} variant="primary" >
//               Send
//             </Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ChatPage;
