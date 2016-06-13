from socket import *
import json
import hashlib 
import os

def fcs(filename):
	return hashlib.md5(open(filename, 'rb').read()).hexdigest()

def recvAndWriteFile(clientSocket, modifiedSentence,filename,buffers):
	clientSocket.send(modifiedSentence)
	modifiedSentence = clientSocket.recv(buffers)
	if modifiedSentence == 'File exists.' :
		buffers = buffers + 1
		modifiedSentence = 'file exists.'
	if modifiedSentence == 'file exists.' :
	    f = open(filename,'wb')
	    l=clientSocket.recv(buffers)
	    while (l) :
	        f.write(l)
	        if len(l) != buffers :
	            break
	        l = clientSocket.recv(buffers)
	    f.close
	    return filename
	else:
		return modifiedSentence

def recvSnapshot(clientSocket,buffers):

	clientSocket.send("update_snapshot")
	tmpStr = ""	
	modifiedSentence = ""

	modifiedSentence = clientSocket.recv(buffers)
	bufferincre = modifiedSentence[0:16]
	if bufferincre == 'Snapshot exists.':
		buffers = buffers + 1
		bufferincre = 'snapshot exists.'

	if bufferincre == 'snapshot exists.':
		tmpStr += modifiedSentence[16:len(modifiedSentence)]
		modifiedSentence = clientSocket.recv(buffers) 
		tmpStr += modifiedSentence
	else :
		print 'err in fetching snapshot'
		exit()

	while(len(modifiedSentence) == buffers):
		modifiedSentence = clientSocket.recv(buffers)
		tmpStr += modifiedSentence
	return tmpStr;

def server(serverName,serverPort,buffers,sentence,cert):
	
	clientSocket = socket(AF_INET, SOCK_STREAM)
	clientSocket.connect((serverName,serverPort))
	clientSocket.send(cert)

	if sentence == "update_snapshot" :
		Container = recvSnapshot(clientSocket,buffers)
		return Container
	elif sentence == "quit_server":
		clientSocket.send("quit_server")
		return "quit_server"
	else:
		filename = "Storage/" + sentence
		return recvAndWriteFile(clientSocket,sentence,filename,buffers)
	clientSocket.close()

def serve(serverName,serverPort,cmd,checksum,cert):
	
	buffers = 1024
	errCount = 5
	nowTried = 1
	OKflag = 0
	
	Container = server(serverName,serverPort,buffers,cmd,cert)
	if cmd == "update_snapshot":
		while nowTried < errCount and OKflag == 0:
			try:
				Containers = json.loads(Container)
				OKflag = 1
				return Containers
			except ValueError:
				Container = server(serverName,serverPort,Container,buffers,cmd)
				nowTried = nowTried + 1
		if nowTried >= errCount: 
			return 'Error Count Exceed'
	elif cmd == "quit_server":
		# do nothing
		return "quit_server"
	else:
		if Container == ("Storage/" + cmd):
			if fcs(Container) != checksum :
				os.remove(Container);
				return 'broken file'
			else:
				return 'All Green'
		elif Container == 'File doesn\'t exists.':
			return 'File doesn\'t exists.'
		else:
			return 'broken pipe'
