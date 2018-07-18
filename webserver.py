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

import threading


# patch socket module
socket.socket._bind = socket.socket.bind
def my_socket_bind(self, *args, **kwargs):
  self.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
  try:
    return socket.socket._bind(self, *args, **kwargs)
  except:
    return

socket.socket.bind = my_socket_bind


HOMEPAGE_TITLE = "BPM Monitor"
HOST = socket.gethostname()
PORT=8066 #defined arbitrarly
WEB_QUERIES = gevent.queue.Queue()


#Class BV, talks to Tango devices and bottle app.
class BV:

  def __init__(self):
    self.bvdata = None
    self.cameras_running = {}
    
    self.event_counter = 0
    self.handle_webserver_queries()
    
  def camera_init(self, camera_name): 
    """When user launch a new camera in broswer. Add to cameras running the devices and bvdata."""
    bvdata=None
    if self.cameras_running.has_key(camera_name):
      return True
    else:
      self.event_counter = 0
      tango_device = self.find_tango_device(camera_name)
      limaccds_device = PyTango.DeviceProxy(tango_device)
      bpm_device = PyTango.DeviceProxy(limaccds_device.getPluginDeviceNameFromType('bpm'))
      bpm_device.Start()
      bpm_device.subscribe_event('bvdata', PyTango.EventType.CHANGE_EVENT, self.handle_new_image, [])
      dict_to_add = {camera_name : [limaccds_device, bpm_device, bvdata]}
      self.cameras_running.update(dict_to_add)
      return False

  def find_tango_device(self,lima_name):
    tango_db = PyTango.DeviceProxy("sys/database/2")
    beam_viewers_list = tango_db.DbGetDeviceList(["*", "LimaCCDs"])
    for device in beam_viewers_list:
        if lima_name == device.split("/")[2]:
            return(device)

  def handle_new_image(self,evt_bvdata):
    """Callback function from the subscribe_event on bvdata"""

    def ListStrToListInt(list_str):
      """Due to the type of the profiles, they are pass as a string. This function is to convert them back."""
      list_int_clean=list_str[1:len(list_str)-1].split(',')
      list_tuples_int=[]
      for i in range(0,len(list_int_clean)):
        list_tuples_int.append(int(list_int_clean[i]))
      return list_tuples_int
    
    camera_name=evt_bvdata.attr_name.split("/")[-2]
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
      result_array = {"framenb" : framenb, "X" : X, "Y" : Y, "I" : I, "fwhm_x" : fwhm_x, "fwhm_y" : fwhm_y,  "jpegData" : jpegData, "profile_x" : profile_x, "profile_y" : profile_y}
      self.cameras_running[camera_name][2] = result_array
      

  """Methods used in get_status()"""
  def getExposuretime(self,camera_name):
    return self.cameras_running[camera_name][0].acq_expo_time

  def getAcqRate(self,camera_name):
    return (1.0/(self.cameras_running[camera_name][0].acq_expo_time+self.cameras_running[camera_name][0].latency_time))

  def setAcqRate(self, acqrate,camera_name):
    acqrate_sec = 1.0/acqrate
    if acqrate_sec>=self.cameras_running[camera_name][0].acq_expo_time:
      self.cameras_running[camera_name][0].latency_time=acqrate_sec-self.cameras_running[camera_name][0].acq_expo_time

  def setExposuretime(self,exp_t,camera_name):
    self.cameras_running[camera_name][0].acq_expo_time = exp_t

  def getAcqStatus(self,camera_name):
    return self.cameras_running[camera_name][0].acq_status

  def HasRoi(self,camera_name):
    img_dim = self.cameras_running[camera_name][0].image_roi
    img_width, img_height = self.getDimensionImage(camera_name)
    if img_dim[0]==0 and img_dim[1]==0 and img_dim[2]==img_width and img_dim[3]==img_height:
      return False
    else:
      return True
    
  def getDimensionImage(self,camera_name):
    return (self.cameras_running[camera_name][0].image_width,self.cameras_running[camera_name][0].image_height)

  
  def handle_webserver_queries(self):
    """Loop dealing with queries from broswer."""
    while True:
      self.event_counter=1
      query = get_query()
      print "------------------------NEXT QUERY-----------------------"
      print query
      self.camera_init(query["camera_name"])

      if query["query"] == "new_image":
        while self.cameras_running[query["camera_name"]][2] == None:
          time.sleep(self.getExposuretime(query["camera_name"])/10) #need to wait bpm return bvdata
        query["reply"].update(self.cameras_running[query["camera_name"]][2])
        if query["intensity"]==True:
          x_int=int(query["bm_x"])
          y_int=int(query["bm_y"])
          query["reply"].update({"intensity": self.cameras_running[query["camera_name"]][1].GetPixelIntensity([x_int,y_int])})
        else:
          query["reply"].update({"intensity": -1})
        query["event"].set()
        self.cameras_running[query["camera_name"]][2] = None
        
      elif query["query"] == "get_status":
        query["reply"].update({ "exposure_time": self.getExposuretime(query["camera_name"]),
                                  "live": True if self.getAcqStatus(query["camera_name"])=='Running' else False,
                                  "roi": self.HasRoi(query["camera_name"]),
                                  "full_width": self.getDimensionImage(query["camera_name"])[0],
                                  "full_height": self.getDimensionImage(query["camera_name"])[1],
                                  "acq_rate": self.getAcqRate(query["camera_name"]),
                                  "color_map": self.cameras_running[query["camera_name"]][1].color_map, 
                                  "autoscale": self.cameras_running[query["camera_name"]][1].autoscale,
                                  "calib_x": self.cameras_running[query["camera_name"]][1].calibration[0],
                                  "calib_y":  self.cameras_running[query["camera_name"]][1].calibration[1],
                                  "background": self.cameras_running[query["camera_name"]][1].HasBackground(),
                                  "beam_mark_x": float(self.cameras_running[query["camera_name"]][1].beammark[0]),
                                  "beam_mark_y": float(self.cameras_running[query["camera_name"]][1].beammark[1])})
        query["event"].set()

      elif query["query"] == "set_roi":
        try:
          self.cameras_running[query["camera_name"]][0].image_roi = (query["x"],query["y"],query["w"],query["h"]) # is args in the good order ?
        except:
          logging.exception("Could not set roi")
        else:
          pass
        query["event"].set()

      elif query["query"] == "set_img_display_config":
        self.cameras_running[query["camera_name"]][1].color_map = bool(int(query["color_map"]))
        self.cameras_running[query["camera_name"]][1].autoscale = bool(int(query["autoscale"]))
        if query["lut_method"] == "Logarithmic":
          self.cameras_running[query["camera_name"]][1].lut_method = "LOG"
        else:
          self.cameras_running[query["camera_name"]][1].lut_method = "LINEAR"

        self.cameras_running[query["camera_name"]][1].calibration = ([float(query["calib_x"]), float(query["calib_y"])])
        self.setExposuretime(float(query["exp_t"]),query["camera_name"])
        self.setAcqRate(float(query["acq_rate"]),query["camera_name"])
        if self.cameras_running[query["camera_name"]][0].ready_for_next_image==False:
          print "stopping live"
          self.cameras_running[query["camera_name"]][0].video_live=False
          self.cameras_running[query["camera_name"]][0].stopAcq()
        if bool(int(query["live"])):
          self.cameras_running[query["camera_name"]][0].video_live=True
        else:
          self.cameras_running[query["camera_name"]][0].acq_nb_frames = 1
          self.cameras_running[query["camera_name"]][0].prepareAcq()
          self.cameras_running[query["camera_name"]][0].startAcq()
        query["event"].set()

      elif query["query"] == "update_calibration":
        self.cameras_running[query["camera_name"]][1].calibration = ([float(query["calib_x"]), float(query["calib_y"])])
        query["event"].set()

      elif query["query"] == "lock_beam_mark":
        self.cameras_running[query["camera_name"]][1].beammark = ([int(query["x"]), int(query["y"])])
        query["event"].set()

      elif query["query"] == "get_intensity":
        x = int(query["x"]); y = int(query["y"])
        query["reply"].update({ "intensity": self.cameras_running[query["camera_name"]][1].GetPixelIntensity([x,y]) })
        query["event"].set()

      elif query["query"] == "set_background":
          if int(query["backgroundstate"]): # if bool(int(query["set"])) ??
            if self.getAcqStatus(query["camera_name"])=='Running':
              raise RuntimeError, "Acquisition has not finished (or Live mode is on)"
            else:
              self.cameras_running[query["camera_name"]][1].TakeBackground() # same stuff, need to see how to handle this.
          else:
            self.cameras_running[query["camera_name"]][1].ResetBackground()
          query["event"].set()



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


def webserver_main(hostname,portnumber):
  bottle.run(server=GeventWebSocketServer, host=hostname, port=portnumber)


######### BOTTLE ROUTES #########
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

  return bottle.static_file("index.html", root=os.path.dirname(os.path.abspath(__file__)))


########--------------------------------------------------------------------------------------########
@bottle.get('/:camera/api/get_status')
def get_status(camera):
  return query("get_status", camera_name=camera)

@bottle.get("/:camera/api/set_roi")
def set_roi(camera):
  res = query("set_roi",  camera_name=camera,
                          x=int(bottle.request.GET["x"]),
                          y=int(bottle.request.GET["y"]),
                          w=int(bottle.request.GET["w"]),
                          h=int(bottle.request.GET["h"]))
  return res

@bottle.get("/:camera/api/get_beam_position")
def acquire(camera):
  return query("get_beam_position", camera_name=camera,
                                    exp_t=bottle.request.GET["exp_t"],
                                    live = bottle.request.GET["live"],
                                    acq_rate = bottle.request.GET["acq_rate"])

@bottle.get("/:camera/api/img_display_config")
def set_img_display_config(camera):
  return query("set_img_display_config",  camera_name=camera,
                                          autoscale=bottle.request.GET["autoscale"],
                                          color_map=bottle.request.GET["color_map"],
                                          lut_method=bottle.request.GET["autoscale_option"],
                                          calib_x=bottle.request.GET["x"],
                                          calib_y=bottle.request.GET["y"],
                                          exp_t=bottle.request.GET["exp_t"],
                                          live = bottle.request.GET["live"],
                                          acq_rate = bottle.request.GET["acq_rate"])

@bottle.get("/:camera/api/update_calibration")
def update_calib(camera):
  return query("update_calibration", camera_name=camera,
                                     calib_x=bottle.request.GET["x"],
                                     calib_y=bottle.request.GET["y"])

@bottle.get("/:camera/api/lock_beam_mark")
def lock_beam_mark(camera):
  return query("lock_beam_mark", camera_name=camera,
                                 x=bottle.request.GET["x"],
                                 y=bottle.request.GET["y"])

@bottle.get("/:camera/api/get_intensity")
def get_intensity(camera):
  return query("get_intensity", camera_name=camera,
                                x = bottle.request.GET["x"],
                                y = bottle.request.GET["y"])

@bottle.get("/:camera/api/set_background")
def set_background(camera):
  return query("set_background", camera_name=camera,
                                 backgroundstate=bottle.request.GET["backgroundstate"])

#######TO DIALOGUE WITH WEBSOCKET FROM FRONT END SIDE#######
@bottle.get('/:camera/api/image_channel', apply=[websocket])
def provide_images(ws,camera):
  #import pdb; pdb.set_trace()
  while True:
    client_id = ws.receive()
    if client_id is not None:
      query_image=client_id.split(",")
      if query_image[0]=="false": # not terrible
        qres = query("new_image", intensity=False, camera_name=query_image[1])
      else:
        qres = query("new_image", intensity=True, camera_name=query_image[2], bm_x=query_image[0], bm_y=query_image[1])
      tosend = json.dumps(qres)
      ws.send(tosend)
      
    else: break
###############################################################

if __name__=="__main__":
    gevent.spawn(BV)
    webserver_main(HOST,PORT)
#    gevent.wait()
