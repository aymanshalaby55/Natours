/*eslint-disable*/
import '@babel/polyfill'
import axios from  'axios';
import { showAlert } from './alerts';

export const login = async(email,password) =>{
    
  try {
    const res = await axios({
      method: 'POST',
      url : 'http://127.0.0.1:3000/api/v1/users/login',
      data : {
        email,
        password
      }
    });
    if (res.data.status === 'success'){
      showAlert('success','Logged in successfuly');
      // send us back to home page if we logged in
      window.setTimeout(() => {
        location.assign('/');
      }, 1500)
    }
  }
    catch(err){
      console.log(err);
      showAlert('error',err.response.data.message);
    }
}

export const logout = async() =>{
    
  try {
    const res = await axios({
      method: 'GET',
      url : 'http://127.0.0.1:3000/api/v1/users/logout'
    })
    if (res.data.status === 'success'){
      showAlert('success','Logged out successfuly');
      location.reload(true);
    }
  }
    catch(err){
      showAlert('error',err.response.data.message);
    }
}
