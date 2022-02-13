import AsyncStorage from '@react-native-async-storage/async-storage';
import {ToastAndroid, Clipboard} from 'react-native';
const AES = require('react-native-crypto-js').AES;

//==================== FLUSH DB ====================//
export const flushDB = () => {
  AsyncStorage.setItem('@tokens', JSON.stringify([]));
};

//==================== GENERATE TOKEN ====================//
export const generateToken = data => {
  return AES.encrypt(data, 'simpleAttendance').toString();
};

//==================== SAVE TOKEN ====================//
export const saveToken = token => {
  getData().then(r => {
    let data = [];
    if (r.length !== 0) {
      data = JSON.parse(r);
    }

    data.push(token);
    AsyncStorage.setItem('@tokens', JSON.stringify(data))
      .then(() => {
        console.log('Successfuly saved!');
      })
      .catch(e => console.log(e));
  });
};
//==================== VERIFY TOKEN ====================//
export const verifyToken = token => {
  return getData().then(r => {
    if (r.length !== 0) {
      let data = JSON.parse(r);
      return data.includes(token);
    } else return false;
  });
};

//==================== REMOVE TOKEN ====================//
export const removeToken = token => {
  getData().then(r => {
    let data = JSON.parse(r);
    let newData = data.filter(t => t !== token);
    AsyncStorage.setItem('@tokens', JSON.stringify(newData));
  });
};
//==================== GET DATA ====================//
export const getData = async () => {
  const data = await AsyncStorage.getItem('@tokens')
    .then(res => {
      return res;
    })
    .catch(e => {
      console.log(e);
    });

  if (data) {
    return data;
  } else return [];
};
//==================== EXPRORT DB ====================//
export const exportDB = () => {
  getData().then(r => {
    Clipboard.setString(JSON.stringify(r));
    ToastAndroid.show('Datos copiados!', 300);
  });
};
//==================== IMPORT DB ====================//
export const importDB = db => {
  AsyncStorage.setItem('@tokens', JSON.parse(db)).then(() => {
    ToastAndroid.show('Base de datos actualizada', 300);
  });
};
