import CameraRoll from '@react-native-community/cameraroll';
import React, {useRef, useState} from 'react';
import {
  Alert, Modal, PermissionsAndroid,
  StyleSheet, Text, TextInput, ToastAndroid, TouchableWithoutFeedback, View
} from 'react-native';
import {Button} from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import {captureRef} from 'react-native-view-shot';
import {verifyToken, removeToken, exportDB, generateToken, importDB, saveToken} from '../services';

const MainMenu = ({navigation}) => {
  //====================  STATE VARIABLEs  =====================//
  const [iE, setShowImportExport] = useState(false);
  const [db, setDB] = useState('');
  const [finalData, setFinalData] = useState({});
  const [showQR, setShowQR] = useState(false);
  const [name, setName] = useState(null);
  const [num, setNum] = useState(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [verified, setVerified] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [ref,setRef] = useState();

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
    setGenerateModal(false);
    setShowQR(true);
  };


 
  //====================  GET PERMISSION  =====================//
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
    console.log('Downloading image...');
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
        ToastAndroid.show('Se guardó el codigo en la galeria', 300);
      }
    } catch (error) {
      console.log('error', error);
    }
  };


//====================  HANDLE SCAN  =====================//
  const handleScan = e => {
    let data = JSON.parse(e.data);
    verifyToken(data.token)
      .then(res => {
        setVerified(res);
      })
      .then(() => {
        removeToken(data.token);
        console.log(data)
        setScanned(true);
      });
  };


  return (
    <View style={styles.root}>
      <Button
        buttonStyle={styles.g_btn}
        onPress={() => {
          setGenerateModal(true);
        }}
        title="Generar Codigo"
      />
      <Button
        buttonStyle={styles.s_btn}
        title="Escanear Codigo"
        onPress={() => {
          setShowScanner(true);
        }}
      />
      <Button
        buttonStyle={styles.i_btn}
        title="Importar/Exportar"
        onPress={() => {
          setShowImportExport(true);
        }}
      />

      {/* GENERATE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={generateModal}
        onRequestClose={() => {
          setShowGenerateModal(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              placeholder="Nombre"
              value={name}
              style={styles.input}
              onChangeText={t => {
                setName(t);
              }}
            />
            <TextInput
              placeholder="Cantidad"
              value={num}
              style={styles.input}
              onChangeText={num => {
                setNum(num);
              }}
              keyboardType="numeric"
            />
            <Button
              buttonStyle={[
                styles.g_btn,
                {marginBottom: 10, marginTop: 10, width: 300},
              ]}
              title="Generar"
              onPress={() => {
                handleCode();
              }}
            />
          </View>
        </View>
      </Modal>

      {/* QR MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQR}
        onRequestClose={() => {
          setNum(null);
          setName('');
          setShowQR(false);
        }}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={downloadImage}>
            <View
              style={[styles.modalView, {backgroundColor: '#fff'}]}
              ref={viewRef}>
              <Text style={styles.codeHeader}>Fiesta Privada</Text>
              <Text style={styles.codeName}>{name}</Text>
              <Text style={styles.codeNum}>{`Personas: ${num}`}</Text>
              <QRCode size={300} value={finalData} getRef={c => (svg = c)} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      
      {/* IMPORT/EXPORT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={iE}
        onRequestClose={() => {
          setShowImportExport(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              value={db}
              placeholder="Data"
              onChangeText={data => {
                setDB(data);
              }}
              style={styles.input}
            />
            <View style={{flexDirection: 'row'}}>
              <Button
                buttonStyle={styles.ieBtn}
                onPress={() => {
                  importDB(db);
                  setShowImportExport(false);
                }}
                title="Importar"
              />
              <Button
                buttonStyle={styles.ieBtn}
                onPress={() => {
                  exportDB();
                  setShowImportExport(false);
                }}
                title="Exportar"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* SCANNER MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showScanner}
        onRequestClose={() => {
          setShowScanner(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <QRCodeScanner
              ref={node => {
                setRef(node);
              }}
              onRead={e => {
                handleScan(e);
              }}
            />
          </View>
        </View>
      </Modal>
      
      {/* SCANNED MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scanned}
        onRequestClose={() => {
          setScanned(false);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setScanned(false);
            ref.reactivate()
          }}>
          <View style={styles.centeredView}>
            <View
              style={[
                styles.modalView,
                {
                  backgroundColor: verified ? 'green' : 'red',
                  width: 300,
                  height: 300,
                },
              ]}>
              {verified ? (
                <Text style={styles.verifiedText}>Verificado!</Text>
              ) : (
                <Text style={styles.verifiedText}>
                  Codigo usado o inexistente!
                </Text>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
};;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#302F36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  g_btn: {
    height: 50,
    backgroundColor: 'green',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 32,
  },
  s_btn: {
    height: 50,
    backgroundColor: 'red',
    borderRadius: 10,
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
    backgroundColor: '#e8e8e8',
    width: 250,
    height: 40,
    margin: 12,
    padding: 10,
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

  i_btn: {
    height: 50,
    backgroundColor: 'blue',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 150,
  },
  ieBtn: {
    height: 50,
    backgroundColor: 'blue',
    borderRadius: 10,
    justifyContent: 'center',
    marginRight: 15,
  },
  verifiedText: {
    textAlign: 'center',
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default MainMenu
