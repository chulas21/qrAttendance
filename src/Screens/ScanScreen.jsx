import React, {useState, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {verifyToken, removeToken} from '../services';
import QRCodeScanner from 'react-native-qrcode-scanner';


const MainMenu = () => {
  const [verified, setVerified] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [ref,setRef] = useState();

  //====================  HANDLE SCAN  =====================//
  const handleScan = e => {
    let data = JSON.parse(e.data);
    verifyToken(data.token)
      .then(res => {
        setVerified(res);
      })
      .then(() => {
        removeToken(data.token);
        setScanned(true);
      });
  };

  return (
    <View style={styles.root}>
      <QRCodeScanner
        ref={node => {
          setRef(node)
        }}
        onRead={e => {
          handleScan(e);
        }}
      />
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
};

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
  verifiedText: {
    textAlign: 'center',
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default MainMenu;
