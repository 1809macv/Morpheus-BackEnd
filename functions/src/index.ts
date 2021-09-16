
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

// Creacion de Usuario de Autenticacion
// exports.newUser = functions.https.onCall ((data, context) => {
export const newUser = functions.https.onCall ((data, context) => {

    const _email = data.email;
    const _password = data.password;
    const _displayName = data.displayName;
    const _phoneNumber = data.phoneNumber;
    
    return auth.createUser({
      email: _email,
      emailVerified: false,
      password: _password,
      displayName: _displayName,
      disabled: false,
      phoneNumber: _phoneNumber,
      // photoURL: "http://www.example.com/12345678/photo.png",
    })
        .then( userCredential => {
          return {
            Ok: true,
            Code: userCredential.uid,
            Message: `Usuario Creado con el correo: ${_email}`
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          return {
            ok: false,
            errorCode: errorCode,
            message: errorMessage
          }
        });
  }
);


exports.updateUser = functions.https.onCall( (data, context) => {
  // const _email = data.email;
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
      Message: `Usuario actualizado con el email: ${_userEmail}`,
      // usuario: userCredential
    }
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;

    return {
      ok: false,
      errorCode: errorCode,
      errorMessage: errorMessage,
      // error: error
    }
  });
})

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
              console.log("Usario Creado en la coleccion Customer ", _userUId);
              return {
                Ok:true,
                Code: _userUId,
                Message: `Se creo en la coleccion Customer el cliente con UserUId : ${_userUId}`
              } 
            })
            .catch( (error) => {
              console.log("Error de creacion en la coleccion Customer! ", error);
              return {
                ok:false,
                errorCode: error.code,
                errorMessage: error.message
              }
            })
});


// Se ejecuta inmediatament despues de la eliminacion del usuario de autenticacion
exports.deleteCustomer = functions.auth.user().onDelete( async (user) => {
  return new Promise( (resolve, reject) => {
    console.log(`Usuario Eliminado : ${user.email}`);
    resolve(true);
  })
});


// Recupera una coleccion de un Customer por su Id
export const getCustomer = functions.https.onCall( (data, context) => {
  const _userUID = data.userUID;
  
  const customerRef = db.collection('Customer');

  // return customerRef.where("UserUId", "==", _userUID)
  return customerRef.doc(_userUID)
      .get()
      .then( (customer) => {
          console.log("Usuario recuperado: ", customer.data()); 
          return {
            Ok: true,
            Code: _userUID,
            Message: `Se recupero los datos del Customer con UserUid : ${_userUID}`
          } 
      })
      .catch( (error) => {
          console.log("Error, no se encontro el usuario con UID: ", _userUID);
          return {
            ok:false,
            errorCode: error.code,
            errorMessage: error.message
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
            Message: `Se actualizo los datos del Customer con UserUid : ${_userUId}`
          }}
        )
        .catch( (error) => {
          console.log("Error, No se actualizolos datos del usuario con UID: ", _userUId);
          return {
            ok:false,
            errorCode: error.code,
            errorMessage: error.message
          }}
        );
})

// Crea o Adiciona una subcoleccion de Cuentas de Bancos en la coleccion
// de Customer
exports.createAccountBankUser = functions.https.onCall( async (data, context) => {
  
  // const _userUID = data.userUID;
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
              Message: "Se creo exitosamente la colleccion Cta. de Banco del Customer."
            };
          })
          .catch( (error) => {
            console.log("No se pudo adicionar la cuenta de Banco del Customer: ", _userUID);

            return {
              ok: false,
              errorCode: error.errorCode,
              errorMessage: error.message
            };
          })
})


// Recupera la lista de los Cuentas de Bancos asociadas del Customer/Cliente
exports.getAccountBankCustomer = functions.https.onCall( (data,context) => {
  const _userUId = data.userUId;

  const accountBanksRef = db.collection("Customer").doc(_userUId);
  return  accountBanksRef.collection("AccountBankList").get()
        .then( accountList => {
          console.log(accountList);

          return {
            ok: true,
            errorCode: 0,
            errorMessage: "Recuperacion exitosa."
          }
        })
        .catch( (error) => {
          console.log("No se pudo adicionar la cuenta de Banco del Customer: ", _userUId);

          return {
            ok: false,
            errorCode: error.errorCode,
            errorMessage: error.message
          };
        })
  // const accountBankList = accountBankListSnap.
})

// Crea una coleccion de Transaccion de Compra/Venta de Moneda Nacional o Extranjera
// de un Customer/Cliente
exports.createCustomerTransaction = functions.https.onCall( (data, context) => {
  // const _userUId = (context.auth?.uid != undefined) ? data.UserUID : context.auth?.uid;
  const _userUID = context.auth?.uid || data.UserUID;
  const _transactionDate = data.TransactionDate;
  const _transactionNumber = data.TransactionNumber;
  const _accountSourceBankName = data.AccountSource.BankName;
  const _accountSourceBankAccount = data.AccountSource.BankAccount;
  const _accountSourceCurrency = data.AccountSource.Currency;
  const _accountSourceAmount = data.AccountSource.Amount;
  const _accountTargetBankName = data.AccountTarget.BankName;
  const _accountTargetBankAccount = data.AccountTarget.BankAccount;
  const _accountTargetCurrency = data.AccountTarget.Currency;
  const _accountTargetAmount = data.AccountTarget.Amount;
  const _typeOperation = data.TypeOperation;
  const _transferSourceBankName = data.TransferSource.BankName;
  const _transferSourceBankAccount = data.TransferSource.BankAccount;
  const _transferSourceCurrency = data.TransferSource.Currency;
  const _exchangeRateUsed = data.ExchangeRateUsed;

  const _transactionStatus = "INCOMPLETE";

  // console.log("Se asignaron todas las variables.");

  return db.collection("CustomerTransaction")
            .add({
                CustomerId: _userUID,
                TransactionDate: admin.firestore.Timestamp.fromMillis(
                  Date.parse(_transactionDate)
                ),
                TransactionNumber: _transactionNumber,
                AccountSource: {
                  BankName: _accountSourceBankName,
                  BankAccount: _accountSourceBankAccount,
                  Currency: _accountSourceCurrency,
                  Amount: _accountSourceAmount
                },
                AccountTarget: {
                  BankName: _accountTargetBankName,
                  BankAccount: _accountTargetBankAccount,
                  Currency: _accountTargetCurrency,
                  Amount: _accountTargetAmount
                },
                TypeOperation: _typeOperation,
                ExchangeRateUsed: _exchangeRateUsed,
                TransferSource: {
                  BankName: _transferSourceBankName,
                  BankAccount: _transferSourceBankAccount,
                  Currency: _transferSourceCurrency,
                  Amount: _accountSourceAmount
                },
                TransactionStatus: _transactionStatus

              })
            .then( (transaction) => {
              console.log("Transaccion creada exitosamente con Id: ", transaction.id);
              return {
                Ok: true,
                Code: transaction.id,
                Message: `Se creo exitosamente la transaccion en la colleccion de Transacciones con el Id: ${transaction.id}`
              };
            })
            .catch( (error) => {
              console.log("No se pudo actualizar la transacción: ", _userUID);

              return {
                ok: false,
                errorCode: error.errorCode,
                errorMessage: error.message
              };
            });
})


// Actualiza la transaccion completando los datos de la transferencia
// de la compañia hacia el Customer/Cliente
exports.updateCustomerTransaction = functions.https.onCall( (data, context) => {
  // const _userUId = data.UserUId;
  const _transactionId = data.TransactionId
  const _transferDate = data.TransferDate;
  const _transferNumber = data.TransferNumber;
  const _transferTargetBankName = data.TransferTarget.BankName;
  const _transferTargetBankAccount = data.TransferTarget.BankAccount;
  const _transferTargetCurrency = data.TransferTarget.Currency;
  const _transferTargetAmount = data.TransferTarget.Amount;
  const _transactionStatus = "COMPLETE";

  const transfer = db.collection("CustomerTransaction");

  return transfer.doc(_transactionId).update( {
    TransferDate: admin.firestore.Timestamp.fromMillis(
      Date.parse(_transferDate)
    ),
    TransferNumber: _transferNumber,
    TransferTarget: {
      BankName: _transferTargetBankName,
      BankAccount: _transferTargetBankAccount,
      Currency: _transferTargetCurrency,
      Amount: _transferTargetAmount,
    },
    TransactionStatus: _transactionStatus
  })
  .then( (transaction) => {
    console.log("Transaccion actualizada exitosamente con Id: ", _transactionId);

    return {
      Ok: true,
      Code: _transactionId,
      Message: `Se actualizo exitosamente la transaccion en la colleccion de Transacciones con el Id: ${_transactionId}`
    };
  })
  .catch( (error) => {
    console.log("No se pudo actualizar la transaccion: ", _transactionId);

    return {
      ok: false,
      errorCode: error.errorCode,
      errorMessage: error.message
    };
  })
})


// Recupera la lista de Transacciones con el Estado == "INCOMPLETE"
exports.getTransaction = functions.https.onRequest( async(request, response) => {
  const transactionRef = db.collection("CustomerTransaction");
  const transactionSnap = await transactionRef.where("TransactionStatus", "==", "COMPLETE").get();
  const transaction = transactionSnap.docs.map( trans => trans.data());

  response.json(transaction);

})

// Recupera la coleccion de Bancos
export const getBanks = functions.https.onRequest( async (request, response) => {
  // const banco = request.query.banco;
  // response.json({
  //     mensaje: banco
  //   });

  const banksRef = db.collection('Bank');
  const banksSnap = await banksRef.where("Active", "==", true).get();
  const banks = banksSnap.docs.map( bank => bank.data());

  response.json( banks );
});
