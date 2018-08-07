==============
Bpm-webserver 
==============

Repository for the BeamViewer using the new Bpm_

.. _Bpm: https://gitlab.esrf.fr/limagroup/Lima-tango-python/blob/1-bpm-device/plugins/Bpm.py

Description
------------

This project is a BeamViewer using web technologies, it can be open from a browser and display images and informations. All camera running new Bpm plugin are accessible from url @host.esrf.fr:8066.
The webserver interact with camera hardware through TANGO device servers.

Dependencies
------------
System : Linux Debian 8.11 (Jessie)

Was working with following versions

**Python**

- bottle : 0.12.13
- gevent : 1.0.1
- PyTango : 9.2.0
- struct

**JavaScript**

- node : 6.14.2
- npm : 6.1.0

other dependencies are listed in package.json, and they are installed in a node_modules directory when you run "npm install" in the package.json directory.

Run
------------
Launch webserver with python "python bpm-webserver.py". Then you can open your broswer and go to url "host_name.esrf.fr:8066", the index page will display all camera found with new BPM plugin, and display the name in green if the camera is running.
