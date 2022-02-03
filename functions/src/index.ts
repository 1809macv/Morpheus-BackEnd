
// Configuracion para la conexion a Firebase
// y conexion a la base de datos
//==========================================================
import * as admin  from 'firebase-admin';
// import {query, where}  from 'firebase/firestore';
// import { firestore } from 'firebase-admin';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://morpheus-19cd4.firebaseio.com"
});
//==========================================================

import * as functions from "firebase-functions";

const db = admin.firestore();
const auth = admin.auth();

// Configuración
// Ignorar si se pasan parametros en el "data" de las funciones 
db.settings({ ignoreUndefinedProperties: true })

// Adicionamos Express y Cors
import * as express from 'express';
const cors = require('cors');

// Importacion: Middleware de validacion de token de Firebase
import { validateFirebaseIdToken } from "./authMiddleware";

// Creacion del servidor Express.
const app = express();

// Configurar CORS
// Los servicios RESTfull puedan ser llamados desde cualquier cliente.
app.use( cors() );
// Uso de Middleware
app.use( validateFirebaseIdToken );

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
// //   functions.logger.info("Hello logs!", {structuredData: true});
//   response.json(
//     {
//       error: false,
//       mensaje: 'Hola desde el mundo de CloudFunctions..!'
//     });
// });


// // Creacion de Usuario de Autenticacion
// // exports.newUser = functions.https.onCall ((data, context) => {
// export const newUser = functions.https.onCall ((data, context) => {

//     const _email = data.email;
//     const _password = data.password;
//     const _displayName = data.displayName;
//     // const _phoneNumber = data.phoneNumber;
    
//     return auth.createUser({
//       email: _email,
//       emailVerified: false,
//       password: _password,
//       displayName: _displayName,
//       disabled: false,
//       // phoneNumber: _phoneNumber,
//       // photoURL: "http://www.example.com/12345678/photo.png",
//     })
//         .then( userCredential => {
//           console.log('userCredential = > ', userCredential);
//           return {
//             Ok: true,
//             Code: userCredential.uid,
//             message: `Usuario Creado con el correo: ${_email}`
//           }
//         })
//         .catch((error) => {
//           console.log('Error => ', error);
//           return {
//             Ok: false,
//             errorCode: error.errorInfo.code,
//             message: error.errorInfo.message
//           }
//         });
//   }
// );


exports.updateUser = functions.https.onCall( (data, context) => {
  const _userUId = data.userUId;
  const _userEmail = data.userEmail;
  const _password = data.password;
  const _displayName = data.displayName;
  const _phoneNumber = data.phoneNumber;

  return auth.updateUser(_userUId, {
    email: _userEmail,
    password: _password,
    displayName: _displayName,
    phoneNumber: _phoneNumber,
    emailVerified: false,
    disabled: false,
  })
  .then( userCredential => {
    return {
      Ok: true,
      Code: _userUId,
      message: `Usuario actualizado con el email: ${_userEmail}`,
    }
  })
  .catch((error) => {
    return {
      Ok: false,
      Code: error.errorCode,
      message: error.errorMessage,
    }
  });
})


// Recupera una coleccion de un Customer por su Id
export const getCustomer = functions.https.onCall( (data, context) => {

  const _userUID = data.userUID;
  const customerRef = db.collection('Customer');

  return customerRef.doc(_userUID)
      .get()
      .then( (customer) => {
          console.log("Usuario recuperado: ", customer.data()); 
          return {
            Ok: true,
            Code: _userUID,
            message: `Se recupero los datos del Customer con UserUid : ${_userUID}`
          } 
      })
      .catch( (error) => {
          console.log("Error, no se encontro el usuario con UID: ", _userUID);
          return {
            Ok:false,
            Code: error.errorCode,
            message: error.errorMessage
          }
      });
})


// Actualiza la informacion de la coleccion de Customer/Cliente
exports.updateCustomer = functions.https.onCall( (data, context ) => {
  const _userUId = context.auth?.uid || data.userUId;
  const _displayName = data.displayName;
  const _phoneNumber = data.PhoneNumber;
  const _documentType = data.DocumentType;
  const _documentNumber = data.DocumentNumber;
  const _emailLogin = data.emailLogin;

  const customer = db.collection("Customer");

  return customer.doc(_userUId).update({
          CustomerName: _displayName,
          CustomerPhone: _phoneNumber,
          DcoumentNumber: _documentNumber,
          DocumentType : _documentType,
          EmailLogin: _emailLogin
        })
        .then( (userRecord) => {
          console.log("Usuario recuperado: ", userRecord); 
          return {
            Ok: true,
            Code: _userUId,
            message: `Se actualizo los datos del Customer con UserUid : ${_userUId}`
          }}
        )
        .catch( (error) => {
          console.log("Error, No se actualizolos datos del usuario con UID: ", _userUId);
          return {
            Ok:false,
            Code: error.errorCode,
            message: error.errorMessage
          }}
        );
})


// Crea o Adiciona una subcoleccion de Cuentas de Bancos en la coleccion
// de Customer
exports.createAccountBankUser = functions.https.onCall( async (data, context) => {
  
  const _userUID = context.auth?.uid || data.userUID;
  const _bankName = data.bankname;
  const _accountAlias = data.accountAlias;
  const _accountNumber = data.accountNumber;
  const _accountCurrency = data.accountCurrency;
  const _accountType = data.accountType;
  const _active = true;

  const userRef = db.collection('Customer');
  // const userSnap = await userRef.where("UserUId", "==", _userUID).get();
  // const _userId = userSnap.docs.map( _user => _user.id).toString();
  // console.log("User Id : ", _userId);
  
  return userRef.doc(_userUID).collection("AccountBankList").add({
            BankName: _bankName,
            AccountAlias: _accountAlias,
            AccountNumber: _accountNumber,
            AccountCurrency: _accountCurrency,
            AccountType: _accountType,
            Active: _active
          })
          .then( (accountBank) => {
            console.log("Cuenta Bancaria creada: ", accountBank.id);
            return {
              Ok: true,
              Code: accountBank.id,
              message: "Se creo exitosamente la colleccion Cta. de Banco del Customer."
            };
          })
          .catch( (error) => {
            console.log("No se pudo adicionar la cuenta de Banco del Customer: ", _userUID);

            return {
              ok: false,
              Code: error.errorCode,
              message: error.errorMessage
            };
          })
})


// Recupera la lista de los Cuentas de Bancos asociadas del Customer/Cliente
exports.getAccountBankCustomer = functions.https.onCall( (data, context) => {
  const _userUId = data.userUId;

  const accountBanksRef = db.collection("Customer").doc(_userUId);
  return  accountBanksRef.collection("AccountBankList").get()
        .then( accountList => {
          console.log(accountList);

          return {
            Ok: true,
            Code: 0,
            message: "Recuperacion exitosa."
          }
        })
        .catch( (error) => {
          console.log("No se pudo adicionar la cuenta de Banco del Customer: ", _userUId);

          return {
            Ok: false,
            Code: error.errorCode,
            message: error.errorMessage
          };
        })
})


// Actualiza la transaccion completando los datos de la transferencia
// de la compañia hacia el Customer/Cliente
exports.updateCustomerTransaction = functions.https.onCall( (data, context) => {
  
  const _transactionId = data.TransactionId;
  const _transferDate = data.TransferDate;
  const _transferNumber = data.TransferNumber;
  const _transactionStatus = "COMPLETE";

  const _transferTargetBankCode = data.TransferTarget.BankCode;
  const _transferTargetBankName = data.TransferTarget.BankName;
  const _transferTargetBankAccount = data.TransferTarget.BankAccount;
  const _transferTargetCurrency = data.TransferTarget.Currency;
  const _transferTargetAmount = data.TransferTarget.Amount;

  const transfer = db.collection("CustomerTransaction");

  return transfer.doc(_transactionId).update( {
    TransferDate: admin.firestore.Timestamp.fromMillis(
      Date.parse(_transferDate)
    ),
    TransferNumber: _transferNumber,
    TransactionStatus: _transactionStatus,

    TransferTarget: {
      BankCode: _transferTargetBankCode,
      BankName: _transferTargetBankName,
      BankAccount: _transferTargetBankAccount,
      Currency: _transferTargetCurrency,
      Amount: _transferTargetAmount,
    },
  })
  .then( (transaction) => {
    console.log("Transaccion actualizada exitosamente con Id: ", _transactionId);

    return {
      Ok: true,
      Code: _transactionId,
      message: `Se actualizo exitosamente la transaccion en la colleccion de Transacciones con el Id: ${_transactionId}`
    };
  })
  .catch( (error) => {
    console.log("No se pudo actualizar la transaccion: ", _transactionId);

    return {
      Ok: false,
      Code: error.errorCode,
      message: error.errorMessage
    };
  })
})


// Inserta una nueva coleccion con el tipo de cambio de compra/venta
// para dolares americanos
exports.insertExchangeRate = functions.https.onCall( (data, context) => {
  const _rateDate = data.RateDate;
  const _currencyFrom = data.CurrencyFrom;
  const _currencyTo = data.CurrencyTo;
  const _rateSale = data.rateSale;
  const _rateBuy = data.rateBuy;

  const exchangeRate = db.collection("ExchangeRate");

  return exchangeRate.add({
        RateDate: admin.firestore.Timestamp.fromMillis(
          Date.parse(_rateDate)
        ),
        CurrencyFrom: _currencyFrom,
        CurrencyTo: _currencyTo,
        BuyValue: _rateBuy,
        SaleValue: _rateSale
      })
      .then( (exchange) => {
        console.log(`Se creo exitosamente el tipo de cambio en la coleccion ExchangeRate, para la fecha: ${_rateDate}`);

        return {
          Ok: true,
          Code: exchange.id,
          message: `Tipo de cambio creada en la coleccion ExchangeRate con el id: ${exchange.id}`
        }
      })
      .catch( (error) => {
        console.log(`Error al crearse el tipo de Cambio para la fecha: ${_rateDate}`);

        return {
          ok: false,
          Code: error.errorCode,
          message: error.errorMessage
        }
      })
})


// Verifica el token del usuario, si expiro o no.
exports.verifyTokenId = functions.https.onCall( (data, context) => {
  const _tokenId = data.tokenId;
  
  return auth.verifyIdToken(_tokenId)
            .then( (decodedToken) => {
              // console.log("Fecha Hora de Login : ", new Date().setTime(decodedToken.auth_time).toString());
              // console.log("Fecha Hora de Login : ", new Date().setTime(decodedToken.exp).toLocaleString());
              return {
                Ok: true,
                Code: 'auth/id-token-verified',
                message: 'Token válido.'
              };
            })
            .catch( (error) => {
              // console.log("Error Verify Token => ", error );
              return {
                Ok: false,
                Code: error.errorInfo.code,
                message: 'Error de verificacion del Token o el Token ya expiro.'
              };
            });
});


// Recupera una coleccion de las Cuentas de los Bancos usados para realizar las
// transacciones de cambio de monedas de dolares a bolivianos y viceverssa (divisas).
// export const getCompanyAccount = functions.https.onRequest( async (request, response) => {
  export const getCompanyAccount = functions.https.onCall( async (data, context) => {
    const _currency = data.Currency;
    
    const accountRef = db.collection('CompanyAccount');
    const accountSnap = accountRef.where("AccountCurrency", "==", _currency).get();
    const accounts = (await accountSnap).docs.map( account => account.data());
  
    return accounts;
  })


// onRequest
//=====================================================================================

// // Recupera la lista de Transacciones con el Estado == "INCOMPLETE"
// exports.getTransaction = functions.https.onRequest( async(request, response) => {
//   const transactionRef = db.collection("CustomerTransaction");
//   const transactionSnap = await transactionRef.where("TransactionStatus", "==", "INCOMPLETE").get();
//   const transaction = transactionSnap.docs.map( trans => trans.data());

//   response.json(transaction);
// })


// Recupera el ultimo tipo de cambio
export const getExchangeRate = functions.https.onRequest ( async (request, response) => {

  // const _rateDate = request.query.RateDate;
  const RateDate = admin.firestore.Timestamp.fromDate(new Date());

  const exchangeRateRef = db.collection("ExchangeRate"); //.orderBy("RateDate", "desc").limit(1);
  const exchangeRateSanp = await exchangeRateRef.where("RateDate", "<=", RateDate).orderBy("RateDate", "desc").limit(1).get();
  const exchangeRate = exchangeRateSanp.docs.map( exchange => exchange.data());

  response.json(exchangeRate);
})


// Triggers
// ===================================================================================

// Creacion de usuario de la coleccion Customer,
// Se ejecuta inmediatamente despues de la creacion del usuario de autenticacion
exports.insertCustomer = functions.auth.user().onCreate( async (user) => {
  const _userUId = user.uid;
  const customerRef = db.collection('Customer');

  return customerRef.doc(_userUId)
            .set({
              CustomerName: user.displayName,
              CustomerEMail: user.email,
              CustomerPhone: user.phoneNumber,
              CustomerTpe: "PN",
              DocumentType: "NN",
              DocumentNumber: "0000000000",
            })
            .then( ( customer ) => {
              console.log('Customer => ', customer);
              return {
                Ok:true,
                Code: _userUId,
                // tokeId: 
                message: `Se creo en la coleccion Customer el cliente con UserUId : ${_userUId}`
              } 
            })
            .catch( (error) => {
              console.log("Error de creacion en la coleccion Customer: ", _userUId);
              return {
                Ok:false,
                Code: error.errorCode,
                message: error.errorMessage
              }
            })
});

// Se ejecuta inmediatamente despues de la eliminacion del usuario de autenticación
exports.deleteCustomer = functions.auth.user().onDelete( async (user) => {
  return new Promise( (resolve, reject) => {
    console.log(`Usuario Eliminado : ${user.email}`);
    resolve(true);
  })
});


// Servicios RestFull
// =====================================================

// Recupera una coleccion de las Cuentas de los Bancos usados para realizar las
// transacciones de cambio de monedas de dolares a bolivianos y viceverssa (divisas).
app.get('/companyaccount/:currency', async (req, res)=> {
  const _currency = req.params.currency;
  
  const accountRef = db.collection('CompanyAccount');
  const accountSnap = await accountRef.where("AccountCurrency", "==", _currency)
                          .where("Active", "==", true)
                          .get();
                          
  const accounts = accountSnap.docs.map( account => account.data());
  
  res.status(200).json(accounts) ;
})


//vRecuepra la lista de Bancos Activos
app.get('/banks', async (req, res) => {
  const banksRef = db.collection('Bank');
  const banksSnap = await banksRef.where("Active", "==", true).orderBy('BankName').get();
  const banks = banksSnap.docs.map( bank => {
            return { BankCode: bank.get('BankCode'), BankName: bank.get('BankName') }
        });
  res.json(banks);
})


// Recuepra la lista de las Transacciones con estado "INCOMPLETE" de todos los clientes
app.get('/transactions', async (req, res) => {
  const transactionRef = db.collection('CustomerTransaction');
  const transactionSnap = await transactionRef.where("TransactionStatus", "==", "INCOMPLETE").orderBy('TransactionDate').get();
  
  let _transaction: any[] = [];
  transactionSnap.forEach( (_tran) => {
    let id = _tran.id;
    let data = _tran.data();

    _transaction.push({ id, ...data });
  });

  res.status(200).send(JSON.stringify(_transaction));
})

// Actualiza la coleccion de Transacciones por Cliente
app.post('/transactions', (req, res) => {
  const _transaction = req.body;

  db.collection("CustomerTransaction")
            .add( _transaction )
            .then( (transaction) => {
              console.log("Transaccion creada exitosamente con Id: ", transaction.id);
              return {
                Ok: true,
                Code: transaction.id,
                message: `Se creo exitosamente la transaccion en la colleccion de Transacciones con el Id: ${transaction.id}`
              };
            })
            .catch( (error) => {
              console.log("No se pudo crear la transacción: ", _transaction.UserUID);
              return {
                Ok: false,
                Code: error.errorCode,
                message: error.errorMessage
              };
            });
  res.status(201).send();
})

exports.api = functions.https.onRequest( app );
