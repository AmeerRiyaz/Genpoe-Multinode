#!/usr/bin/python3
import os
from docker_ca import findPrivateKey
from ruamel.yaml import round_trip_dump
from ruamel.yaml.util import load_yaml_guess_indent
from ruamel.yaml.scalarstring import DoubleQuotedScalarString

def createFolder(directory):
    try:
        if not os.path.exists(directory):
            os.makedirs(directory)
    except OSError:
        print ('Error: Creating directory. ' + directory)

# For Argument details refer crypto-config.yaml file
def createPeerCryptoConfigFile(inputFile,outputFile,orgName,orgDomain,caHostName,peerCount):

    # This is used to get double-quote for SANS value
    S = DoubleQuotedScalarString

    config, ind, bsi = load_yaml_guess_indent(open(inputFile))

    instances = config['PeerOrgs']
    instances[0]['Name'] = orgName
    instances[0]['Domain'] = orgDomain
    instances[0]['CA'] = {'Hostname': 'ca', 'Country' : 'IN', 'Province': 'Telangana',\
    'Locality': 'Hyderabad','OrganizationalUnit': 'CDAC Hyderabad', 'StreetAddress': \
    'Plot No. 6 & 7, Hardware Park, Sy No. 1/1, Via Keshavagiri (Post, Srisailam Hwy, Pahadi Shareef, Hyderabad, Telangana'}
    instances[0]['Template']= {'Count' : peerCount,'SANS' : [S('localhost'),S('127.0.0.1')]}
    instances[0]['Users']= {'Count' : 1}

    
    round_trip_dump(config, open(outputFile, 'w'), 
                                indent=ind, block_seq_indent=bsi)

# For Argument details refer crypto-config.yaml file
def createOrdererCryptoConfigFile(inputFile,outputFile,orgName,orgDomain,hostName):

    # This is used to get double-quote for SANS value
    S = DoubleQuotedScalarString

    config, ind, bsi = load_yaml_guess_indent(open(inputFile))

    instances = config['OrdererOrgs']
    instances[0]['Name'] = orgName
    instances[0]['Domain'] = orgDomain
    instances[0]['CA'] = {'Hostname': 'ca', 'Country' : 'IN', 'Province': 'Telangana',\
    'Locality': 'Hyderabad','OrganizationalUnit': 'CDAC Hyderabad', 'StreetAddress': \
    'Plot No. 6 & 7, Hardware Park, Sy No. 1/1, Via Keshavagiri (Post, Srisailam Hwy, Pahadi Shareef, Hyderabad, Telangana'}
    instances[0]['Specs']= [{'SANS' : [S('localhost'),S('127.0.0.1')], 'Hostname' : hostName }]
    

    round_trip_dump(config, open(outputFile, 'w'), 
                                indent=ind, block_seq_indent=bsi)


def renameAdminPrivateKey(folder):
    file=findPrivateKey(folder)
    os.rename(folder + file, folder + 'admin_sk')
