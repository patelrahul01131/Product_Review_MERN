import React, {useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./Signup.css";

export default function Signup(){
  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState('reviewer');
  const nav = useNavigate();

  const submit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/auth/signup", {
      username,
      email,
      password,
      role: "reviewer"
    });
    console.log(res.data);
    alert('User Created');
    nav('/login')
  } catch (err) {
    console.error("Signup error:", err.response?.data || err.message);
    alert(err.response?.data?.message || 'Error');
  }
};

 return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Signup</h2>
        <form onSubmit={submit}>
          <input
            required
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="role-selection">
            <label>
              <input
                type="radio"
                checked={role === "poster"}
                onChange={() => setRole("poster")}
              />{" "}
              Poster
            </label>
            <label>
              <input
                type="radio"
                checked={role === "reviewer"}
                onChange={() => setRole("reviewer")}
              />{" "}
              Reviewer
            </label>
          </div>
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}
