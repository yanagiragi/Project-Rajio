#coding=UTF-8
#encoding=UTF-8
# [important] nospace required!
# telling interpreter to encode as requested

import os
from os import listdir
from os.path import isfile
import eyed3
import songInfo     # self defined class

import sys      # sys.setdefaultencoding() does not exist unitl you import sys!
#reload(sys)     # Reload does the trick!
#sys.setdefaultencoding('utf-8')

""" end of import header """

def isMp3(name,path):
    if name[name.rfind('.',0,len(name)-1)+1:len(name)].lower() != "mp3":
    	return 0
    if int(os.stat(path).st_size) <= 0:
	    return 0
    return 1

def readdir(mypath, Contains):
    now = listdir(mypath)
    for a in now:
        nowpath = mypath + "/" + a
        if isfile(nowpath):
            tmpStr = nowpath[nowpath.rfind('/',0,len(nowpath)-1)+1:len(nowpath)]
            if isMp3(tmpStr,nowpath):
              Contains[tmpStr] = [nowpath, get_song_infos(tmpStr,nowpath)]
        else:
            readdir(nowpath, Contains)

def update_info(path):

    eyed3.log.setLevel("ERROR")
    # omit this to display warning messages

    Contains = {}
    # Declared as dictionary

    readdir(path,Contains)
    # start scanning the path...

    return Contains


def get_song_infos(name, path):

  try:
    try:
      audiofile = eyed3.load(path)

      if(audiofile.tag != None):
        nowinfo = songInfo.info(name ,
                       audiofile.tag.title,
                       audiofile.tag.artist,
                       audiofile.tag.album,
                       audiofile.tag.album_artist,
                       audiofile.tag.track_num)

      else:
        nowinfo = songInfo.info(name ,
                         None,
                         None,
                         None,
                         None,
                         None)

      return nowinfo
    except ValueError as err:
      print (err.message)
      nowinfo = songInfo.info(name ,
                         None,
                         None,
                         None,
                         None,
                         None)

      return nowinfo

  except (UnicodeDecodeError, ValueError):
    print ("Err on file: "   + path)
    nowinfo = songInfo.info(name ,
                     None,
                     None,
                     None,
                     None,
                     None)

    return nowinfo

""" end of define function """

if __name__ == "__main__":

  strs = '../Tmp'
  Cons =  update_info(strs)
  for a in Cons:
    #if Cons[a][1] == None:
    #  print a
    print ("Name = " + Cons[a][1].name)
    print ("Artist = " + Cons[a][1].artist)
    print ("")
