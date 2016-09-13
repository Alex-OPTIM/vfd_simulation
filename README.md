Node.js application simulates a presence of the variable frequency drive on the network.

Intention is to simulate major values and states.
Control states are Stopped, Running.
Alarm states are Faulted, Warning.

Currently there are the following states: Healty stop, Run, Run with Warning, Faulted Stop.
The automatic sequence is per above.

Example to use on Debian OS with Node.js v6.5.0:
    mkdir ~/vfd_simulation
    git clone https://github.com/Alex-OPTIM/vfd_simulation.git ~/vfd_simulation
    cd ~/vfd_simulation
    npm install
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 502 -j REDIRECT --to-port 1502
    node server.js

To stop process:
CTRL+C

HTTP APIs:

GET /GET/status
GET /SET/drive/:driveType  - acs800, vacon_nx
 
GET /SET/debug/faster
GET /SET/debug/logger


###Set permanent port forwarding###
Run in terminal
    sudo nano /etc/rc.local
Add after last comment
    iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 502 -j REDIRECT --to-port 1502
Note: eth0 could be eth1, depends on your system, check with command ifconfig