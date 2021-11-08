import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  PermissionsAndroid,
  Alert,
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button} from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';
import {generateToken,flushDB, saveToken, verifyToken, removeToken, importDB, exportDB} from '../services';
import {captureRef} from 'react-native-view-shot';
import CameraRoll from '@react-native-community/cameraroll';
import QRCodeScanner from 'react-native-qrcode-scanner';

const MainMenu = ({navigation}) => {
  const [showGenerate, setShowGenerate] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [name, setName] = useState(null);
  const [num, setNum] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const [showScanner, setShowScanner] = useState(null);
  const [verified, setVerified] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [iE, setShowImportExport] = useState(false);
  const [db, setDB] = useState('');

  var svg = useRef();
  const viewRef = useRef();

  const handleCode = () => {
    let token = generateToken(JSON.stringify({name, num}));
    let data = {
      name,
      num,
      token,
    };
    saveToken(token);
    setFinalData(JSON.stringify(data));
    setShowGenerate(false);
    setShowQR(true);
  };
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
        Alert.alert(
          '',
          'Image saved successfully.',
          [{text: 'OK', onPress: () => {}}],
          {cancelable: false},
        );
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleScan = e => {
    let data = JSON.parse(e.data);
    verifyToken(data.token)
      .then(res => {
        setVerified(res);
      })
      .then(() => {
        removeToken(data.token);
        setShowScanner(false);
        setScanned(true);
      });
  };

  return (
    <View style={styles.root}>
      <Button
        buttonStyle={styles.g_btn}
        onPress={() => {
          navigation.navigate("Generate")
        }}
        title="Generar Codigo"
      />
      <Button
        buttonStyle={styles.s_btn}
        title="Escanear Codigo"
        onPress={() => {
          navigation.navigate("Scan")
        }}
      />
      <Button
        buttonStyle={styles.i_btn}
        title="Importar/Exportar"
        onPress={() => {
          setShowImportExport(true);
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={showGenerate}
        onRequestClose={() => {
          setShowGenerate(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
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
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQR}
        onRequestClose={() => {
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
              onRead={e => {
                handleScan(e);
              }}
            />
          </View>
        </View>
      </Modal>
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
                }}
                title="Exportar"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  verifiedText: {
    textAlign: 'center',
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
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
});

export default MainMenu
