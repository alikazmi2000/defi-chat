import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import io from 'socket.io-client';
import { createDiffieHellman } from 'crypto-browserify';
const DH = createDiffieHellman(256)
function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);

  const [publicKey, setPublicKey] = useState(null);
  const [clientPublicKey, setClientPublicKey] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() !== '') {
      socket.emit('message', inputText.trim());
      setInputText('');
    }
  };
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
      // Listen for new messages from the server
      socket.on('message', (message) => {
        setMessages([...messages, message]);
      });
      socket.on('publicKey', (publicKey) => {
        const clientPublicKey = DH.generateKeys('hex');
        setPublicKey(publicKey);
        setClientPublicKey(clientPublicKey);
        console.log("This is a public key",clientPublicKey);
        debugger
        // Step 2: client sends its DH public key to server
        socket.emit('clientPublicKey', clientPublicKey);
      });

      // Step 3: client receives confirmation from server and generates shared secret
      socket.on('sharedSecret', (message) => {
        const sharedSecret = DH.computeSecret(publicKey, 'hex', 'hex');
        setSharedSecret(sharedSecret);
      });
    }
  }, [socket, publicKey, messages]);
  return (
    <Container>
      <Row>
        <Col>
          <h1>Chat App</h1>
          <div style={{ height: '400px', overflowY: 'scroll' }}>
            {messages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formMessage">
              <Form.Control
                type="text"
                placeholder="Enter message"
                value={inputText}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Send
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Chat;