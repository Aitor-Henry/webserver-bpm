import os
import gevent
import gevent.event
import gevent.queue
import gevent.server
import bottle
import socket
import json
import time
import PyTango
import struct
from bottle.ext.websocket import GeventWebSocketServer
from bottle.ext.websocket import websocket
try:
    from bliss.data.routines.pixmaptools import qt4 as pixmaptools
except ImportError:
    os.environ["QUB_SUBPATH"]="qt4"
    from Qub.CTools import pixmaptools
import logging
import sys

import copy

HOMEPAGE_TITLE = "BPM Monitor"
HOST = socket.gethostname()
PORT=8066 #defined arbitrarly
WEB_QUERIES = gevent.queue.Queue()


# patch socket module
socket.socket._bind = socket.socket.bind
def my_socket_bind(self, *args, **kwargs):
  self.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
  try:
    return socket.socket._bind(self, *args, **kwargs)
  except:
    return

socket.socket.bind = my_socket_bind

#Class BV

class BV:

  def __init__(self,camera_name):
    #import pdb; pdb.set_trace()
    self.bvdata = None
    print "camera name : ", camera_name
    tango_device = self.find_tango_device(camera_name)
    self.limaccds_device = PyTango.DeviceProxy(tango_device)
    self.bpm_device = PyTango.DeviceProxy(self.limaccds_device.getPluginDeviceNameFromType('bpm'))
    self.bpm_device.Start()
    self.event_counter = 0
    self.bpm_device.subscribe_event('bvdata', PyTango.EventType.CHANGE_EVENT, self.handle_new_image, [])
    self.handle_webserver_queries()
    

  def find_tango_device(self,lima_name): #will change
    tango_db = PyTango.DeviceProxy("sys/database/2")
    beam_viewers_list = tango_db.DbGetDeviceList(["*", "LimaCCDs"])
    for device in beam_viewers_list:
        if lima_name == device.split("/")[2]:
            return(device)

  def handle_new_image(self,evt_bvdata):

    def ListStrToListInt(list_str):
        list_int_clean=list_str[1:len(list_str)-1].split(',')
        list_tuples_int=[]
        for i in range(0,len(list_int_clean)):
            list_tuples_int.append(int(list_int_clean[i]))
        return list_tuples_int

    if self.event_counter==0:
      print("Synchronous event with bpm device.")
      return None
    else:
      bv_data=evt_bvdata.attr_value.value[1]
      HEADER_FORMAT=evt_bvdata.attr_value.value[0]
      (timestamp,framenb,
        X,Y,I,maxI,roi_top_x,roi_top_y,
        roi_size_getWidth,roi_size_getHeight,
        fwhm_x,fwhm_y,list_int_profile_x,list_int_profile_y, jpegData) = struct.unpack(HEADER_FORMAT, bv_data)
      profile_x=ListStrToListInt(list_int_profile_x)
      profile_y=ListStrToListInt(list_int_profile_y)
      #print "framenb : ", framenb, ", timestamp : ", timestamp, ", X : ", X, ", Y : ", Y
      result_array = {"framenb" : framenb, "X" : X, "Y" : Y, "I" : I, "fwhm_x" : fwhm_x, "fwhm_y" : fwhm_y,  "jpegData" : jpegData, "profile_x" : profile_x, "profile_y" : profile_y}
      print "on recupere une image"
      self.bvdata = result_array
      

  #methods
  def getExposuretime(self):
    return self.limaccds_device.acq_expo_time

  def getAcqRate(self):
    return (1.0/(self.limaccds_device.acq_expo_time+self.limaccds_device.latency_time))

  def setAcqRate(self, acqrate):
    acqrate_sec = 1.0/acqrate
    if acqrate_sec>=self.limaccds_device.acq_expo_time:
      self.limaccds_device.latency_time=acqrate_sec-self.limaccds_device.acq_expo_time
      print self.limaccds_device.latency_time

  def setExposuretime(self,exp_t):
    self.limaccds_device.acq_expo_time = exp_t


  def getAcqStatus(self):
    return self.limaccds_device.acq_status

  def HasRoi(self):
    img_dim = self.limaccds_device.image_roi
    img_width, img_height = self.getDimensionImage()
    if img_dim[0]==0 and img_dim[1]==0 and img_dim[2]==img_width and img_dim[3]==img_height:
      return False
    else:
      return True
    
  def getDimensionImage(self):
    return (self.limaccds_device.image_width,self.limaccds_device.image_height)

  

    
  def handle_webserver_queries(self):
    while True:
      self.event_counter=1
      query = get_query()
      print "------------------------NEXT QUERY-----------------------"
      print query

      if query["query"] == "new_image":
        #self.bvdata = None
        
        while self.bvdata == None:
          time.sleep(self.getExposuretime()/10) #need to wait bpm return bvdata
        query["reply"].update(self.bvdata)
        query["event"].set()
        self.bvdata = None

      elif query["query"] == "get_status":
          query["reply"].update({ "exposure_time": self.getExposuretime(),
                                  "live": True if self.getAcqStatus()=='Running' else False,
                                  "roi": self.HasRoi(),
                                  "full_width": self.getDimensionImage()[0],
                                  "full_height": self.getDimensionImage()[1],
                                  "acq_rate": self.getAcqRate(),
                                  "color_map": self.bpm_device.color_map, 
                                  "autoscale": self.bpm_device.autoscale,
                                  "calib_x": self.bpm_device.calibration[0],
                                  "calib_y":  self.bpm_device.calibration[1],
                                  "background": self.bpm_device.HasBackground(),
                                  "beam_mark_x": float(self.bpm_device.beammark[0]),
                                  "beam_mark_y": float(self.bpm_device.beammark[1])})
          query["event"].set()

      elif query["query"] == "set_roi":
          try:
             self.limaccds_device.image_roi = (query["x"],query["y"],query["w"],query["h"]) # is args in the good order ?
          except:
            logging.exception("Could not set roi")
          else:
            pass #print "roi is set"
          query["event"].set()

      elif query["query"] == "set_img_display_config":
          self.bpm_device.color_map = bool(int(query["color_map"]))
          self.bpm_device.autoscale = bool(int(query["autoscale"]))
          if query["lut_method"] == "Logarithmic":
            self.bpm_device.lut_method = "LOG"
          else:
            self.bpm_device.lut_method = "LINEAR"
          query["event"].set()

      elif query["query"] == "update_calibration":
        self.bpm_device.calibration = ([float(query["calib_x"]), float(query["calib_y"])])
        query["event"].set()

      elif query["query"] == "lock_beam_mark":
        self.bpm_device.beammark = ([int(query["x"]), int(query["y"])])
        query["event"].set()

      elif query["query"] == "get_beam_position":
        self.setExposuretime(float(query["exp_t"]))
        self.setAcqRate(float(query["acq_rate"]))
        if self.limaccds_device.ready_for_next_image==False:
          print "stopping live"
          self.limaccds_device.video_live=False
          self.limaccds_device.stopAcq()
        if bool(int(query["live"])):
          self.limaccds_device.video_live=True
        else:
          self.limaccds_device.acq_nb_frames = 1
          self.limaccds_device.prepareAcq()
          self.limaccds_device.startAcq()
        query["event"].set()

      elif query["query"] == "get_intensity":
        x = int(query["x"]); y = int(query["y"])
        query["reply"].update({ "intensity": self.bpm_device.GetPixelIntensity([x,y]) })
        query["event"].set()

      elif query["query"] == "set_background":
          if int(query["backgroundstate"]): # if bool(int(query["set"])) ??
            if self.getAcqStatus()=='Running':
              raise RuntimeError, "Acquisition has not finished (or Live mode is on)"
            else:
              self.bpm_device.TakeBackground() # same stuff, need to see how to handle this.
          else:
            self.bpm_device.ResetBackground()
          query["event"].set()


""" 
      elif query["query"] == "external_changes":
        # this is the query used to communicate user changes through Tango to web app.
          gevent.spawn(handle_external_changes, bv, query) # see l.57

"""

# issue with background and (max_width, max_height), device server tango ? Lima.core.bpm ... lima.core.BACKGROUNDSUBSTRACTION ... ?

def get_query():
    global WEB_QUERIES
    if WEB_QUERIES is None:
        WEB_QUERIES = gevent.queue.Queue()
    return_query = WEB_QUERIES.get()
    return return_query

def query(name, **kwargs):
    reply = {}
    event = gevent.event.Event()
    query = { "query": name, "reply": reply, "event": event }
    query.update(kwargs)
    WEB_QUERIES.put(query)
    event.wait()
    return reply







def webserver_main(portnumber, hostname):
  #webserver_thread = gevent.spawn(bottle.run, host=hostname, port=portnumber, quiet=True)
  #webserver_thread.port = portnumber
  print("Init webserver ........ ", hostname, portnumber)
  bottle.run(server=GeventWebSocketServer, host=hostname, port=portnumber)
  #return webserver_thread


@bottle.route("/")
def index():
  tango_db = PyTango.DeviceProxy("sys/database/2")
  limaccds_devices_name=[]
  limaccds_bpm_devices=[]
  limaccds_devices = tango_db.DbGetDeviceList(["*", "LimaCCDs"])
  for device in limaccds_devices:
    limaccds_devices_name.append(device.split('/')[-1])
  for device in limaccds_devices_name:
    class_list_device = tango_db.DbGetDeviceClassList("LimaCCDs/"+device)
    if "BpmDeviceServer" in class_list_device:
      limaccds_bpm_devices.append(class_list_device[class_list_device.index("BpmDeviceServer")-1])

  reply = "<html><title>%s</title><body><h1>ESRF XBPM applications</h1><h3>1. Beam viewers</h3><ul>" %HOMEPAGE_TITLE
  for lima_bpm in limaccds_bpm_devices:
    reply += "<li><a href='//%s.esrf.fr:%i/%s/'>%s</a><ul>" %(HOST,PORT,lima_bpm.split('/')[-1],lima_bpm.split('/')[-1])
    try:
      PyTango.DeviceProxy(lima_bpm).ping()
    except:
     color = "red"
    else:
     color = "green"
    reply += "<li><font color='%s'>%s</font></li>" % (color, lima_bpm)
    reply += "</ul>"
  reply += "</ul></body></html>"
  return reply


@bottle.route('/webpack_output/<filename>')
def server_static(filename):
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'webpack_output/')
    return bottle.static_file(filename, root=f)

@bottle.route("/:camera/")
def get_camera_page(camera):
  #import pdb; pdb.set_trace()
  gevent.spawn(BV, camera)
  #time.sleep(1) #need to wait the class BV is set before loading page
  return bottle.static_file("index.html", root=os.path.dirname(os.path.abspath(__file__)))


########--------------------------------------------------------------------------------------########
@bottle.get('/:camera/api/get_status')
def get_status(camera):
  return query("get_status")

@bottle.get("/:camera/api/set_roi")
def set_roi(camera):
  res = query("set_roi",  x=int(bottle.request.GET["x"]),
                          y=int(bottle.request.GET["y"]),
                          w=int(bottle.request.GET["w"]),
                          h=int(bottle.request.GET["h"]))
  return res

@bottle.get("/:camera/api/get_beam_position")
def acquire(camera):
  return query("get_beam_position", exp_t=bottle.request.GET["exp_t"],
                                    live = bottle.request.GET["live"],
                                    acq_rate = bottle.request.GET["acq_rate"])

@bottle.get("/:camera/api/img_display_config")
def set_img_display_config(camera):
  return query("set_img_display_config", autoscale=bottle.request.GET["autoscale"],
                                         color_map=bottle.request.GET["color_map"],
                                         lut_method=bottle.request.GET["autoscale_option"])

@bottle.get("/:camera/api/update_calibration")
def update_calib(camera):
  return query("update_calibration", calib_x=bottle.request.GET["x"],
                                     calib_y=bottle.request.GET["y"],
                                     save=bottle.request.GET["save"])

@bottle.get("/:camera/api/lock_beam_mark")
def lock_beam_mark(camera):
  return query("lock_beam_mark", x=bottle.request.GET["x"],
                                 y=bottle.request.GET["y"])

@bottle.get("/:camera/api/get_intensity")
def get_intensity(camera):
  return query("get_intensity", x = bottle.request.GET["x"],
                                y = bottle.request.GET["y"])

@bottle.get("/:camera/api/set_background")
def set_background(camera):
  return query("set_background", backgroundstate=bottle.request.GET["backgroundstate"])

#######TO DIALOGUE WITH WEBSOCKET FROM FRONT END SIDE#######
@bottle.get('/:camera/api/image_channel', apply=[websocket])
def provide_images(ws,camera):
  while True:
    client_id = ws.receive()
    if client_id is not None:
      qres = query("new_image")
      tosend = json.dumps(qres)
      ws.send(tosend)
      
    else: break

"""
@bottle.get('/:camera/api/ext_changes_channel', apply=[websocket])
def set_config(ws,camera):
  while True:
    client_id = ws.receive()
    if client_id is not None:
      qres = query("external_changes")
      tosend = json.dumps(qres)
      print "changes from Tango server side:", qres
      ws.send(tosend)
    
    else: break



def handle_external_changes(bv, query): #this will be a problem. events trigger in beam_viewer.py when a third part use and
    bv._ext_change_event.wait()

    query["reply"].update({"exp_t": bv.ccd_exposure_time,
                           "in_acquisition": bv.in_acquisition(),
                           "background": bv._has_background() })

    bv._ext_change_event.clear()

    query["event"].set()

"""
###############################################################

if __name__=="__main__":
    #webserver_start = webserver_main(PORT,HOST)
    webserver_main(PORT,HOST)
    gevent.wait()
