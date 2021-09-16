# Morpheus-BackEnd
BackEnd del proyecto Morpheus, desarrollado para Cloud Firestore.

Autor: Miguel Angel Caceres Valdivia

Este proyecto tiene la finalidad de aprender sobre Cloud Firestore, uso de la autenticacion de Firebasecode.

Tiene las siguientes funciones:

newUser: crea un nuevo usuario en la autenticacion de Firebase, enviando el email, password, Nombre y numero telefonico.

updateUser: actualiza la informacion del usuario de autenticacion de Firebase.

insertCustomer: crea un cliente en la coleccion Customer, esta funcion se dispara cuando se crea un usuario en la autenticacion de Firebase.

updateCustomer: actualiza los datos del cliente en la coleccion Customer, esta funcion se dispara al modificar los datos del usuario de autenticacion de Firebase.

deleteCustomer: Esta funcion se dispara al eliminar un usuario de autenticacion de Firebase. Solo muestra un mensaje de Usuario Eliminado concatenado con el email del usuario eliminado.

getCustomer: Esta funcion muestra un listado de los documentos (Clientes) de la collecion "Customer".

createAccountBankUser: Esta funcion agrega una subcoleccion en la coleccion de Customer (Cliente). La subcoleccion se llama AccountBankList.

getAccountBankCustomer: Esta funcion recupera la subcoleccion "AccountBankList" de la coleccion "Customer".

createCustomerTransaction: Esta funcion crea una transaccion de Cliente (documento) en la coleccion "CustomerTransaction".

updateCustomerTransaction: Esta funciion adiciona y actualiza informacion de la transaccion del cliente en la coleccion "CustomerTransaction"

getTransaction: Esta funcion recupera la lista de las traansaccion de la coleccion "CustomerTransaction".

getBanks: Esta funcion muestra un listado de los bancos de la coleccion "Bank".
