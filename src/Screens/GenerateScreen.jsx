import React, { useState,useRef } from 'react';
import {
  Text,
  TextInput,
  View,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ToastAndroid,
  PermissionsAndroid,
  StyleSheet,
} from 'react-native';
import {Button} from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';
import {generateToken,flushDB, saveToken} from '../services';
import {captureRef} from 'react-native-view-shot';
import CameraRoll from '@react-native-community/cameraroll';


export const GenerateScreen = () => {
  const [finalData, setFinalData] = useState({})
  const [showQR, setShowQR] = useState(false);
  const [name, setName] = useState(null);
  const [num, setNum] = useState(null);

  var svg = useRef();
  const viewRef = useRef();

  //====================  HANDLE CODE  =====================//
  const handleCode = () => {
    let token = generateToken(JSON.stringify({name, num}));
    let data = {
      name,
      num,
      token,
    };
    saveToken(token);
    setFinalData(JSON.stringify(data));
    setShowQR(true);
  }; 

  //====================  GET PERMISSIONs  =====================//
  const getPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Image Download Permission',
          message: 'Your permission is required to save images to your device',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      Alert.alert(
        '',
        'Your permission is required to save images to your device',
        [{text: 'OK', onPress: () => {}}],
        {cancelable: false},
      );
    } catch (err) {
      console.log('err', err);
    }
  };

  //====================  DOWNLOAD IMAGE  =====================//
  const downloadImage = async () => {
    console.log('Downloading image...')
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.8,
      });

      const granted = await getPermissionAndroid();
      if (!granted) {
        return;
      }
      const image = CameraRoll.save(uri, 'photo');
      if (image) {
        ToastAndroid.show('Se guardó el codigo en la galeria', 300)
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <View style={styles.root}>
      <TextInput
        placeholder="Nombre"
        value={name}
        onChangeText={n => {
          setName(n);
        }}
        style={styles.input}
      />
      <TextInput
        value={num}
        onChangeText={n => {
          setNum(n);
        }}
        style={styles.input}
        placeholder="Cantidad"
        keyboardType="numeric"
      />
      <Button
        onPress={() => {
          handleCode();
        }}
        title="Generar Codigo"
      />
    </View>
  );
};

//====================  STYLES  =====================//
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#302F36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#1d1d1d',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: 250,
    height: 40,
    margin: 12,
    padding: 10,
    backgroundColor:'#fff'
  },
  codeName: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  codeNum: {
    color: '#000',
    fontSize: 24,
  },
  codeHeader: {
    color: '#000',
  },
});


