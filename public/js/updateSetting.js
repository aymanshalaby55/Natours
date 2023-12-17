/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:3000/api/v1/users/UpdateMe';

        console.log(url)
        
    const res = await axios({
      method: 'PATCH',
      url,
      data
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
