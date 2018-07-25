import os
from gevent import monkey; monkey.patch_all()
import gevent
import gevent.queue
import time
import bottle
import socket
import json
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


class BVWebserver:

  def __init__(self,host,port):
    self.host = host
    self.port = port
    self.app = bottle.Bottle()
    self.register_routes()
    self.event_counter = 0
    self.cameras_running = {}

  def find_tango_device(self,camera_name):
    tango_db = PyTango.DeviceProxy("sys/database/2")
    beam_viewers_list = tango_db.DbGetDeviceList(["*", "LimaCCDs"])
    for device in beam_viewers_list:
        if camera_name == device.split("/")[2]:
            return(device)


  def camera_init(self,camera_name): 
    if not(self.cameras_running.has_key(camera_name)):
      self.event_counter = 0
      imgdisplayreply=None
      tango_device = self.find_tango_device(camera_name)
      limaccds_device = PyTango.DeviceProxy(tango_device)
      bpm_device = PyTango.DeviceProxy(limaccds_device.getPluginDeviceNameFromType('bpm'))
      bpm_device.subscribe_event('bvdata', PyTango.EventType.CHANGE_EVENT, self.decode_bvdata, [])
      bpm_device.Start()
      dict_to_add = {camera_name : [limaccds_device, bpm_device, imgdisplayreply]}
      self.cameras_running.update(dict_to_add)



  def decode_bvdata(self,evt_bvdata):
    """Callback function from the subscribe_event on bvdata"""

    def ListStrToListInt(list_str):
      """Due to the type of the profiles, they are pass as a string. This function is to convert them back"""
      list_int_clean=list_str[1:len(list_str)-1].split(',')
      list_tuples_int=[]
      for i in range(0,len(list_int_clean)):
        list_tuples_int.append(int(list_int_clean[i]))
      return list_tuples_int
    
    if self.event_counter==0:
      print "Subscribing to bvdata push event..."
    else:
      camera_name=evt_bvdata.attr_name.split("/")[-2]
      bv_data=evt_bvdata.attr_value.value[1]
      HEADER_FORMAT=evt_bvdata.attr_value.value[0]
      (timestamp,framenb,
        X,Y,I,maxI,roi_top_x,roi_top_y,
        roi_size_getWidth,roi_size_getHeight,
        fwhm_x,fwhm_y,list_int_profile_x,list_int_profile_y, jpegData) = struct.unpack(HEADER_FORMAT, bv_data)
      profile_x=ListStrToListInt(list_int_profile_x)
      profile_y=ListStrToListInt(list_int_profile_y)
      self.cameras_running[camera_name][2] = {"framenb" : framenb, "X" : X, "Y" : Y, "I" : I, "fwhm_x" : fwhm_x, "fwhm_y" : fwhm_y,  "jpegData" : jpegData, "profile_x" : profile_x, "profile_y" : profile_y} 


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

  ######################### CALLBACK FUNCTIONS FOR APPLY REQUEST #########################
  def getstatus(self,camera):
    self.camera_init(camera)
    self.event_counter = 1
    reply = { "exposure_time": self.getExposuretime(camera),
              "live": True if self.getAcqStatus(camera)=='Running' else False,
              "roi": self.HasRoi(camera),
              "full_width": self.getDimensionImage(camera)[0],
              "full_height": self.getDimensionImage(camera)[1],
              "acq_rate": self.getAcqRate(camera),
              "color_map": self.cameras_running[camera][1].color_map, 
              "autoscale": self.cameras_running[camera][1].autoscale,
              "calib_x": self.cameras_running[camera][1].calibration[0],
              "calib_y":  self.cameras_running[camera][1].calibration[1],
              "background": self.cameras_running[camera][1].HasBackground(),
              "beam_mark_x": float(self.cameras_running[camera][1].beammark[0]),
              "beam_mark_y": float(self.cameras_running[camera][1].beammark[1]),
              "min_exposure_time": self.cameras_running[camera][0].valid_ranges[0],
              "max_exposure_time": self.cameras_running[camera][0].valid_ranges[1],
              "min_latency_time": self.cameras_running[camera][0].valid_ranges[2],
              "max_latency_time": self.cameras_running[camera][0].valid_ranges[3]}
    return reply
    
  def setroi(self,camera):
    print bottle.request
    print bottle.request.query
    print bottle.request.query.x
    try:
      self.cameras_running[camera][0].image_roi = (int(bottle.request.query.x),int(bottle.request.query.y),int(bottle.request.query.w),int(bottle.request.query.h))
    except:
      logging.exception("Could not set roi")
    else:
      pass

  def imgdisplay(self,camera):
    self.cameras_running[camera][1].color_map = bool(int(bottle.request.query.color_map))
    self.cameras_running[camera][1].autoscale = bool(int(bottle.request.query.autoscale))
    if bottle.request.query.lut_method == "Logarithmic":
      self.cameras_running[camera][1].lut_method = "LOG"
    else:
      self.cameras_running[camera][1].lut_method = "LINEAR"

    self.cameras_running[camera][1].calibration = ([float(bottle.request.query.calib_x), float(bottle.request.query.calib_y)])
    self.setExposuretime(float(bottle.request.query.exp_t),camera)
    self.setAcqRate(float(bottle.request.query.acq_rate),camera)

    if bool(int(bottle.request.query.live)): #Asking for live
      if not(self.getAcqStatus(camera)=='Running'): #if camera not already in live mode then we start live
        self.cameras_running[camera][0].video_live=True
    else: #Not live, only one acquisition
      if self.getAcqStatus(camera)=='Running': #if camera running live mode, we stop it.
        self.cameras_running[camera][0].video_live=False
        return {"stopLive" : True}
      else:
        self.cameras_running[camera][0].acq_nb_frames = 1 #otherwise we start a 1 frame acq
        self.cameras_running[camera][0].prepareAcq()
        self.cameras_running[camera][0].startAcq()
    
    while self.cameras_running[camera][2]==None:
      gevent.sleep((1/self.getAcqRate(camera))/10)

    reply = self.cameras_running[camera][2] # should contain bvdata at this point
    if bottle.request.query.beammark_x!="undefined" and bottle.request.query.beammark_y!="undefined":
      I = self.cameras_running[camera][1].GetPixelIntensity([int(bottle.request.query.beammark_x),int(bottle.request.query.beammark_y)])
      reply.update({ "intensity": I })
    reply.update({ "stopLive" : False})
    self.cameras_running[camera][2]=None
    return reply
      
  def updatecalibration(self,camera):
    calib_x = float(bottle.request.query.calib_x)
    calib_y = float(bottle.request.query.calib_y)
    self.cameras_running[camera][1].calibration = ([calib_x, calib_y])
      
  def lockbeammark(self,camera):
    self.cameras_running[camera][1].beammark = ([int(bottle.request.query.x), int(bottle.request.query.y)])
      
  def getintensity(self,camera):
    x = int(bottle.request.query.x); y = int(bottle.request.query.y)
    reply = { "intensity": self.cameras_running[camera][1].GetPixelIntensity([x,y]) }
    return reply
      
  def setbackground(self,camera):
    if int(bottle.request.query.backgroundstate):
      if self.getAcqStatus(camera)=='Running':
        raise RuntimeError, "Acquisition has not finished (or Live mode is on)"
      else:
        self.cameras_running[camera][1].TakeBackground()
    else:
      self.cameras_running[camera][1].ResetBackground()
        
######################### CALLBACK FUNCTIONS FOR APPLY REQUEST : END #########################


  def register_routes(self):
    self.app.route('/', callback=self.index)
    self.app.route('/:camera/', callback=self.get_camera_page)
    self.app.route('/webpack_output/<filename>', callback=self.server_static)

    self.app.route('/:camera/api/get_status', callback=self.getstatus)
    self.app.route('/:camera/api/set_roi', callback=self.setroi)
    self.app.route('/:camera/api/img_display_config', callback=self.imgdisplay)
    self.app.route('/:camera/api/update_calibration', callback=self.updatecalibration)
    self.app.route('/:camera/api/lock_beam_mark', callback=self.lockbeammark)
    self.app.route('/:camera/api/get_intensity', callback=self.getintensity)
    self.app.route('/:camera/api/set_background', callback=self.setbackground)

    

  def run_forever(self):
    try:
      self.app.run(server="gevent", host=self.host, port=self.port)
    except KeyboardInterrupt:
      print "Stopping Webserver."
      sys.exit()



######################### BOTTLE ROUTES METHODS FOR BROSWER DISPLAY #########################
  def index(self):
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

  
  def server_static(self,filename='bundle.js'):
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'webpack_output/')
    return bottle.static_file(filename, root=f)

  def get_camera_page(self, camera):
    return bottle.static_file("index.html", root=os.path.dirname(os.path.abspath(__file__)))
######################### BOTTLE ROUTES METHODS FOR BROSWER DISPLAY : END #########################


 ########--------------------------------------------------------------------------------------########
if __name__=="__main__":
  BVWebserver(HOST,PORT).run_forever()
