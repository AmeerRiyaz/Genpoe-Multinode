#!/usr/bin/python3

import os
import subprocess 
import time

baseFile='base.yaml'
os.environ['COMPOSE_PATH_SEPARATOR'] = ':'

ordererPath='../artifacts/orderer-org/'

# Code for starting Orderer
for file in os.listdir(ordererPath):
    
    dockerFolder=ordererPath + file + '/docker-config'
    print(dockerFolder)
    if os.path.isdir(dockerFolder):
        #print('ok.........')
        os.environ['COMPOSE_FILE']=dockerFolder + '/docker-orderer.yaml'
        
        #print('current working directory ' + os.getcwd())
        # local env file overwrite all other env files in the organisation
        cmd='cp .env ' + dockerFolder
        #print(cmd)
        stdoutdata = subprocess.getoutput(cmd)
        #print("stdoutdata: " + stdoutdata.split()[0])

        cmd='docker-compose up -d'
        stdoutdata = subprocess.getoutput(cmd)
        print("stdoutdata: " + stdoutdata.split()[0])

        # remove .env file 
        cmd='rm ' + dockerFolder + '/.env'
        #print(cmd)
        stdoutdata = subprocess.getoutput(cmd)
#    time.sleep(1)
    
#code For startng dockers for each organization

orgPath='../artifacts/organizations/'

for file in os.listdir(orgPath):

    if file == "DemoOrg" or file == "ActsOrg" or file == "CdachOrg":
        dockerFolder=orgPath + file + '/docker-config'
        print('...' + dockerFolder)
        if os.path.isdir(dockerFolder):
        
            # local env file overwrite all other env files in the organisation
            cmd='cp .env ' + dockerFolder
            #print(cmd)
            stdoutdata = subprocess.getoutput(cmd)

            for docFile in os.listdir(dockerFolder):
                if 'peer' in docFile :
                    print('++peer path' + dockerFolder+ '/' +docFile)
                    os.environ['COMPOSE_PATH_SEPARATOR'] = ':'
                    os.environ['COMPOSE_FILE']=dockerFolder + '/' + docFile + ':' + dockerFolder+ '/' +baseFile
                    print('compose file' + os.environ['COMPOSE_FILE'])
                    cmd='docker-compose up -d'
                    stdoutdata = subprocess.getoutput(cmd)
                    print("stdoutdata: " + stdoutdata.split()[0]) 
                if 'ca' in docFile :  
                    #print('...' + docFile)
                    os.environ['COMPOSE_FILE']=dockerFolder + '/' + docFile 
                    cmd='docker-compose up -d'
                    stdoutdata = subprocess.getoutput(cmd)
                    # time.sleep(1)
        
            # remove .env file 
            cmd='rm ' + dockerFolder + '/.env'
            #print(cmd)
            stdoutdata = subprocess.getoutput(cmd)
        
            print('All Dockers started .........')
