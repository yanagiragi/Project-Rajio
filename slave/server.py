from socket import *
import readdir
import BaseServer
import getpass

def updateContainer(readDir):
	Container = readdir.update_info(readDir);
	return Container

if __name__ == "__main__":
	
	# parameters
	serverHost = '127.0.0.1'
	serverPort = 13010
	serverListenMaximum = 5
	serverTimeout = 5
	
	# tcp socket
	serverSocket = socket(AF_INET,SOCK_STREAM)
	serverSocket.setsockopt(SOL_SOCKET,SO_REUSEADDR,1)
	serverSocket.bind((serverHost,serverPort))
	serverSocket.listen(serverListenMaximum)
	
	readDir = './'
	Container = updateContainer(readDir)

	# parameters
	serverHost2 = '127.0.0.1'
	serverPort2 = 9001
	
	# tcp socket
	syncSocket = socket(AF_INET,SOCK_STREAM)
	syncSocket.connect((serverHost2,serverPort2))
	print 'start syncing...'
	
	serveinfo = "Serveinfo : { \"host\" : \"" + serverHost + "\" , \"port\" : \"" + str(serverPort) + "\"}";
	syncSocket.send(serveinfo);
	
	print 'start collecting snapshot ...'
	BaseServer.initsync(syncSocket,Container,1024);
	
	syncSocket.send("Done with sending snapshot.");
	# [imp] not doing "syncSocket.close()"
	# avoid closing socket to told Socket.io it is still alive

	#BaseServer.serve(serverSocket, Container,1024,getpass.getpass())
	BaseServer.serve(serverSocket, Container,1024,"kimagure_mercy")
