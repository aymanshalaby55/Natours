/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
  console.log(data);
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/UpdateMe';

        // console.log(url)
        
    const res = await axios({
      method: 'PATCH',
      url,
      data,    
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type} successfuly Updated`);
      // send us back to home page if we logged in
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
