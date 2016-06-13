from socket import *
import select
import gevent
from gevent import monkey
from gevent import Greenlet
import json
import hashlib
import errno
from os import stat

def initsync(connectionSocket,Container,buffers):
	tmpStr = updateSnapshot(Container);
	
	lens, tmpStr = 0, updateSnapshot(Container)
	
	while lens < len(tmpStr):
		connectionSocket.send(tmpStr[lens:lens+buffers])
		#print (tmpStr[lens:lens+buffers])
		lens += buffers
	print '\t> Sync Done.'

def updateSnapshot(Container):
	MainContainer = {}
	for i in Container:
		tmpContainer = {}
		tmpContainer['FCS'] = hashlib.md5(open(Container[i][0], 'rb').read()).hexdigest()
		#tmpContainer['name'] =  Container[i][1].name
		tmpContainer['title'] =  Container[i][1].title
		tmpContainer['artist'] = Container[i][1].artist
		tmpContainer['album'] =  Container[i][1].album
		tmpContainer['album_artist'] =  Container[i][1].album_artist
		tmpContainer['track'] = Container[i][1].track[0]
		MainContainer[Container[i][1].name] = tmpContainer
	tmpstr = json.dumps(MainContainer)
	return tmpstr

def serve(serverSocket, Container,buffers,Certificate):
	
	timeout = 5

	monkey.patch_all()
	print 'buffer = ',buffers

	while 1:
		connectionSocket, addr = serverSocket.accept()
		connectionSocket.settimeout(timeout);

		# Command to be Done
		sentence = connectionSocket.recv(len(Certificate))
		if len(sentence) >= len(Certificate) and sentence[0:len(Certificate)] == Certificate:
			sentence = connectionSocket.recv(buffers)
			#sentence = sentence[len(Certificate):len(sentence)]
		else:
			print 'Rejected'
			connectionSocket.close()

		print 'request = ',sentence

		if sentence == 'quit_server' :
			print "\t> Server shutdown by cilent (%s,%s)" % (connectionSocket.getpeername())
			connectionSocket.close()
			exit()
		elif sentence == 'update_snapshot':
			print '\t> Request: updating SnapShot'
			lens, tmpStr = 0, updateSnapshot(Container)
			if len(tmpStr) == buffers :
				buffers = buffers + 1
				connectionSocket.send('Snapshot exists.')
			else:
				connectionSocket.send('snapshot exists.')
			
			while lens < len(tmpStr):
				connectionSocket.send(tmpStr[lens:lens+buffers])
				#print lens
				#print (tmpStr[lens:lens+buffers])
				lens += buffers
			print '\t> Done.'
		else:
			if (sentence in Container) and Container[sentence] != None :
				print '\t> Response : Yes'
				print '\t> Sending File : ',sentence
				g = Greenlet(sendData,connectionSocket, Container[sentence][0],buffers)
				g.start()
				g.join()
			else :
				print '\t> Response : No'
				connectionSocket.send('File doesn\'t exists.')
				print '\t> Response Denied.'
				print '\t> End.'
		print 'idle.'

def sendData(connectionSocket, sentence, buffers):

	print '> Request Appears by [%s,%s] => %s' % (
		connectionSocket.getpeername()[0], connectionSocket.getpeername()[1],sentence)

	#gevent.sleep(10)

	try: 
		if int(stat(sentence).st_size) % buffers == 0:
			print 'buffer++'
			buffers = buffers + 1
			connectionSocket.send('File exists.')
		else:
			connectionSocket.send('file exists.')

		f = open(sentence,'rb')
		l= f.read(buffers)
	
		while (l) :
			try:
				connectionSocket.send(l)
			except error, e:
				if isinstance(e.args, tuple):
					print 'errno is %d' % e[0]
					if e[0] == errno.EPIPE:
						print 'Detected remote disconnect'
					else:
						pass
				else:
					print 'socket error ', e
					connectionSocket.close()
				break
			
			l = f.read(buffers)
		f.close()
	except error, e:
		if isinstance(e.args, tuple):
			print 'errno is %d' % e[0]
			if e[0] == errno.EPIPE:
				print 'Detected remote disconnect'
			else:
				pass
		else:
			print 'socket error ', e
			connectionSocket.close()
