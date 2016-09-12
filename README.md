Node.js application simulates a presence of the variable frequency drive on the network.

Intention is to simulate major values and states.
Control states are Stoped, Running.
Alarm states are Faulted, Warning.

Currently there are the following states: Healty stop, Run, Run with Warning, Faulted Stop.
The automatic sequence is per above.

Example to use:
mkdir ~/vfd_simulation
git clone https://github.com/Alex-OPTIM/vfd_simulation.git ~/vfd_simulation
node server.js


HTTP APIs:

GET /GET/status
GET /SET/drive/:driveType  - acs800, vacon_nx
 
GET /SET/debug/faster
GET /SET/debug/logger
