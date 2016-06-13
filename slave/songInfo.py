# This file defines structure storing Song infos catch by eyeD3

class info:
  def __init__(self, name, title, artist, album, album_artist, track) :

    if name == None :
      self.name = "NoData"
    else:
      self.name = name

    if title == None :
      self.title = "NoData"
    else:
      self.title = title

    if artist == None :
      self.artist = "NoData"
    else:
      self.artist = artist

    if album == None :
      self.album = "NoData"
    else:
      self.album = album

    if album_artist == None :
      self.album_artist = "NoData"
    else:
      self.album_artist = album_artist

    if track == None :
      self.track = "NoData"
    else:
      self.track = track
