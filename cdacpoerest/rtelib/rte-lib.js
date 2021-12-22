
var log4js = require('log4js');
var logger = log4js.getLogger('rtelib');
//var libs = require('./rteHelper.js');
/** function is for raising an event **
 ** @category: 1. android, 2. blockchain **
 ** @eventName is the event to be raised under the selected category ***
 ** @data is the arguments in a json object **/

/** Events in Blockchain category are **
 **  1. createChannel **
 **  2. joinChannel **
 **  3. installCC **
 **  4. instantiateCC **
 **  5. invokeTransaction **
 **  6. userRegistration **
 **  7. createAsset **
 **  8. transferAsset ***/
module.exports = function rteEvents(socket){

    this.raiseEvent = function (category, eventName, data)
    {
        if (category == 'android') { // android based events
            console.log('selected category is android');
        } else if (category == 'blockchain') { // blockchain based events.. Clients emits to server
            switch(eventName) {
                case 'createChannel':
                    //console.log(data.ts + "::Emitted createChannel event");
                    logger.debug(data.ts + "::Emitted createChannel event");       
                    socket.emit('createChannel', 'blockchain', data);
                    break;
                case 'joinChannel':
                    //console.log(data.ts + '::Emitted joinChannel event');
                    logger.debug(data.ts + '::Emitted joinChannel event');
                    socket.emit('joinChannel', 'blockchain', data);
                    break;
                case 'installCC':
                   // console.log(data.ts + '::Emitted installCC event');
                    logger.debug(data.ts + '::Emitted installCC event');
                    socket.emit('installCC', 'blockchain', data);
                    break;
                case 'instantiateCC':
                   // console.log(data.ts + '::Emitted instantiateCC event');
                    logger.debug(data.ts + '::Emitted instantiateCC event');
                    socket.emit('instantiateCC', 'blockchain', data);
                    break;
                case 'upgradeCC':
                   // console.log(data.ts + '::Emitted upgradeCC event');
                    logger.debug(data.ts + '::Emitted upgradeCC event');
                    socket.emit('upgradeCC', 'blockchain', data);
                    break;
                case 'userRegistration':
                    //console.log(data.ts + '::Emitted userRegistration event');
                    logger.debug(data.ts + '::Emitted userRegistration event');
                    socket.emit('userRegistration', 'blockchain', data);
                    break;
                case 'createAsset':
                    //console.log(data.ts + '::Emitted createAsset event');
                    logger.debug(data.ts + '::Emitted createAsset event');
                    socket.emit('createAsset', 'blockchain', data);
                    break;
                case 'transferAsset':
                    //console.log(data.ts + '::Emitted transferAsset event');
                    logger.debug(data.ts + '::Emitted transferAsset event');
                    socket.emit('transferAsset', 'blockchain', data);
                    break;
		        case 'poe':
                    //console.log(data.ts + '::Emitted poe event');
                    logger.debug(data.ts + '::Emitted poe event');
                    socket.emit('poe', 'blockchain', data);
                    break;
		        case 'updatePoeTxId':
                    //console.log(data.ts + '::Emitted updatePoeTxId event');
                    logger.debug(data.ts + '::Emitted updatePoeTxId event');
                    socket.emit('updatePoeTxId', 'blockchain', data);
                    break;
		        case 'search':
                    //console.log(data.ts + '::Emitted search event');
                    logger.debug(data.ts + '::Emitted search event');
                    socket.emit('search', 'blockchain', data);
                    break;	
		        case 'ecSearch':
                    //console.log(data.ts + '::Emitted ecSearch event');
                    logger.debug(data.ts + '::Emitted ecSearch event');
                    socket.emit('ecSearch', 'blockchain', data);
                    break;
		        case 'poeSearch':
                    //console.log(data.ts + '::Emitted poeSearch event');
                    logger.debug(data.ts + '::Emitted poeSearch event');
                    socket.emit('poeSearch', 'blockchain', data);
                    break;
                default:
                    /*console.log('Invalid event. Please use any of these\n\
                                1. createChannel\n\
                                2. joinChannel\n\
                                3. installCC\n\
                                4. instantiateCC\n\
                                5. upgradeCC\n\
                                6. userRegistration\n\
                                7. createAsset\n\
                                8. transferAsset\n\
                                9. updatePoeTxId\n\
                                10. poe\n\
                                11. search\n\
                                12. ecSearch\n\
                                13. poeSearch');
                     */
                    logger.debug('Invalid event. Please use any of these\n\
                                1. createChannel\n\
                                2. joinChannel\n\
                                3. installCC\n\
                                4. instantiateCC\n\
                                5. invokeTransaction\n\
                                6. userRegistration\n\
                                7. createAsset\n\
                                8. transferAsset\n\
			    	            9. updatePoeTxId\n\
			    	            10. poe\n\
                                11. search\n\
                                12. ecSearch\n\
                                13. poeSearch'); 
                                // #endif
            }
        }

    }    
}

//Client can check the status of server
this.checkServerStatus = function (socket){
    socket.on('connect', () => {
        if(socket.connected)
            console.log('connection is there');
        else    
            console.log('NO connection');
        //console.log(socket.connected); // true
    });
}
