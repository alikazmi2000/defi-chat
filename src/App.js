import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router,Navigate,useNavigate ,Route, Routes } from 'react-router-dom';
import { createDiffieHellman } from 'crypto-browserify';
import CryptoJS from 'crypto-js';
import Login from './components/login'
import { useDispatch,useSelector } from 'react-redux';
import ChatPage from './components/chat'
// import PrivateRoute from './hoc/privateRoute';
import { Container } from 'react-bootstrap';
const DH = createDiffieHellman(256)
const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.token);

  // const user = useSelector(state => state.auth.user);
 
  const navigate = useNavigate();
  const [publicKey, setPublicKey] = useState(null);
  const [clientPublicKey, setClientPublicKey] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);
  const ProtectedRoute = ({
    isAuthenticated,
    redirectPath = '/',
    children,
  }) => {
    if (isAuthenticated) {
      return <Navigate to={redirectPath} replace />;
    }

    return children;
  };
  // useEffect(()=>{
  //   if(token && token !=null){
  //    setIsAuthenticated(true)
  //   }
  //  },[token])
  // const handleInputChange = (e) => {
  //   setInputText(e.target.value);
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (inputText.trim() !== '') {
  //     debugger
  //     let cipherText = null
  //     console.log(sharedSecret)
  //     if(sharedSecret && sharedSecret.length >0){
  //       let sharedSecretText = new TextDecoder('iso-8859-1').decode(sharedSecret);
  //       cipherText = CryptoJS.AES.encrypt(inputText.trim(),sharedSecretText);
  //       console.info("MY NAME IS CIPEr",cipherText)
  //       socket.emit('message', cipherText);
  //       setInputText('');
  //     }

  //   }
  // };
  // useEffect(() => {
  //   const newSocket = io('http://localhost:3001');

  //   setSocket(newSocket);

  //   // Clean up the socket connection when the component unmounts
  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (socket) {
  //     // Listen for new messages from the server
  //     socket.on('message', (message) => {
  //       setMessages([...messages, message]);
  //     });
  //     socket.on('publicKey', (publicKey) => {
  //       const clientPublicKey = DH.generateKeys('hex');
  //       setPublicKey(publicKey);
  //       setClientPublicKey(clientPublicKey);

  //       console.log("This is a public key",clientPublicKey);
  //       debugger
  //       // Step 2: client sends its DH public key to server
  //       socket.emit('clientPublicKey', clientPublicKey);
  //     });

  //     // Step 3: client receives confirmation from server and generates shared secret
  //     socket.on('sharedSecret', (message) => {
  //       console.log("I am  publicKey recieved",publicKey)
  //       const sharedSecret = DH.computeSecret(publicKey, 'hex', 'hex');
  //       console.log("I am sharedSecret recieved",sharedSecret)

  //       setSharedSecret(sharedSecret);
  //     });
  //   }
  // }, [socket, publicKey, messages]);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (event) => {
    // console.log(event);
    // handle login logic here
    // setIsAuthenticated(true);
  };

  const handleLogout = (event) => {
    // handle logout logic here
    // setIsAuthenticated(false);
  };
  return (
      <Routes>
        <Route path="/" element={
          <Login onLogin={handleLogin} />
        }>
        </Route>
        <Route
          path="/chat"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        {/* <PrivateRoute path="/chat" component={<ChatPage />} isAuthenticated={isAuthenticated} /> */}
      </Routes>

  );
}

export default App;
