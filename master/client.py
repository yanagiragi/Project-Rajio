import BaseClient
import sys
import json

def printErr():
	print ''
	print 'Usage: python client.py $ServerIP:$serverPort $song_requested $song_checksum'
	print '     : python client.py $ServerIP:$serverPort update_snapshot'
	print 'example:  python client.py localhost:13002 \"It\'s all about you.mp3\" \"6d8544a5d4b515dd84edf7b68db97fda\"'
	print ''
	exit()

if __name__ == "__main__":
	
	argv = sys.argv
	cert = "kimagure_mercy"
	
	if len(argv) != 3 and len(argv) != 4:
		printErr()

	serverinfo = argv[1].split(":")
	serverName,serverPort = serverinfo[0],int(serverinfo[1])
	
	if len(argv) == 3:
		if argv[2] == "update_snapshot":
			Container = BaseClient.serve(serverName,serverPort,"update_snapshot","",cert)
			print json.dumps(Container, indent=4, sort_keys=True)

		elif argv[2] == "quit_server":
			print 'Blocked'
			#discard request now
		else :
			printErr()

	else:
		# request songs
		cmd = argv[2]
		fcs = argv[3]

		Container = BaseClient.serve(serverName,serverPort,cmd,fcs,cert)
		print Container
