import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LogIn from "./Pages/LogIn";
import SignUp from "./Pages/SignUp";
import Layout from './Components/Layout';
import Home from './Pages/Home';
import Calendar1 from './Pages/Calendar';
import Gallery from './Pages/Gallery';
import Orders from './Pages/Orders';
import Dresses from './Pages/Dresses';
import Accessories from './Pages/Accessories';
import MyDetails from './Pages/MyDetails';
import Users from './Pages/Users';
import ContactUs from './Pages/ContactUs'
import ChangePassword from './Pages/ChangePassword';
import TimeManagement from './Pages/TimeManagement';
import { getData } from './../Fetch';

export const UserContext = createContext();

function App() {
  const [userData, setUserData] = useState({});
  useEffect(() => {
    
  }, []);

  return (
    <UserContext.Provider value={userData}>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/logIn" element={<LogIn setUserData={setUserData} />} />
            <Route path="/signUp" element={<SignUp setUserData={setUserData} />} />
            <Route path="/" element={<Layout setUserData={setUserData} />} >
              <Route index element={<Home setUserData={setUserData} />} />
              <Route path="/calendar" element={<Calendar1 />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/dresses" element={<Dresses />} />
              <Route path="/users" element={<Users />} />
              <Route path="/changePassword" element={<ChangePassword />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/myDetails" element={<MyDetails />} />
              <Route path="/ContactUs" element={<ContactUs />} />
              <Route path="/TimeManagement" element={<TimeManagement />} />
              
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
