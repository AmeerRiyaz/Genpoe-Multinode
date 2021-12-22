// SPDX-License-Identifier: Apache-2.0

/*
  Property Management System Chaincode
 */

package main

/* Imports  
* 4 utility libraries for handling bytes, reading and writing JSON, 
formatting, and string manipulation  
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts  
*/ 
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
    "time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

/* Define Property structure, with 2 properties.  
Structure tags are used by encoding/json library
*/
type Property struct {
	Propid string `json:"propid"`
	Holder  string `json:"holder"`
    //Timestamp string `json:"timestamp"`
}

/*
 * The Init method *
 called when the Smart Contract "pms-chaincode" is instantiated by the network
 * Best practice is to have any Ledger initialization in separate function 
 -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method *
 called when an application requests to run the Smart Contract "pms-chaincode"
 The app also specifies the specific smart contract function to call with args
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryProperty" {
		return s.queryProperty(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordProperty" {
		return s.recordProperty(APIstub, args)
	} else if function == "queryAllProperty" {
		return s.queryAllProperty(APIstub)
	} else if function == "changePropertyHolder" {
		return s.changePropertyHolder(APIstub, args)
	} else if function == "getHistoryForPropID" {
		return s.getHistoryForPropID(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
 * The queryProperty method *
Used to view the records of one particular property
It takes one argument -- the key for the property in question
 */
func (s *SmartContract) queryProperty(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1 - the key")
	}

	propertyAsBytes, _ := APIstub.GetState(args[0])
	if propertyAsBytes == nil {
		return shim.Error("Could not locate property")
	}
	return shim.Success(propertyAsBytes)
}

/*
 * The initLedger method *
Will add test data (10 properties)to our network
 */
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	//		0			1
	//    Propid 	Holder
	property := []Property{
		Property{Propid: "923F", Holder: "Sandeep",},
		Property{Propid: "M83T", Holder: "Lakshmi"},
		Property{Propid: "T012", Holder: "Mahesh"},
		Property{Propid: "P490", Holder: "Jyostna"},
		Property{Propid: "S439", Holder: "Sai"},
		Property{Propid: "J205", Holder: "Chaithnaya"},
		Property{Propid: "S22L", Holder: "Sireesha"},
		Property{Propid: "EI89", Holder: "Vamsi"},
		Property{Propid: "129R", Holder: "Sunil"},
		Property{Propid: "49W4", Holder: "Murty"},
	}

	i := 0
	for i < len(property) {
		fmt.Println("i is ", i)
		propertyAsBytes, _ := json.Marshal(property[i])
		APIstub.PutState(strconv.Itoa(i+1), propertyAsBytes)
		fmt.Println("Created", property[i])
		i = i + 1
	}

	return shim.Success(nil)
}

/*
 * The recordProperty method *
Revenue and Stamps department would use to record property. 
This method takes in five arguments (attributes to be saved in the ledger). 
 */
func (s *SmartContract) recordProperty(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 2 - Propid and Holder")
	}

	var property = Property{ Propid: args[1], Holder: args[2] }

	propertyAsBytes, _ := json.Marshal(property)
	err := APIstub.PutState(args[0], propertyAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record property: %s", args[0]))
	}

	return shim.Success(nil)
}

/*
 * The queryAllProperty method *
allows for assessing all the records added to the ledger(all properties)
This method does not take any arguments. Returns JSON string containing results. 
 */
func (s *SmartContract) queryAllProperty(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999" // TODO for initial prototype this is enough

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":") // TODO
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllProperty:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
 * The changePropertyHolder method *
The data in the world state can be updated with who has possession. 
This function takes in 2 arguments, property id and new holder name. 
 */
func (s *SmartContract) changePropertyHolder(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2 - Key and New Holder")
	}

	propertyAsBytes, _ := APIstub.GetState(args[0])
	if propertyAsBytes == nil {
		return shim.Error("Could not locate property")
	}
	property := Property{}

	json.Unmarshal(propertyAsBytes, &property)
	// Normally check that the specified argument is a valid holder of property
	// we are skipping this check for this example
	property.Holder = args[1]

	propertyAsBytes, _ = json.Marshal(property)
	err := APIstub.PutState(args[0], propertyAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change property holder: %s", args[0]))
	}

	return shim.Success(nil)
}

/*
 * The getHistroryForPropID method *
This function takes in 1 argument i.e. the key. 
 */
func (s *SmartContract) getHistoryForPropID(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1 - key")
	}

	Propid := args[0]

	fmt.Printf("- start getHistoryForPropID: %s\n", Propid )

	resultsIterator, err := stub.GetHistoryForKey(Propid)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the Propid (propid)
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		buffer.WriteString(string(response.Value))

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getHistoryForPropID returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
 * main function *
calls the Start function 
The main function starts the chaincode in the container during instantiation.
 */
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}