import React, { useEffect } from 'react';
import './App.css';
import RootRoute from './components/Routes/index.routes';
import ApiService from './services/ApiService';
import { useAppDispatch } from './redux/hooks/useAppDispatch'; 



function App() {

  const dispatch = useAppDispatch()  

  useEffect(() => {
    document.title = "Saral Admin";
    ApiService.init();
  }, [])

  return (
    <div className=' p-1'>
      <RootRoute />
    </div>
  );
}

export default App;
