Node.js application simulates a presence of the variable frequency drive on the network.

# VSD Drive Comms Simulator #

Intention is to simulate major values and states.
Control states are Stopped, Running.
Alarm states are Faulted, Warning.

Currently there are the following states: Healty stop, Run, Run with Warning, Faulted Stop.
The automatic sequence is per above.

Example to use on Debian OS with Node.js v6.5.0:
`cd ~`
`git clone https://github.com/Alex-OPTIM/vfd_simulation.git`
`cd ~/vfd_simulation`
`npm install`
`sudo iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 502 -j REDIRECT --to-port 1502`
`node server.js acs800 ipAddress` //or vacon_nx and ipAddress is optional

To stop process:
CTRL+C

HTTP APIs:
GET /GET/status
GET /SET/drive/:driveType  - acs800, vacon_nx
 
GET /SET/debug/faster
GET /SET/debug/logger

GET /SET/param/:paramId/:value


## Set permanent port forwarding ##
Run in terminal
    `sudo nano /etc/rc.local`
Add after last comment
    `iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 502 -j REDIRECT --to-port 1502`
Note: `eth+` is used for the wildcard of the interfaces, could be just `eth0`