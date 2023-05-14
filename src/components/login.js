import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useDispatch,useSelector } from 'react-redux';
import { login,register } from '../store/slice/authSlice';
import {useNavigate} from 'react-router-dom'
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.token);
  const navigate = useNavigate();
  const dispatch =useDispatch();
  const handleSubmit = (event) => {
  
    event.preventDefault();
    dispatch(login({ email, password }));

    // Handle form submission here
  };
  useEffect(()=>{
    if(token && token != null){
      navigate('/chat')

    }
  },[isAuthenticated,token])

  return (
    <Container>
      <h1>{isLogin ? 'Log In' : 'Sign Up'}</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>

        <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need to create an account?' : 'Already have an account?'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
